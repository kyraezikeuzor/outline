"use client";

import { useState } from "react";
import { marketingButtonClass } from "@/lib/marketingButtons";
import MathText from "@/components/MathText";
import QuestionChoices from "@/components/QuestionChoices";
import { landingPreviewQuestion as question } from "@/lib/landing-preview-question";

/** A live question-bank card composed for the marketing hero. */
export default function HeroQuestionPreview() {
  const [selected, setSelected] = useState("A");
  const [submitted, setSubmitted] = useState(false);
  const [marked, setMarked] = useState(false);
  const [eliminated, setEliminated] = useState<Set<string>>(() => new Set());
  const correct = selected === question.correct_answer;

  function reset() {
    setSelected("");
    setSubmitted(false);
    setEliminated(new Set());
  }

  return (
    <div className="relative isolate mx-auto w-full max-w-[30rem] px-3 py-3 sm:px-6 sm:py-3" aria-label="Interactive SAT question">
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-arc-accent" viewBox="0 0 560 680" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d="M449 89C578 148 310 144 174 238S33 351 244 393 587 474 400 533 120 581 91 628" stroke="currentColor" strokeWidth="86" strokeLinecap="round" />
      </svg>
      <p className="relative mb-3 text-center font-dm text-xl font-medium tracking-tight text-arc-ink sm:text-2xl">Digital SAT</p>
      <div className="relative rounded-[24px] border-2 border-[#E8E8E8] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.10)]">
        <div className="px-4 pt-4 sm:px-5">
          <div className="flex items-center gap-3 rounded-xl bg-arc-soft pr-3 font-sans text-xs sm:text-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#0A0A0A] text-lg font-medium text-white">7</span>
            <button type="button" aria-pressed={marked} onClick={() => setMarked(!marked)} className="flex items-center gap-2 rounded text-arc-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-arc-accent">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill={marked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M5 3h10v14l-5-3-5 3V3Z" strokeLinejoin="round" /></svg>
              {marked ? "Marked for Review" : "Mark for Review"}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 pt-4 sm:px-5">
          <MathText text={question.stem} block className="question-prose mb-4 text-arc-ink" />
          <QuestionChoices question={question} selected={selected} submitted={submitted} eliminated={eliminated} submitPlacement="footer" onSelect={setSelected} onSubmit={() => setSubmitted(true)} onEliminate={(letter) => setEliminated(previous => {
            const next = new Set(previous);
            if (next.has(letter)) next.delete(letter); else next.add(letter);
            return next;
          })} />
        </div>
        <div aria-live="polite" className="min-h-8 px-5 pb-2 font-sans text-xs leading-relaxed">
          {submitted && <p className={correct ? "text-arc-correct" : "text-arc-incorrect"}>{correct ? "Correct!" : "Not quite."} Solving gives x = 8/3, so 3x + 2 = 10.</p>}
        </div>
        <div className="flex items-center gap-4 border-t border-arc-line px-4 py-3 sm:px-5">
          <span className="shrink-0 font-sans text-xs text-arc-muted">1 of 1</span>
          <button type="button" onClick={submitted ? reset : () => setSubmitted(true)} disabled={!selected && !submitted} className={`${marketingButtonClass()} flex-1`}>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="10" cy="10" r="7.5" /><path d="m6.5 10 2.3 2.3 4.7-5" /></svg>
            {!submitted ? "Check Answer" : correct ? "Correct" : "Try again"}
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-1 top-4 z-10 hidden h-16 w-16 rotate-12 items-center justify-center rounded-[20px] border-2 border-[#C9E8F6] bg-[#E4F7FF] text-arc-accent shadow-lg sm:flex" aria-hidden>
        <svg viewBox="0 0 32 32" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="6" width="19" height="23" rx="4" fill="white" stroke="none" /><path d="M11 13h11M11 18h8M11 23h5" strokeLinecap="round" /><path d="m6 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill="currentColor" stroke="none" /></svg>
      </div>
      <div className="pointer-events-none absolute bottom-0 right-1 z-10 flex h-16 w-16 rotate-6 items-center justify-center rounded-[20px] border-2 border-[#F2DEC0] bg-[#FFF0DB] text-[#E8A45D] shadow-lg sm:bottom-4 sm:right-0 sm:h-16 sm:w-16" aria-hidden>
        <svg viewBox="0 0 36 36" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="5" width="26" height="20" rx="4" fill="currentColor" stroke="none" /><path d="M10 11h8M10 17h16" stroke="white" strokeLinecap="round" /><path d="m10 30 2 2 4-5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="23" cy="30" r="2" fill="currentColor" stroke="none" /></svg>
      </div>
    </div>
  );
}
