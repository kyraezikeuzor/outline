import "server-only";

/**
 * Minimal Resend client. Plain `fetch`, no SDK — same approach as the
 * Anthropic calls in `lib/generation/server.ts`.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Verified Resend sender. Must be on a domain verified in the Resend dashboard. */
export function getFromAddress() {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  return configured || "Tutormigo <hello@tutormigo.com>";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    // Resend returns a JSON body with `message` on failure; fall back to text
    // so a gateway error page still surfaces something useful in the logs.
    let detail = "";
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message ?? "";
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `Resend rejected the email (${response.status}). ${detail}`.trim()
    );
  }

  return (await response.json()) as { id: string };
}
