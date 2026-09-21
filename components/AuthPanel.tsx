"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { typography } from "@/lib/typography";

export type AuthMode = "login" | "signup";

const RESEND_COOLDOWN_SECONDS = 30;

const COPY: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    action: string;
    switchPrompt: string;
    switchLabel: string;
    switchHref: string;
  }
> = {
  login: {
    title: "Sign in",
    subtitle: "Good to see you again.",
    action: "Continue with email",
    switchPrompt: "New to Tutormigo?",
    switchLabel: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your free account",
    subtitle: "Free to start, no card required.",
    action: "Continue with email",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
};

/**
 * Brand-panel copy. Mode-aware because this component also backs /signup,
 * where a "welcome back" message would be wrong.
 */
const PANEL_COPY: Record<
  AuthMode,
  { eyebrow: string; headline: string; body: string; benefits: string[] }
> = {
  login: {
    eyebrow: "Welcome back",
    headline: "Pick up right where you left off.",
    body: "Your practice, progress, and study plan stay together every time you sign in.",
    benefits: [
      "Continue your personalized SAT roadmap",
      "Keep your practice history and progress",
      "Focus on the skills that need attention",
    ],
  },
  signup: {
    eyebrow: "Start here",
    headline: "Your SAT plan, built around you.",
    body: "Create an account and your roadmap, practice history, and progress follow you everywhere.",
    benefits: [
      "Get a personalized SAT roadmap",
      "Practice with 1,000+ original questions",
      "Watch every skill improve over time",
    ],
  },
};

function GoogleIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.8c4.3-2 6.9-5.1 6.9-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-2.6 1.8-7.3.5-9.9-3.4l-3.7 2.8C4 20.5 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.8 14.1a6.7 6.7 0 010-4.2V7.1H2.2a11 11 0 000 9.9l3.7-2.9z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.1C15.4.2 7.7 1.3 2.2 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
      />
    </svg>
  );
}

/**
 * Only providers enabled in the Supabase dashboard belong here — a button for
 * an unconfigured provider fails at the redirect. Add Apple/Microsoft entries
 * once they are turned on under Authentication → Providers.
 */
const OAUTH_PROVIDERS = [
  { id: "google" as const, label: "Google", icon: <GoogleIcon /> },
];

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8 5.5L20 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
    >
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3s4.5 3.6 4.5 8.2a4.5 4.5 0 01-9 0c0-1.3.5-2.4 1.2-3.3.3 1 1 1.7 1.8 1.9C10.2 7.4 12 5.6 12 3z"
      />
    </svg>
  );
}

function fieldClass() {
  return "mt-1.5 w-full rounded-xl border border-transparent bg-[#F4F4F4] px-4 py-3 font-sans text-[15px] text-arc-ink outline-none transition placeholder:text-[#A3A3A3] focus:border-arc-accent focus:bg-white";
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode];
  const params = useSearchParams();
  const nextParam = params.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function rememberNext() {
    document.cookie = `auth_next=${encodeURIComponent(next)}; Path=/; Max-Age=600; SameSite=Lax`;
  }

  async function oauth(provider: (typeof OAUTH_PROVIDERS)[number]["id"]) {
    setLoading(true);
    setMessage("");
    rememberNext();
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  const sendMagicLink = useCallback(
    async (address: string) => {
      rememberNext();
      const fullName = [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(" ");

      const { error } = await createClient().auth.signInWithOtp({
        email: address,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Signing in must not quietly create an account for a typo'd address.
          shouldCreateUser: mode === "signup",
          ...(mode === "signup" && fullName
            ? { data: { full_name: fullName } }
            : {}),
        },
      });

      return error;
      // rememberNext/next are stable for the lifetime of this form.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [firstName, lastName, mode]
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;

    setLoading(true);
    setMessage("");
    const error = await sendMagicLink(address);
    setLoading(false);

    if (error) {
      // Supabase reports a missing account this way when shouldCreateUser is off.
      const missingAccount =
        mode === "login" && /signups? not allowed/i.test(error.message);
      setMessage(
        missingAccount
          ? "We couldn't find an account for that email. Create one instead."
          : error.message
      );
      return;
    }

    setSentTo(address);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function resend() {
    if (!sentTo || cooldown > 0) return;
    setLoading(true);
    setMessage("");
    const error = await sendMagicLink(sentTo);
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  const switchHref = nextParam
    ? `${copy.switchHref}?next=${encodeURIComponent(next)}`
    : copy.switchHref;

  if (sentTo) {
    return (
      <div className="w-full text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-arc-accentSoft text-arc-accentDeep">
          <MailIcon />
        </span>
        <h1 className={`mt-5 ${typography.pageTitle}`}>Check your email</h1>
        <p className={`mt-2 ${typography.pageDescription}`}>
          We sent a sign-in link to{" "}
          <span className="font-medium text-arc-ink">{sentTo}</span>. It expires
          in 24 hours.
        </p>

        {message && (
          <p className="mt-4 font-sans text-sm text-arc-incorrect">{message}</p>
        )}

        <button
          type="button"
          onClick={resend}
          disabled={loading || cooldown > 0}
          className="arc-btn-dark mt-8 h-14 w-full text-[15px]"
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : loading
              ? "Sending…"
              : "Resend email"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setMessage("");
            setCooldown(0);
          }}
          className={`mt-4 ${typography.caption} transition hover:text-arc-ink`}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className={`text-center ${typography.pageTitle}`}>{copy.title}</h1>
      <p className={`mt-2 text-center ${typography.pageDescription} text-[15px]`}>
        {copy.subtitle}
      </p>

      <div
        className="mt-7 grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${OAUTH_PROVIDERS.length}, minmax(0, 1fr))`,
        }}
      >
        {OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => oauth(provider.id)}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-arc-line bg-white px-4 py-5 transition hover:bg-arc-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {provider.icon}
            <span className="font-sans text-sm text-arc-muted">
              {provider.label}
            </span>
          </button>
        ))}
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-arc-line" />
        <span className={typography.cardLabel}>or</span>
        <span className="h-px flex-1 bg-arc-line" />
      </div>

      <form onSubmit={submit} noValidate>
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first-name"
                className="font-sans text-sm font-medium text-arc-ink"
              >
                First name
              </label>
              <input
                id="first-name"
                name="given-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="John"
                className={fieldClass()}
              />
            </div>
            <div>
              <label
                htmlFor="last-name"
                className="font-sans text-sm font-medium text-arc-ink"
              >
                Last name
              </label>
              <input
                id="last-name"
                name="family-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Doe"
                className={fieldClass()}
              />
            </div>
          </div>
        )}

        <div className={mode === "signup" ? "mt-4" : undefined}>
          <label
            htmlFor="email"
            className="font-sans text-sm font-medium text-arc-ink"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={fieldClass()}
          />
        </div>

        {message && (
          <p className="mt-4 text-center font-sans text-sm text-arc-incorrect">
            {message}{" "}
            {message.startsWith("We couldn't find") && (
              <Link href={switchHref} className="font-medium underline">
                Create an account
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="arc-btn-dark mt-7 h-14 w-full text-[15px]"
        >
          {loading ? "Sending…" : copy.action}
        </button>
      </form>

      <p className={`mt-7 text-center ${typography.caption}`}>
        {copy.switchPrompt}{" "}
        <Link
          href={switchHref}
          className="font-medium text-arc-accent transition hover:text-arc-accentDeep"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  );
}

/**
 * The sign-in brand panel: the existing sky/grid artwork with copy laid over
 * it. The artwork stays the background rather than becoming a flat colour, so
 * a white wash (strongest at the top, gone by the horizon) buys contrast for
 * the charcoal text while leaving the grid plane visible underneath.
 */
function BrandPanel({ mode }: { mode: AuthMode }) {
  const panel = PANEL_COPY[mode];

  return (
    <div className="relative aspect-[82/100] w-full max-w-[calc((100dvh-2rem)*0.82)] overflow-hidden rounded-[1.75rem]">
      {/* The 1.42 source is wider than this portrait frame, so cover is
          height-bound and the trim comes evenly off both sides; centring keeps
          the vanishing point in the middle. */}
      <Image
        src="/backgrounds/dashboard-math-grid.webp"
        alt=""
        aria-hidden
        fill
        priority
        className="object-cover object-center"
        sizes="(min-width: 1024px) 50vw, 0px"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.66)_30%,rgba(255,255,255,0.32)_54%,rgba(255,255,255,0.08)_74%,rgba(255,255,255,0)_100%)]"
        aria-hidden
      />

      {/* A couple of product-true chips for personality — restrained, and kept
          clear of the text column by its max-w. */}
      <div className="absolute right-8 top-8 z-10 hidden items-center gap-2 rounded-xl border border-white/80 bg-white/85 px-3 py-2 backdrop-blur-sm xl:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arc-accentSoft text-arc-accentDeep">
          <FlameIcon />
        </span>
        <span className="font-sans text-[13px] font-medium text-arc-heading">
          5-day streak
        </span>
      </div>

      <div className="absolute right-6 top-[44%] z-10 w-[11.5rem] rounded-2xl border border-white/80 bg-white/85 p-3.5 backdrop-blur-sm xl:right-8">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-arc-muted">
          Mastery
        </p>
        <p className="mt-1 font-sans text-[13px] font-medium text-arc-heading">
          Linear equations
        </p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-arc-line">
          <div className="h-full w-[72%] rounded-full bg-arc-accent" />
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col p-8 xl:p-11">
        <div className="max-w-[20rem] xl:max-w-[23rem]">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-arc-accentDeep">
            {panel.eyebrow}
          </p>
          <h2
            className={`mt-3 ${typography.marketingCardTitle} text-[1.75rem] leading-[1.15] xl:text-[2.125rem]`}
          >
            {panel.headline}
          </h2>
          <p className={`mt-4 ${typography.bodySmall} xl:text-base`}>
            {panel.body}
          </p>
        </div>

        <ul className="mt-auto space-y-3 rounded-2xl border border-white/80 bg-white/80 p-5 backdrop-blur-sm xl:p-6">
          {panel.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-arc-accentSoft text-arc-accentDeep">
                <CheckIcon />
              </span>
              <span className="font-sans text-sm leading-snug text-arc-heading xl:text-[15px]">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AuthPanel({ mode }: { mode: AuthMode }) {
  return (
    <main className="relative min-h-[100dvh] bg-white p-3 sm:p-4">
      {/* Below lg the artwork is a full-bleed backdrop and the card floats on
          top of it; from lg it moves into its own column (the <aside>). */}
      <Image
        src="/backgrounds/dashboard-math-grid.webp"
        alt=""
        aria-hidden
        fill
        priority
        className="object-cover lg:hidden"
        sizes="(max-width: 1023px) 100vw, 0px"
      />

      {/* No items-center: the row stretches so the artwork fills full height. */}
      {/* The left column is sized to the panel rather than to half the row.
          The panel is height-derived, so in an even 2-column split it is often
          narrower than its column, and that surplus reads as part of the white
          area — which pushed the form off-centre against it. This template is
          the same min() the panel caps itself with, so the panel's own width is
          unchanged and the column simply stops hugging dead space. */}
      <div className="relative z-10 grid min-h-[calc(100dvh-1.5rem)] gap-8 lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[min(calc((100dvh-2rem)*0.82),calc((100vw-56px)/2))_minmax(0,1fr)] lg:gap-6">
        <section className="flex items-center justify-center px-1 py-8 lg:order-2 lg:px-2 lg:py-0">
          <div className="w-full max-w-[26rem] rounded-[1.75rem] bg-white p-6 shadow-[0_18px_50px_-12px_rgba(10,10,10,0.35)] sm:p-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
            <Link
              href="/"
              className="mb-9 flex items-center justify-center gap-2.5"
            >
              <Image
                src="/tutormigo-mark-blue.png"
                alt="Tutormigo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
              <span className="font-dm text-[28px] font-medium tracking-[-0.03em] text-[#0A0A0A]">
                Tutormigo
              </span>
            </Link>

            <Suspense
              fallback={
                <div className="h-80 w-full animate-pulse rounded-2xl bg-[#f5f5f5]" />
              }
            >
              <AuthForm mode={mode} />
            </Suspense>
          </div>
        </section>

        {/* The panel sits in the left column, but stays after the form in the
            DOM so the primary task is what a screen reader reaches first —
            safe here because the panel holds nothing focusable.
            justify-start: when the portrait frame is height-bound the leftover
            column width goes to the right, not split either side. Hidden below
            lg so small screens keep the form as the only thing on screen. */}
        <aside className="hidden items-center justify-start lg:order-1 lg:flex">
          <BrandPanel mode={mode} />
        </aside>
      </div>
    </main>
  );
}
