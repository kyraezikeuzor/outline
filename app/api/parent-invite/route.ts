import { NextResponse } from "next/server";
import {
  parentInviteSubject,
  renderParentInvite,
} from "@/lib/email/parent-invite";
import { isEmailConfigured, sendEmail } from "@/lib/email/resend";
import { isCheckoutPlanId } from "@/lib/pricing";
import { getRequestOrigin } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      parentName?: unknown;
      parentEmail?: unknown;
      studentName?: unknown;
      planId?: unknown;
    };

    const parentEmail = clean(body.parentEmail, 254);
    const parentName = clean(body.parentName, 80);
    const studentName = clean(body.studentName, 80) || "Your student";
    const planId = isCheckoutPlanId(body.planId) ? body.planId : "plus";

    if (!EMAIL_PATTERN.test(parentEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    // This sends mail from our domain to an address a visitor typed in, so it
    // is gated behind a signed-in account rather than left open to anyone.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "AUTH_REQUIRED",
          loginUrl: `/login?next=${encodeURIComponent("/pricing")}`,
        },
        { status: 401 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "Email is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const origin = getRequestOrigin(request);

    await sendEmail({
      to: parentEmail,
      subject: parentInviteSubject(studentName, planId),
      html: renderParentInvite({
        parentName,
        studentName,
        planId,
        pricingUrl: `${origin}/pricing?plan=${planId}`,
        logoUrl: `${origin}/tutormigo-mark-blue.png`,
      }),
      // Replies go to the student who asked, not into a void.
      replyTo: user.email ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Parent invite email error", error);
    return NextResponse.json(
      { error: "Unable to send that email right now." },
      { status: 500 }
    );
  }
}
