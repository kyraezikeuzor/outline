"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionBankPreview, ExplanationPreview } from "@/components/LandingFeaturePreviews";
import HeroQuestionPreview from "@/components/HeroQuestionPreview";
import {
  PracticePreview,
  MasteryPreview,
  RoadmapPreview,
} from "@/components/LandingStepPreviews";
import { typography } from "@/lib/typography";
import { marketingButtonClass } from "@/lib/marketingButtons";
import MarketingNavbar from "@/components/MarketingNavbar";
import WeeklyClassesSection from "@/components/weekly-classes/WeeklyClassesSection";
import { getPlanTier } from "@/lib/pricing";

/** Flip to true when Pricing should return on the landing page. */
const SHOW_PRICING = false;
const MAX_PLAN = getPlanTier("max");
const MAX_HERO_FEATURES = [
  ...getPlanTier("plus").features.slice(0, 2),
  ...MAX_PLAN.features,
];
/** Flip to true when the SAT fee-waiver callout should return. */
const SHOW_FEE_WAIVER = false;

const TESTIMONIALS = [
  {
    quote: "She was super helpful with my questions! I really appreciate it.",
    tag: "Super helpful",
  },
  {
    quote: "The explanations were helpful and it was interactive.",
    tag: "Interactive",
  },
  {
    quote:
      "I appreciate her showing us ways to get more experience with SAT questions.",
    tag: "Fun",
  },
] as const;

const TESTIMONIAL_ATTRIBUTION =
  "Anonymous Student, Kyra's Khan Academy Schoolhouse.world Bootcamp";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the platform free to use?",
    a: "Yes. You can create an account and start practicing for free. Free access includes SAT practice questions and core study tools, with additional features available through paid plans.",
  },
  {
    q: "What makes this different from other SAT prep?",
    a: "Your practice, progress, and study plan all work together. Instead of simply giving you a question bank, the platform uses your performance to help you identify what needs work and focus your studying accordingly.",
  },
  {
    q: "What do I get with my account?",
    a: "You’ll get access to 1,000+ original SAT-style questions, detailed answer explanations, targeted practice, progress tracking, and a personalized study roadmap. Additional support and live instruction are available with select plans.",
  },
  {
    q: "Are these official College Board questions?",
    a: "No. All practice questions are original and are designed around the skills, concepts, and formats tested on the Digital SAT. We are not affiliated with or endorsed by College Board.",
  },
  {
    q: "How does personalized practice work?",
    a: "Your recent performance helps identify the areas where you’re doing well and where you may need more practice. Your recommendations and study roadmap can then adjust around those results.",
  },
  {
    q: "Can I choose what I want to practice?",
    a: "Yes. You can choose your subject, difficulty, and session length to build a practice session around what you want to work on.",
  },
  {
    q: "Do questions include answer explanations?",
    a: "Yes. Questions include explanations that walk through the reasoning behind the answer so you can understand what went wrong and how to approach similar problems.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. The platform works across computers, tablets, and phones, and your progress stays connected to your account.",
  },
  {
    q: "What comes with the paid plans?",
    a: "Paid plans unlock additional study tools and support, including features such as expanded practice access, personalized weekly roadmaps, live guided lessons, office hours, and priority help. You can compare the available options on the Pricing page.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Practice your way",
    desc: "Build a session around the subject, difficulty, and amount of practice you want.",
    Preview: PracticePreview,
  },
  {
    n: "02",
    title: "See what needs work",
    desc: "Track your progress by skill and see where to focus your practice next.",
    Preview: MasteryPreview,
  },
  {
    n: "03",
    title: "Follow your roadmap",
    desc: "Turn your results into a clear plan for what to practice next.",
    Preview: RoadmapPreview,
  },
] as const;

/* ── Shared layout tokens ───────────────────────────────────────────────────
   A 75rem measure, 96px section rhythm, 20px card radius and one very soft
   shadow. Local to this file so the pricing page keeps its own look. */
const SHELL = "mx-auto w-full max-w-[75rem] px-5 sm:px-8";
const SECTION = "py-16 sm:py-24";
const CARD =
  "rounded-[20px] bg-mkt-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.06)]";
const SECTION_TITLE =
  "text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[2.5rem] lg:text-[2.75rem]";
const LEAD = "text-base leading-relaxed text-[#5A5A5A] sm:text-lg";
const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8A8A]";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** The faint skyline behind the hero, echoing LionPlan's campus silhouette. */
function HeroSkyline() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] w-full text-white/[0.05]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 320V214h52v-28h34v28h44v-52h30v52h58v-74h26v74h48v-36h40v36h46v-96h28v96h54v-44h38v44h50v-68h30v68h56v-30h42v30h48v-88h26v88h52v-40h36v40h54v-60h28v60h50v-26h44v26h46v-80h26v80h56v-46h38v46h52v-34h30v34h58v-58h26v58h48v-24h40v24h46V320Z" />
    </svg>
  );
}

/** Frame for the tutor’s supporting score report. */
export default function LandingPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="landing-page min-h-[100dvh] bg-white text-[#0A0A0A]">
      {/* ── Hero — Max features alongside the live platform preview ───── */}
      <MarketingNavbar currentPage="home" />
      <section
        className="relative overflow-hidden bg-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/backgrounds/dashboard-math-grid.webp")' }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_52%,rgba(255,255,255,0.28)_68%,rgba(255,255,255,0.62)_80%,rgba(255,255,255,0.9)_92%,rgba(255,255,255,1)_100%)]"
          aria-hidden
        />
        <div className={`relative z-10 ${SHELL} grid items-center gap-8 py-6 sm:py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-10`}>
          <div className="min-w-0">
            <h1 className={`mt-5 ${typography.marketingPageTitle}`}>
              Your 1500+ SAT{" "}<br className="hidden lg:block" />score starts here
            </h1>
            <ul className="mt-7 space-y-2">
              {MAX_HERO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[14px] leading-snug text-[#5A5A5A] sm:text-[15px]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arc-accent text-white" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {feature.startsWith("Weekly live ") ? (
                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <span>Weekly live guided lessons with</span>
                      <Link
                        href="#weekly-classes"
                        className="inline-flex items-center gap-1.5 font-medium text-[#0A0A0A] no-underline transition hover:text-arc-accent focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arc-accent"
                      >
                        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src="/landing/kyra-hero.jpg"
                            alt=""
                            fill
                            sizes="20px"
                            className="object-cover object-[center_20%]"
                          />
                        </span>
                        Kyra
                      </Link>
                    </span>
                  ) : (
                    feature
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={marketingButtonClass()}>Get Started for Free</Link>
              <Link href="/pricing" className={marketingButtonClass("secondary")}>Explore Plans</Link>
            </div>
          </div>
          <HeroQuestionPreview />
        </div>
      </section>

      {/* ── How it works — product previews, not three text cards ───────── */}
      <section id="steps" className={SECTION}>
        <div className={`${SHELL} flex flex-col items-center gap-12`}>
          <h2 className={`max-w-2xl text-center ${SECTION_TITLE}`}>
            Practice smarter, from start to finish
          </h2>
          {/* items-stretch + h-full equalises card height; the fixed preview
              height from lg up keeps the divider — and so the text block below
              it — on the same line across all three. Left auto when stacked. */}
          <div className="grid w-full items-stretch gap-5 lg:grid-cols-3">
            {STEPS.map(({ n, title, desc, Preview }) => (
              <article
                key={n}
                className="flex h-full flex-col overflow-hidden rounded-[20px] border border-mkt-line bg-white"
              >
                <div className="flex min-h-[15.5rem] items-center justify-center border-b border-mkt-line bg-[#F3FBFF] px-5 py-7 lg:h-[19.5rem]">
                  <Preview />
                </div>
                <div className="p-6 sm:p-7">
                  <span className="font-sans text-sm font-medium tabular-nums text-[#A3A3A3]">
                    {n}
                  </span>
                  <h3 className="mt-3 text-lg font-medium leading-snug tracking-[-0.01em] text-[#0A0A0A]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">
                    {desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Weekly classes — instructor + live schedule ─────────────────── */}
      <WeeklyClassesSection
        shellClassName={SHELL}
        sectionClassName={SECTION}
        titleClassName={SECTION_TITLE}
        eyebrowClassName={EYEBROW}
        leadClassName={LEAD}
      />

      {/* ── Question bank ───────────────────────────────────────────────── */}
      <section id="platform" className={SECTION}>
        <div className={`${SHELL} flex flex-col items-center gap-12`}>
          <div className="max-w-2xl text-center">
            <h2 className={SECTION_TITLE}>
              Practice in a real
              <br className="hidden sm:block" /> SAT-style question bank
            </h2>
            <p className={`mx-auto mt-4 max-w-xl ${LEAD}`}>
              Choose your subject, difficulty, and session length. Build a
              practice session around what you want to work on.
            </p>
          </div>
          <QuestionBankPreview />
        </div>
      </section>

      {/* ── Explanations — text left, interactive question right ─────────────────────────── */}
      <section className={SECTION}>
        <div
          className={`${SHELL} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}
        >
          <div className="max-w-md">
            <p className={EYEBROW}>Explanations</p>
            <h2 className={`mt-3 ${SECTION_TITLE}`}>
              Know why the answer
              <br className="hidden sm:block" /> is the answer
            </h2>
            <p className={`mt-4 ${LEAD}`}>
              Answer, check your work, and open a clear explanation panel,
              including why each choice is right or wrong.
            </p>
          </div>
          <ExplanationPreview />
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="reviews" className={SECTION}>
        <div className={`${SHELL} flex flex-col items-center`}>
          <h2 className={`text-center ${SECTION_TITLE}`}>
            What students are saying
          </h2>

          <div className="relative mt-12 min-h-[15rem] w-full max-w-3xl">
            {TESTIMONIALS.map((item, i) => (
              <blockquote
                key={item.quote}
                aria-hidden={i !== quoteIndex}
                className={`absolute inset-x-0 top-0 text-center transition-opacity duration-500 ${
                  i === quoteIndex
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <p className="landing-display text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em] text-[#0A0A0A] sm:text-[2.25rem]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <span className="inline-flex rounded-full border border-black/10 bg-mkt-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A5A5A]">
                    {item.tag}
                  </span>
                </div>
                <footer className="mt-4 text-sm text-[#8A8A8A]">
                  {TESTIMONIAL_ATTRIBUTION}
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === quoteIndex}
                onClick={() => setQuoteIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === quoteIndex
                    ? "w-6 bg-mkt-navy"
                    : "w-2 bg-[#D4D4D4] hover:bg-[#A3A3A3]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — gated */}
      {SHOW_PRICING && (
        <section id="pricing" className={SECTION}>
          <div className={`${SHELL} text-center`}>
            <h2 className={SECTION_TITLE}>Pricing</h2>
            <p className={`mt-4 ${LEAD}`}>
              Coming after the free platform period. Platform participants are
              never auto-charged.
            </p>
          </div>
        </section>
      )}

      {/* Fee waiver — gated */}
      {SHOW_FEE_WAIVER && (
        <section className="pb-16 sm:pb-24">
          <div className={SHELL}>
            <div className={`mx-auto max-w-3xl ${CARD} p-7 sm:p-9`}>
              <h2 className="text-xl font-medium tracking-[-0.01em]">
                Have an SAT fee waiver?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">
                Details for fee-waiver support will be shared when paid plans
                launch.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs ─────────────────────────────────────────────────────────── */}
      <section id="faqs" className={`landing-faqs ${SECTION}`}>
        <div className={SHELL}>
          <div className="mx-auto max-w-3xl">
            <h2 className={SECTION_TITLE}>Frequently asked questions</h2>
            <div className="mt-10 divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:opacity-70"
                    >
                      <span className="text-base font-medium tracking-[-0.01em] text-[#0A0A0A] sm:text-lg">
                        {item.q}
                      </span>
                      <Chevron open={open} />
                    </button>
                    {open && (
                      <p className="pb-5 pr-10 text-[15px] leading-relaxed text-[#5A5A5A]">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="pb-16 sm:pb-24">
        <div className={SHELL}>
          <div className="relative isolate overflow-hidden rounded-[28px] bg-mkt-navy px-6 py-16 text-center sm:px-12 sm:py-20">
            <HeroSkyline />
            <div className="relative">
              <h2 className="landing-display mx-auto max-w-2xl text-[2rem] font-medium leading-[1.05] tracking-[-0.015em] text-white sm:text-[2.75rem]">
                Start practicing today, for free
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
                1,000 original questions, clear explanations, and live
                instruction. No payment required.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className={marketingButtonClass()}
                >
                  Get Started for Free
                </Link>
                <a
                  href="https://discord.gg/bCcrzEPQuc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={marketingButtonClass("secondary")}
                >
                  Join Discord Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.08] py-8">
        <div
          className={`${SHELL} flex flex-col items-center justify-between gap-3 text-sm text-[#8A8A8A] sm:flex-row`}
        >
          <p>© {new Date().getFullYear()} Tutormigo</p>
          <div className="flex gap-5">
            <Link href="/signup" className="transition hover:text-[#0A0A0A]">
              Join free platform
            </Link>
            <a href="#faqs" className="transition hover:text-[#0A0A0A]">
              FAQs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
