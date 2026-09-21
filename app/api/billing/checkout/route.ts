import { NextResponse } from "next/server";
import {
  buildCheckoutReference,
  CheckoutPlanId,
  getConfiguredStripePriceId,
  getPaymentLink,
  getPlanTier,
  getStripeProductId,
  isCheckoutPlanId,
  MAX_MONTHLY_PRICE_DOLLARS,
  PLUS_MONTHLY_PRICE_DOLLARS,
  toCents,
} from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateStripeCustomer,
  getRequestOrigin,
  getStripe,
} from "@/lib/stripe/server";

export const runtime = "nodejs";

function planAmountDollars(planId: CheckoutPlanId) {
  return planId === "plus"
    ? PLUS_MONTHLY_PRICE_DOLLARS
    : MAX_MONTHLY_PRICE_DOLLARS;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { planId?: unknown };

    if (!isCheckoutPlanId(body.planId)) {
      return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
    }

    const planId = body.planId;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const origin = getRequestOrigin(request);
    const pricingQuery = new URLSearchParams({ plan: planId });

    if (!user) {
      const returnPath = `/pricing?${pricingQuery.toString()}`;
      return NextResponse.json(
        {
          error: "AUTH_REQUIRED",
          loginUrl: `/login?next=${encodeURIComponent(returnPath)}`,
        },
        { status: 401 }
      );
    }

    const clientReference = buildCheckoutReference(user.id, planId);
    const configuredPriceId = getConfiguredStripePriceId(planId);

    // Preferred path: our own Checkout Session against the configured Price, so
    // the session carries supabase_user_id metadata. Only when a plan has no
    // Price configured do we fall back to a hosted Payment Link, which cannot
    // carry metadata and leans on client_reference_id instead.
    if (!configuredPriceId) {
      const paymentLink = getPaymentLink(planId);
      if (paymentLink) {
        const url = new URL(paymentLink);
        url.searchParams.set("client_reference_id", clientReference);
        return NextResponse.json({ url: url.toString() });
      }
    }

    const customer = await getOrCreateStripeCustomer(user);
    const amountCents = toCents(planAmountDollars(planId));
    const metadata = {
      supabase_user_id: user.id,
      plan_id: planId,
      // Both tiers are monthly subscriptions, so access is bounded by the
      // billing period rather than a fixed end date like `until_sat` had.
      access_ends_at: "",
    };

    const configuredProductId = getStripeProductId(planId);
    const tier = getPlanTier(planId);

    // Inline price, used when no Price id is configured for this mode. Attach
    // it to the configured Product when there is one so Dashboard reporting
    // stays on a single product; otherwise let Stripe create one, which is what
    // makes a fresh test-mode environment work with no configuration at all.
    const inlinePriceData = {
      currency: "usd" as const,
      unit_amount: amountCents,
      recurring: { interval: "month" as const, interval_count: 1 },
      ...(configuredProductId
        ? { product: configuredProductId }
        : {
            product_data: {
              name: `Tutormigo ${tier.name}`,
              metadata: { plan_id: planId },
            },
          }),
    };

    const lineItem = configuredPriceId
      ? { quantity: 1, price: configuredPriceId }
      : { quantity: 1, price_data: inlinePriceData };

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: clientReference,
      line_items: [lineItem],
      metadata,
      subscription_data: { metadata },
      success_url: `${origin}/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=canceled&${pricingQuery.toString()}`,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start Checkout." },
      { status: 500 }
    );
  }
}
