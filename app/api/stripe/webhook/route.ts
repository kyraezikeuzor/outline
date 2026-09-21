import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { parseCheckoutReference, planIdFromAmountCents } from "@/lib/pricing";

export const runtime = "nodejs";

function isoFromUnix(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function customerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof customer === "string" ? customer : customer?.id ?? null;
}

async function userIdForCustomer(stripeCustomerId: string | null) {
  if (!stripeCustomerId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function linkCustomerToProfile(studentId: string, stripeCustomerId: string | null) {
  if (!stripeCustomerId) return;
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", studentId)
    .is("stripe_customer_id", null);
}

async function syncCheckoutSession(session: Stripe.Checkout.Session) {
  const reference = parseCheckoutReference(session.client_reference_id);
  const studentId = session.metadata?.supabase_user_id ?? reference.userId;
  if (!studentId) throw new Error(`Checkout Session ${session.id} has no Supabase user ID.`);

  const stripeCustomerIdForSession = customerId(session.customer);

  // Payment Links mint a fresh customer, so record it against the profile;
  // subsequent customer.subscription.* events resolve the student from it.
  await linkCustomerToProfile(studentId, stripeCustomerIdForSession);

  if (session.mode !== "payment") {
    // Stake the student/plan mapping now. Stripe may deliver
    // customer.subscription.created before this event, and that handler has no
    // metadata of ours on a Payment Link purchase, so it resolves the student
    // by looking this row up. Period bounds are filled in by that handler.
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;
    const planId = reference.planId ?? planIdFromAmountCents(session.amount_total);

    if (subscriptionId) {
      const admin = createAdminClient();
      const { error } = await admin.from("subscriptions").upsert(
        {
          student_id: studentId,
          ...(planId ? { plan: planId } : {}),
          status: "active",
          provider: "stripe",
          stripe_customer_id: stripeCustomerIdForSession,
          stripe_subscription_id: subscriptionId,
          currency: session.currency ?? "usd",
          billing_interval: "month",
          billing_interval_count: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" }
      );
      if (error) throw new Error(error.message);
    }
    return;
  }

  const admin = createAdminClient();
  const stripeCustomerId = stripeCustomerIdForSession;
  const amountCents = session.amount_total ?? 0;

  const { error } = await admin.from("subscriptions").upsert(
    {
      student_id: studentId,
      plan: session.metadata?.plan_id ?? "plus",
      monthly_price: amountCents / 100,
      started_at: isoFromUnix(session.created),
      status:
        session.payment_status === "paid" || session.payment_status === "no_payment_required"
          ? "active"
          : session.payment_status,
      provider: "stripe",
      stripe_customer_id: stripeCustomerId,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      currency: session.currency ?? "usd",
      billing_interval: "one_time",
      billing_interval_count: 1,
      access_ends_at: session.metadata?.access_ends_at || null,
      updated_at: new Date().toISOString(),
      metadata: session.metadata ?? {},
    },
    { onConflict: "stripe_checkout_session_id" }
  );

  if (error) throw new Error(error.message);
}

async function userIdForSubscriptionRow(stripeSubscriptionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("student_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  return data?.student_id ?? null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const stripeCustomerId = customerId(subscription.customer);
  const studentId =
    subscription.metadata?.supabase_user_id ??
    (await userIdForCustomer(stripeCustomerId)) ??
    (await userIdForSubscriptionRow(subscription.id));
  if (!studentId) throw new Error(`Subscription ${subscription.id} has no Supabase user ID.`);

  const item = subscription.items.data[0];
  const amountCents = item?.price.unit_amount ?? 0;
  // A Payment Link subscription carries no metadata of ours, so fall back to
  // the amount. Never default blindly — that would relabel a Plus row as Max
  // on the next subscription.updated event.
  const resolvedPlan =
    subscription.metadata?.plan_id ?? planIdFromAmountCents(amountCents);
  const intervalCount = item?.price.recurring?.interval_count ?? 1;
  const monthlyPrice =
    item?.price.recurring?.interval === "month"
      ? amountCents / 100 / intervalCount
      : amountCents / 100;
  const admin = createAdminClient();

  const { error } = await admin.from("subscriptions").upsert(
    {
      student_id: studentId,
      ...(resolvedPlan ? { plan: resolvedPlan } : {}),
      monthly_price: monthlyPrice,
      started_at: isoFromUnix(subscription.start_date),
      status: subscription.status,
      provider: "stripe",
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: item?.price.id ?? null,
      amount_cents: amountCents,
      currency: item?.price.currency ?? "usd",
      billing_interval: item?.price.recurring?.interval ?? null,
      billing_interval_count: intervalCount,
      current_period_start: isoFromUnix(item?.current_period_start),
      current_period_end: isoFromUnix(item?.current_period_end),
      access_ends_at: isoFromUnix(item?.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: isoFromUnix(subscription.canceled_at),
      updated_at: new Date().toISOString(),
      metadata: subscription.metadata ?? {},
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature error", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await syncCheckoutSession(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook handling failed for ${event.id}`, error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

