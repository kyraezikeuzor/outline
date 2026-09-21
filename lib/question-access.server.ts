import "server-only";

import { cache } from "react";
import {
  FREE_QUESTION_LIMIT,
  type QuestionAccess,
} from "@/lib/access-policy";
import { isLegacyPaidPlanId } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SubscriptionRow = {
  plan: string;
  status: string;
  provider: string | null;
  access_ends_at: string | null;
  current_period_end: string | null;
  updated_at: string | null;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function hasCurrentAccess(subscription: SubscriptionRow, now: number) {
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) return false;
  const end = subscription.access_ends_at ?? subscription.current_period_end;
  return !end || new Date(end).getTime() > now;
}

/**
 * Which entitlement level a stored `subscriptions.plan` grants. Legacy plans
 * predate the Free/Plus/Max split and bundled the Roadmap and live lessons, so
 * they resolve to Max rather than Plus.
 */
function planEntitlement(planId: string): "plus" | "max" {
  if (planId === "plus") return "plus";
  if (planId === "max") return "max";
  if (isLegacyPaidPlanId(planId)) return "max";
  return "plus";
}

function planLabel(planId: string) {
  if (planId === "plus") return "Plus";
  if (planId === "max") return "Max";
  if (planId === "until_sat") return "Max · Until SAT (legacy)";
  if (planId === "monthly") return "Max · 1 Month (legacy)";
  if (planId === "quarterly") return "Max · 3 Months (legacy)";
  if (planId === "six_months") return "Max · 6 Months (legacy)";
  if (planId === "bootcamp") return "Max · Bootcamp";
  return "Plus";
}

export async function getQuestionAccessForUser(
  userId: string,
  attemptedQuestionIds?: Iterable<string>
): Promise<QuestionAccess> {
  const admin = createAdminClient();
  const [profileResult, subscriptionsResult, attemptsResult] = await Promise.all([
    admin.from("profiles").select("role").eq("id", userId).maybeSingle(),
    admin
      .from("subscriptions")
      .select(
        "plan, status, provider, access_ends_at, current_period_end, updated_at"
      )
      .eq("student_id", userId)
      .order("updated_at", { ascending: false }),
    attemptedQuestionIds
      ? Promise.resolve({ data: null, error: null })
      : admin.from("attempts").select("question_id").eq("user_id", userId),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Unable to load profile access: ${profileResult.error.message}`
    );
  }
  if (subscriptionsResult.error) {
    throw new Error(
      `Unable to load subscription access: ${subscriptionsResult.error.message}`
    );
  }
  if (attemptsResult.error) {
    throw new Error(
      `Unable to load question usage: ${attemptsResult.error.message}`
    );
  }

  const attemptedIds = new Set<string>();
  if (attemptedQuestionIds) {
    for (const questionId of attemptedQuestionIds) attemptedIds.add(questionId);
  } else {
    for (const row of attemptsResult.data ?? []) {
      if (row.question_id) attemptedIds.add(String(row.question_id));
    }
  }

  const now = Date.now();
  const activeSubscription = (
    (subscriptionsResult.data ?? []) as SubscriptionRow[]
  ).find((subscription) => hasCurrentAccess(subscription, now));
  const isAdmin = profileResult.data?.role === "admin";
  const isPro = isAdmin || Boolean(activeSubscription);
  const uniqueQuestionsUsed = attemptedIds.size;

  if (isPro) {
    const adminOnly = isAdmin && !activeSubscription;
    const planId = adminOnly ? "admin" : activeSubscription!.plan;
    return {
      // Admins get the top tier implicitly, as they did before the split.
      tier: adminOnly ? "max" : planEntitlement(planId),
      planId,
      planLabel: adminOnly ? "Max · Admin" : planLabel(planId),
      isPro: true,
      uniqueQuestionsUsed,
      questionLimit: null,
      remainingQuestions: null,
      canAccessNewQuestion: true,
      accessEndsAt:
        activeSubscription?.access_ends_at ??
        activeSubscription?.current_period_end ??
        null,
      provider: activeSubscription?.provider ?? (isAdmin ? "admin" : null),
    };
  }

  const remainingQuestions = Math.max(
    0,
    FREE_QUESTION_LIMIT - uniqueQuestionsUsed
  );
  return {
    tier: "free",
    planId: "free",
    planLabel: "Free",
    isPro: false,
    uniqueQuestionsUsed,
    questionLimit: FREE_QUESTION_LIMIT,
    remainingQuestions,
    canAccessNewQuestion: remainingQuestions > 0,
    accessEndsAt: null,
    provider: null,
  };
}

export const getCurrentQuestionAccess = cache(
  async (): Promise<QuestionAccess> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        tier: "free",
        planId: "free",
        planLabel: "Free",
        isPro: false,
        uniqueQuestionsUsed: 0,
        questionLimit: FREE_QUESTION_LIMIT,
        remainingQuestions: FREE_QUESTION_LIMIT,
        canAccessNewQuestion: true,
        accessEndsAt: null,
        provider: null,
      };
    }

    return getQuestionAccessForUser(user.id);
  }
);
