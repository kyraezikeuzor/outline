import "server-only";

import { formatPrice, getPlanTier, type CheckoutPlanId } from "@/lib/pricing";

/**
 * Parent invite email.
 *
 * Copy rules: describe only what Tutormigo actually does. No score guarantees,
 * no invented ratings or testimonial counts. The features listed come straight
 * from the plan catalog so the email can never drift from the pricing page.
 */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ParentInviteInput = {
  parentName: string;
  studentName: string;
  planId: CheckoutPlanId;
  pricingUrl: string;
  logoUrl: string;
};

export function parentInviteSubject(studentName: string, planId: CheckoutPlanId) {
  const tier = getPlanTier(planId);
  return `${studentName} is asking about Tutormigo ${tier.name}`;
}

export function renderParentInvite({
  parentName,
  studentName,
  planId,
  pricingUrl,
  logoUrl,
}: ParentInviteInput) {
  const tier = getPlanTier(planId);
  const student = escapeHtml(studentName);
  const greeting = parentName.trim() ? `Hi ${escapeHtml(parentName)},` : "Hi,";
  // cadence is either "/month" (no space) or a word like "forever".
  const priceLine = tier.cadence.startsWith("/")
    ? `${formatPrice(tier.price)}${tier.cadence}`
    : `${formatPrice(tier.price)} ${tier.cadence}`;

  const features = tier.features
    .map(
      (feature) =>
        `<li style="margin:0 0 10px;color:#3f3f46;font-size:15px;line-height:22px;">${escapeHtml(
          feature
        )}</li>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;padding:36px 32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${escapeHtml(logoUrl)}" alt="Tutormigo" width="40" height="40" style="display:block;border:0;" />
                <div style="margin-top:10px;font-size:22px;font-weight:600;color:#0a0a0a;">Tutormigo</div>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:18px;">
                <h1 style="margin:0;font-size:22px;line-height:30px;font-weight:600;color:#0a0a0a;">
                  ${student} is asking about Tutormigo ${escapeHtml(tier.name)}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px;line-height:23px;color:#3f3f46;">
                <p style="margin:0 0 14px;">${greeting}</p>
                <p style="margin:0 0 14px;">
                  ${student} has been practicing for the SAT on Tutormigo and asked us to send
                  you the details of the ${escapeHtml(tier.name)} plan.
                </p>
                <p style="margin:0 0 10px;">What ${escapeHtml(tier.name)} includes:</p>
                <ul style="margin:0 0 18px;padding-left:20px;">${features}</ul>
                <p style="margin:0 0 22px;">
                  ${escapeHtml(tier.name)} is <strong>${escapeHtml(priceLine)}</strong>.
                  ${escapeHtml(tier.billingNote)}
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:22px;">
                <a href="${escapeHtml(pricingUrl)}"
                   style="display:inline-block;background:#1bb1f6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:999px;">
                  See the ${escapeHtml(tier.name)} plan
                </a>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;line-height:20px;color:#747474;border-top:1px solid #ececec;padding-top:18px;">
                <p style="margin:0 0 10px;">
                  <strong>To put the plan on ${student}'s account,</strong> sign in as
                  ${student} before checking out — a subscription is applied to whichever
                  account is signed in at the time.
                </p>
                <p style="margin:0;">
                  Questions? Just reply to this email and it will reach us directly.
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;padding:18px 8px 0;">
            <tr>
              <td align="center" style="font-size:12px;line-height:18px;color:#8a8a8a;">
                You received this because ${student} entered your address on Tutormigo.
                <br />
                SAT&reg; is a trademark of College Board, which is not affiliated with Tutormigo.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
