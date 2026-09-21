"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import MarketingNavbar from "@/components/MarketingNavbar";
import CheckoutButton from "@/components/billing/CheckoutButton";
import {
  formatPrice,
  getPlanTier,
  PLAN_TIERS,
  type CheckoutPlanId,
} from "@/lib/pricing";
import { typography } from "@/lib/typography";

const COMPARISON_ROWS: {
  label: string;
  free: boolean | string;
  plus: boolean | string;
  max: boolean | string;
}[] = [
  { label: "Original SAT-style practice", free: "Limited", plus: "Full access", max: "Full access" },
  { label: "Worked answer explanations", free: true, plus: true, max: true },
  { label: "Saved questions and mistake review", free: true, plus: true, max: true },
  { label: "Progress, streak, and accuracy tracking", free: "Basic", plus: "Full", max: "Full" },
  { label: "Adaptive practice and question sets", free: false, plus: true, max: true },
  { label: "Personalized weekly SAT roadmap", free: false, plus: false, max: true },
  { label: "Weekly live lessons", free: false, plus: false, max: true },
  { label: "Office hours and Q&A", free: false, plus: false, max: true },
];

const FAQS = [
  {
    question: "What is the difference between Plus and Max?",
    answer:
      `Plus is the self-study plan: ${formatPrice(
        getPlanTier("plus").price
      )} a month unlocks the full question bank, worked explanations, progress tracking, and adaptive practice. Max adds the guided layer on top — a personalized weekly roadmap, weekly live Math and Reading & Writing lessons, and open office hours. Both are billed monthly and can be canceled once the test is done.`,
  },
  {
    question: "Can I start without paying?",
    answer:
      "Yes. The Free plan lets students explore the practice experience before choosing Plus or Max. No credit card is required to create an account.",
  },
  {
    question: "Is Tutormigo affiliated with College Board?",
    answer:
      "No. Tutormigo is an independent SAT prep platform. Its questions are original and are not official College Board materials.",
  },
  {
    question: "Can a parent or guardian pay for a plan?",
    answer:
      "Yes. Use the “Ask a parent” button to prepare an email with the plan details and a link back to this page.",
  },
];

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
        muted ? "bg-[#F1F1F1] text-[#747474]" : "bg-[#E4F7FF] text-[#079FDF]"
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.25 4.25L19 7" />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16 5-5 4 4 7-8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h5v5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}



function StudentAvatars() {
  const avatars = [
    { initial: "E", background: "#FFE4F1", color: "#B92F72" },
    { initial: "R", background: "#E4F7FF", color: "#087FAE" },
    { initial: "M", background: "#EAF8EE", color: "#247A48" },
  ];

  return (
    <div className="flex -space-x-3" aria-label="Tutormigo students">
      {avatars.map((avatar) => (
        <span
          key={avatar.initial}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-white font-sans text-sm font-semibold shadow-sm"
          style={{ backgroundColor: avatar.background, color: avatar.color }}
          aria-label={`Student ${avatar.initial}`}
        >
          {avatar.initial}
        </span>
      ))}
    </div>
  );
}

function ComparisonValue({ value, featured = false }: { value: boolean | string; featured?: boolean }) {
  if (typeof value === "string") {
    return <span className={featured ? "font-semibold text-[#0A0A0A]" : "text-[#747474]"}>{value}</span>;
  }

  return value ? (
    <span className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${featured ? "bg-[#1BB1F6] text-white" : "bg-[#F1F1F1] text-[#747474]"}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-label="Included">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.25 4.25L19 7" />
      </svg>
    </span>
  ) : (
    <span className="mx-auto block h-px w-4 bg-[#CFCFCF]" aria-label="Not included" />
  );
}

function ParentEmailModal({
  onClose,
  planId,
  planLabel,
  priceLabel,
}: {
  onClose: () => void;
  planId: CheckoutPlanId;
  planLabel: string;
  priceLabel: string;
}) {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/parent-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentName, parentEmail, studentName, planId }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        loginUrl?: string;
        error?: string;
      };

      if (response.status === 401 && result.loginUrl) {
        window.location.assign(result.loginUrl);
        return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to send that email.");

      setStatus("sent");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send that email.");
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border-2 border-white/30 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[34rem] overflow-hidden bg-[linear-gradient(155deg,#E7F8FF_0%,#F1FBFF_45%,#FFF2F8_100%)] p-10 md:flex md:flex-col md:justify-end">
          <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-[#91DDFF]/55 blur-3xl" />
          <div className="absolute -right-16 top-32 h-52 w-52 rounded-full bg-[#F6A8D1]/45 blur-3xl" />
          <div className="relative mb-auto grid h-20 w-20 place-items-center rounded-[1.7rem] border-2 border-white bg-[#1BB1F6] shadow-[0_16px_35px_rgba(27,177,246,0.24)]">
            <Image src="/tutormigo-mark-white.png" alt="" width={58} height={58} className="h-14 w-14 object-contain" />
          </div>
          <p className={`relative mb-3 ${typography.marketingSectionTitle}`}>
            SAT prep is easier with a team.
          </p>
          <p className="relative max-w-sm font-sans text-base leading-7 text-[#747474]">
            We&apos;ll send them a short summary of the plan, with your name on it, so they know exactly what you&apos;re asking for.
          </p>
        </div>

        <div className="relative p-6 sm:p-9 md:p-11">
          <button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-[#747474] transition hover:bg-[#F4F4F4] hover:text-[#0A0A0A]" aria-label="Close">
            <CloseIcon />
          </button>
          <p className="mb-2 text-sm font-semibold text-[#079FDF]">PARENT OR GUARDIAN</p>
          <h2 id="parent-modal-title" className={`pr-10 ${typography.marketingCardTitle}`}>
            Share Tutormigo {planLabel}
          </h2>
          <p className="mt-3 font-sans text-base leading-7 text-[#747474]">
            Add their details and we&apos;ll email them the {planLabel} plan details. Replies come straight back to you.
          </p>

          {status === "sent" ? (
            <div className="mt-7 rounded-2xl border-2 border-[#CAEFFF] bg-[#F2FBFF] p-6">
              <p className="font-sans text-base font-semibold text-[#0A0A0A]">
                Email sent to {parentEmail}.
              </p>
              <p className="mt-2 font-sans text-sm leading-6 text-[#525252]">
                They have the {planLabel} details and a link to the pricing page.
                If they reply, it comes back to you.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="arc-btn-secondary mt-5 h-10 px-5 text-sm"
              >
                Done
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block font-sans text-sm font-medium text-[#525252]">Parent or guardian&apos;s first name</span>
              <input value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="e.g. Sarah" className="h-12 w-full rounded-xl border-2 border-[#E8E8E8] bg-[#F7F7F7] px-4 font-sans text-base text-[#0A0A0A] outline-none transition placeholder:text-[#A1A1A1] focus:border-[#1BB1F6] focus:bg-white" />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-sm font-medium text-[#525252]">Their email</span>
              <input required type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="parent@example.com" className="h-12 w-full rounded-xl border-2 border-[#E8E8E8] bg-[#F7F7F7] px-4 font-sans text-base text-[#0A0A0A] outline-none transition placeholder:text-[#A1A1A1] focus:border-[#1BB1F6] focus:bg-white" />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-sm font-medium text-[#525252]">Your name</span>
              <input required value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="e.g. Jordan" className="h-12 w-full rounded-xl border-2 border-[#E8E8E8] bg-[#F7F7F7] px-4 font-sans text-base text-[#0A0A0A] outline-none transition placeholder:text-[#A1A1A1] focus:border-[#1BB1F6] focus:bg-white" />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex h-13 min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-[#1BB1F6] px-5 font-sans text-base font-semibold text-white transition hover:bg-[#079FDF] disabled:cursor-wait disabled:opacity-70"
            >
              {status === "sending" ? "Sending…" : <>Send email <ArrowIcon /></>}
            </button>
            {error ? (
              <p role="alert" className="font-sans text-sm text-red-600">{error}</p>
            ) : null}
            <p className="font-sans text-xs leading-5 text-[#8A8A8A]">
              {planLabel} is {priceLabel}. To put it on your account, be signed in
              as yourself when checkout is completed.
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [showParentModal, setShowParentModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const plusTier = getPlanTier("plus");

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#FFFFFF] text-[#0A0A0A]">
      <MarketingNavbar currentPage="pricing" />

      <section className="relative px-5 pb-3 pt-20 sm:px-8 sm:pb-4 sm:pt-24 lg:px-10 lg:pt-28">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className={`${typography.marketingPageTitle} !text-4xl sm:!text-[2.75rem] lg:!text-5xl`}>
            <span className="block">Ace the SAT with 1,000+ questions</span>
            <span className="block">&amp; expert live tutoring</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <StudentAvatars />
            <p className="font-sans text-lg leading-8 text-[#747474] sm:text-xl">
              Learn directly from Kyra, a 1560 scorer &amp; Ivy League student
            </p>
          </div>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border-2 border-[#E5E5E5] bg-transparent px-5 py-2.5 font-sans text-sm font-medium text-[#525252] sm:text-base">
            <span className="text-[#16A765]">
              <TrendUpIcon />
            </span>
            <span>Tutormigo students improve SAT scores on average</span>
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-20 px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mx-auto max-w-2xl pb-8 text-center font-sans text-sm text-[#747474] sm:pb-10">
            Start free, upgrade when you are ready. Plus and Max both unlock the
            full question bank.
          </p>

          <div className="mx-auto grid max-w-[64rem] items-stretch gap-5 md:grid-cols-3">
            {PLAN_TIERS.map((tier) => {
              const isPlus = tier.id === "plus";
              const isMax = tier.id === "max";

              const shell = isPlus
                ? "border-[#1BB1F6] bg-[#1BB1F6] shadow-[0_14px_38px_rgba(27,177,246,0.13)]"
                : isMax
                  ? "border-[#0A0A0A] bg-[#0A0A0A] shadow-[0_14px_38px_rgba(10,10,10,0.13)]"
                  : "border-[#E2E2E2] bg-[#F1F1F1] shadow-[0_12px_34px_rgba(24,24,27,0.05)]";
              const inner = isPlus
                ? "border-[#BDE8FA]"
                : isMax
                  ? "border-[#2D2D2D]"
                  : "border-[#E5E5E5]";
              const nameColor = isPlus || isMax ? "text-white" : "text-[#747474]";

              return (
                <article
                  key={tier.id}
                  className={`relative flex flex-col rounded-[1.65rem] border-2 p-[6px] ${shell}`}
                >
                  {tier.badge ? (
                    <div
                      className={`absolute -top-4 left-7 rounded-full border-2 bg-white px-4 py-2 font-sans text-xs font-bold uppercase tracking-[0.1em] ${
                        isPlus
                          ? "border-[#1BB1F6] text-[#079FDF] shadow-[0_6px_18px_rgba(27,177,246,0.18)]"
                          : "border-[#0A0A0A] text-[#0A0A0A] shadow-[0_6px_18px_rgba(10,10,10,0.18)]"
                      }`}
                    >
                      {tier.badge}
                    </div>
                  ) : null}

                  <header className="px-3 pb-2 pt-3">
                    <p className={`font-sans text-2xl font-semibold ${nameColor}`}>
                      {tier.name}
                    </p>
                  </header>

                  <div className={`flex flex-1 flex-col rounded-[1.35rem] border-2 bg-white p-4 ${inner}`}>
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                      <span className="font-dm text-[2.65rem] font-medium tracking-normal text-[#3F3F46]">
                        {formatPrice(tier.price)}
                      </span>
                      <span className="pb-1 font-sans text-sm text-[#747474]">
                        {tier.cadence}
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-sm leading-5 text-[#747474]">
                      {tier.billingNote}
                    </p>

                    <div
                      className={`my-4 h-px ${
                        isPlus ? "bg-[#CAEFFF]" : isMax ? "bg-[#E2E2E2]" : "bg-[#E8E8E8]"
                      }`}
                    />

                    {tier.inheritsLabel ? (
                      <p className="mb-2.5 font-sans text-sm font-semibold text-[#0A0A0A]">
                        {tier.inheritsLabel}
                      </p>
                    ) : null}

                    <ul className="grid gap-y-1.5">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-2.5 font-sans text-[15px] leading-5 ${
                            tier.id === "free" ? "text-[#525252]" : "text-[#313131]"
                          }`}
                        >
                          <CheckIcon muted={tier.id === "free"} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-4">
                      {tier.id === "free" ? (
                        <Link
                          href="/signup"
                          className="arc-btn-secondary h-10 w-full gap-2 px-4 text-sm"
                        >
                          {tier.cta} <ArrowIcon />
                        </Link>
                      ) : (
                        <CheckoutButton
                          planId={tier.id === "max" ? "max" : "plus"}
                          variant={isMax ? "dark" : "primary"}
                        />
                      )}
                      {isPlus ? (
                        <button
                          type="button"
                          onClick={() => setShowParentModal(true)}
                          className="arc-btn-secondary mt-2 h-9 w-full px-4 text-base"
                        >
                          Ask a parent to pay
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="compare" className="scroll-mt-20 border-y-2 border-[#E8E8E8] bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[#079FDF]">Compare plans</p>
            <h2 className={`mt-3 ${typography.marketingSectionTitle}`}>Know exactly what you&apos;re getting.</h2>
            <p className="mt-4 font-sans text-lg leading-8 text-[#747474]">Free is for trying the practice experience. Plus unlocks the whole question bank. Max adds the weekly roadmap and live instruction on top.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-[1.7rem] border-2 border-[#E8E8E8]">
            <div className="grid grid-cols-[minmax(0,1.6fr)_0.6fr_0.6fr_0.6fr] bg-[#F7F7F7] px-5 py-4 font-sans text-sm font-semibold text-[#525252] sm:px-7">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center text-[#079FDF]">Plus</span>
              <span className="text-center text-[#0A0A0A]">Max</span>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.label} className="grid min-h-[4.5rem] grid-cols-[minmax(0,1.6fr)_0.6fr_0.6fr_0.6fr] items-center border-t border-[#E8E8E8] px-5 py-4 font-sans text-sm sm:px-7 sm:text-base">
                <span className="pr-3 font-medium text-[#525252]">{row.label}</span>
                <span className="text-center"><ComparisonValue value={row.free} /></span>
                <span className="text-center"><ComparisonValue value={row.plus} featured /></span>
                <span className="text-center"><ComparisonValue value={row.max} featured /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[#079FDF]">FAQs</p>
            <h2 className={`mt-3 ${typography.marketingSectionTitle}`}>A few things parents ask.</h2>
          </div>
          <div className="divide-y-2 divide-[#E8E8E8] border-y-2 border-[#E8E8E8]">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left font-sans text-base font-semibold text-[#0A0A0A] sm:text-lg" aria-expanded={isOpen}>
                    {faq.question}
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F2F2F2] text-xl font-normal transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {isOpen ? <p className="pb-6 pr-10 font-sans text-base leading-7 text-[#747474]">{faq.answer}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#0A0A0A] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#1BB1F6]/35 blur-3xl" />
          <div className="absolute -bottom-28 -right-10 h-64 w-64 rounded-full bg-[#E54D96]/30 blur-3xl" />
          <h2 className="relative font-dm text-3xl font-medium leading-[1.08] tracking-normal text-white sm:text-4xl">
            Start where you are.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl font-sans text-lg leading-8 text-white/70">Try Tutormigo for free, then add the Roadmap and live support when you&apos;re ready.</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-white px-6 font-sans text-base font-semibold text-[#0A0A0A] transition hover:bg-[#F2F2F2]">Start free <ArrowIcon /></Link>
            <button type="button" onClick={() => setShowParentModal(true)} className="inline-flex min-h-[3.25rem] items-center justify-center rounded-xl border-2 border-white/20 px-6 font-sans text-base font-semibold text-white transition hover:bg-white/10">Ask a parent</button>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#E8E8E8] bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-3 font-sans text-sm text-[#747474] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tutormigo</p>
          <p>SAT® is a trademark of College Board, which is not affiliated with Tutormigo.</p>
        </div>
      </footer>

      {showParentModal ? (
        <ParentEmailModal
          onClose={() => setShowParentModal(false)}
          planId="plus"
          planLabel={plusTier.name}
          priceLabel={`${formatPrice(plusTier.price)}${plusTier.cadence}`}
        />
      ) : null}
    </main>
  );
}
