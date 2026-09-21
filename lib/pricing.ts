/**
 * Plan catalog. Three tiers: Free, Plus and Max. Both paid tiers are monthly
 * Stripe subscriptions; Plus is the self-study plan and Max adds the guided
 * layer (roadmap, live lessons, office hours).
 *
 * This replaced an earlier model where a single "Pro" plan was sold at four
 * billing cadences (`until_sat`, `monthly`, `quarterly`, `six_months`). Those
 * ids still exist in `subscriptions.plan` for anyone who bought before the
 * change — see LEGACY_PAID_PLAN_IDS below and the resolution in
 * `lib/question-access.server.ts`. Don't reuse those ids for new checkouts.
 */

export const PLUS_MONTHLY_PRICE_DOLLARS = 29.99;
export const MAX_MONTHLY_PRICE_DOLLARS = 59.99;

export type PlanTierId = "free" | "plus" | "max";

/** The tiers that actually go through Stripe Checkout. */
export type CheckoutPlanId = Exclude<PlanTierId, "free">;

/** Kept as an alias so existing `PricingPlanId` imports keep compiling. */
export type PricingPlanId = CheckoutPlanId;

export const CHECKOUT_PLAN_IDS: CheckoutPlanId[] = ["plus", "max"];

export function isCheckoutPlanId(value: unknown): value is CheckoutPlanId {
  return (
    typeof value === "string" &&
    CHECKOUT_PLAN_IDS.includes(value as CheckoutPlanId)
  );
}

/**
 * Plans sold before the Free/Plus/Max split. Everyone on one of these bought
 * the bundle that included the Roadmap and live lessons, so they resolve to
 * Max-level entitlements rather than Plus.
 */
export const LEGACY_PAID_PLAN_IDS = [
  "until_sat",
  "monthly",
  "quarterly",
  "six_months",
  "bootcamp",
] as const;

export type LegacyPaidPlanId = (typeof LEGACY_PAID_PLAN_IDS)[number];

export function isLegacyPaidPlanId(value: unknown): value is LegacyPaidPlanId {
  return (
    typeof value === "string" &&
    (LEGACY_PAID_PLAN_IDS as readonly string[]).includes(value)
  );
}

export type PlanTier = {
  id: PlanTierId;
  name: string;
  /** Dollars. 0 for Free. */
  price: number;
  /** Sits beside the amount: "forever" or "/month". */
  cadence: string;
  /** Ribbon above the card. */
  badge: string | null;
  /** One line under the price. */
  billingNote: string;
  /** Rendered above the feature list on inheriting tiers. */
  inheritsLabel: string | null;
  features: string[];
  cta: string;
};

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    badge: null,
    billingNote: "No credit card required.",
    inheritsLabel: null,
    features: [
      "Explore a limited selection of SAT questions",
      "Clear answer explanations",
      "Save questions and review mistakes",
      "Basic progress tracking",
    ],
    cta: "Continue with Free",
  },
  {
    id: "plus",
    name: "Plus",
    price: PLUS_MONTHLY_PRICE_DOLLARS,
    cadence: "/month",
    badge: "Best Value",
    billingNote: "Billed monthly. Cancel anytime.",
    inheritsLabel: null,
    features: [
      "Full access to 1,000+ original SAT questions",
      "Full answer explanations",
      "Saved questions and mistake review",
      "Full progress, streak, and accuracy tracking",
      "Access to adaptive practice and question sets",
    ],
    cta: "Get Plus",
  },
  {
    id: "max",
    name: "Max",
    price: MAX_MONTHLY_PRICE_DOLLARS,
    cadence: "/month",
    badge: "Guided Prep",
    billingNote: "Billed monthly. Cancel anytime.",
    inheritsLabel: "Everything in Plus, plus:",
    features: [
      "Personalized weekly SAT roadmap",
      "Weekly live Math and Reading & Writing lessons",
      "Open office hours for student questions",
      "Adaptive practice tuned to your recent performance",
      "Priority support for questions and feedback",
    ],
    cta: "Get Max",
  },
];

export function getPlanTier(planId: PlanTierId): PlanTier {
  return PLAN_TIERS.find((tier) => tier.id === planId) ?? PLAN_TIERS[0];
}

/**
 * Stripe Price ids, per tier. Preferred checkout path: we create the Checkout
 * Session ourselves, so it carries `supabase_user_id` metadata and the webhook
 * can attribute the purchase without parsing `client_reference_id`.
 *
 * Deliberately env-only with no baked-in default. Price ids are mode-specific —
 * a live `price_...` is a 404 against a test key and vice versa — so hardcoding
 * the production ids would break every test-mode environment. Set these per
 * deployment; unset falls through to the inline price below, which works in
 * either mode. The live ids are listed in `.env.example`.
 */
export const STRIPE_PRICE_ENV_VARS: Record<CheckoutPlanId, string> = {
  plus: "STRIPE_PLUS_PRICE_ID",
  max: "STRIPE_MAX_PRICE_ID",
};

export function getConfiguredStripePriceId(planId: CheckoutPlanId) {
  const value = process.env[STRIPE_PRICE_ENV_VARS[planId]];
  return value && value.trim() ? value.trim() : null;
}

/**
 * Stripe Payment Links, one per paid tier. Overridable by env so test-mode
 * links can be swapped in without a code change.
 *
 * Payment Links cannot carry Checkout metadata, so the buyer and the plan are
 * threaded through `client_reference_id` instead — see buildCheckoutReference
 * below and the webhook that parses it.
 */
/**
 * Payment Links are a fallback, not the default: they cannot carry Checkout
 * metadata, so they are only used when a plan has no Price id configured.
 * Env-only for the same mode reason as the ids above — and because a link dies
 * the moment its underlying price is replaced.
 */

const PAYMENT_LINK_ENV_VARS: Record<CheckoutPlanId, string> = {
  plus: "STRIPE_PLUS_PAYMENT_LINK",
  max: "STRIPE_MAX_PAYMENT_LINK",
};

export function getPaymentLink(planId: CheckoutPlanId) {
  const value = process.env[PAYMENT_LINK_ENV_VARS[planId]];
  return value && value.trim() ? value.trim() : null;
}

/**
 * The live Stripe Products behind each tier. These are `prod_` ids, not
 * `price_` ids, so they cannot be passed as `line_items.price` — they are used
 * as `price_data.product` in the Checkout Session fallback so it reuses the
 * real product instead of creating a throwaway one per purchase.
 */
const PRODUCT_ID_ENV_VARS: Record<CheckoutPlanId, string> = {
  plus: "STRIPE_PLUS_PRODUCT_ID",
  max: "STRIPE_MAX_PRODUCT_ID",
};

export function getStripeProductId(planId: CheckoutPlanId) {
  const value = process.env[PRODUCT_ID_ENV_VARS[planId]];
  return value && value.trim() ? value.trim() : null;
}

const REFERENCE_SEPARATOR = "__";

/**
 * `client_reference_id` is the only field a Payment Link lets us set from the
 * URL, so it carries both the Supabase user and the plan they picked.
 * Stripe allows alphanumerics, underscores and hyphens, up to 200 chars.
 */
export function buildCheckoutReference(userId: string, planId: CheckoutPlanId) {
  return `${userId}${REFERENCE_SEPARATOR}${planId}`;
}

export function parseCheckoutReference(reference: string | null | undefined) {
  if (!reference) return { userId: null, planId: null };
  const index = reference.lastIndexOf(REFERENCE_SEPARATOR);
  if (index === -1) return { userId: reference, planId: null };
  const planId = reference.slice(index + REFERENCE_SEPARATOR.length);
  return {
    userId: reference.slice(0, index) || null,
    planId: isCheckoutPlanId(planId) ? planId : null,
  };
}

/**
 * Last-resort plan attribution when neither metadata nor the reference says
 * which tier was bought — the amount is the only other signal we have.
 */
export function toCents(dollars: number) {
  // Round rather than truncate: not every two-decimal price survives a raw
  // float multiply (8.22 * 100 === 821.9999999999999).
  return Math.round(dollars * 100);
}

export function planIdFromAmountCents(
  amountCents: number | null | undefined
): CheckoutPlanId | null {
  if (amountCents == null) return null;
  if (amountCents === toCents(PLUS_MONTHLY_PRICE_DOLLARS)) return "plus";
  if (amountCents === toCents(MAX_MONTHLY_PRICE_DOLLARS)) return "max";
  return null;
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
