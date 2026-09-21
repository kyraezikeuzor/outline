"use client";

import Link from "next/link";
import { marketingButtonClass } from "@/lib/marketingButtons";
import { useState } from "react";
import MasterySnapshot from "@/components/roadmap/MasterySnapshot";
import PracticeSetup from "@/components/PracticeSetup";
import QuestionChoices from "@/components/QuestionChoices";
import QuestionExplanation from "@/components/QuestionExplanation";
import MathText from "@/components/MathText";
import { previewMasteryOverview } from "@/lib/mastery";
import { landingPreviewQuestion } from "@/lib/landing-preview-question";
import type { SubjectFilter, TierFilter } from "@/lib/subjects";

export function ProgressPreview() {
  const [overview] = useState(previewMasteryOverview);
  return (
    <div className="min-w-0 text-left">
      <div className="rounded-[24px] bg-white p-2 shadow-[0_20px_60px_rgba(3,34,90,0.10)] sm:p-3">
        <MasterySnapshot overview={overview} />
      </div>
      <p className="mt-4 text-center text-xs text-[#64748B]">Sample progress · Open a domain to explore its skills</p>
    </div>
  );
}

export function QuestionBankPreview() {
  const [subject, setSubject] = useState<SubjectFilter>("math");
  const [tier, setTier] = useState<TierFilter>("all");
  const [count, setCount] = useState<10 | 20 | 30>(10);
  return (
    <div className="w-full rounded-[28px] bg-[#F1F5FA] p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl">
        <PracticeSetup subject={subject} setSubject={setSubject} tier={tier} setTier={setTier} count={count} setCount={setCount}>
          <div className="px-5 py-5 sm:px-6">
            <Link href="/signup" className={`${marketingButtonClass()} w-full`}>Start practicing</Link>
            <p className="mt-3 text-center font-sans text-xs text-arc-muted">Create a free account to begin your practice session.</p>
          </div>
        </PracticeSetup>
      </div>
    </div>
  );
}

export function ExplanationPreview() {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [eliminated, setEliminated] = useState<Set<string>>(() => new Set());
  const question = landingPreviewQuestion;
  function reset() {
    setSelected("");
    setSubmitted(false);
    setEliminated(new Set());
  }
  return (
    <div className="min-w-0 rounded-[28px] bg-[#F1F5FA] p-4 sm:p-6">
      <div className="overflow-hidden rounded-[20px] border border-arc-line bg-white text-left shadow-sm">
        <div className="border-b border-arc-line px-5 py-4 font-sans">
          <p className="text-sm font-medium text-arc-ink">{question.domain}</p>
          <p className="mt-1 text-xs text-arc-muted">{question.skill} · Medium</p>
        </div>
        <div className="p-5 sm:p-6">
          <MathText text={question.stem} block className="question-prose mb-6 text-arc-ink" />
          <QuestionChoices
            question={question}
            selected={selected}
            submitted={submitted}
            eliminated={eliminated}
            onSelect={setSelected}
            onSubmit={() => setSubmitted(true)}
            onEliminate={(letter) => setEliminated(previous => {
              const next = new Set(previous);
              if (next.has(letter)) next.delete(letter); else next.add(letter);
              return next;
            })}
          />
        </div>
        <div aria-live="polite" className="border-t border-arc-line">
          {submitted ? <>
            <div className="flex items-center justify-between gap-3 bg-arc-soft px-5 py-3 font-sans">
              <p className={`text-sm font-medium ${selected === question.correct_answer ? "text-arc-correct" : "text-arc-incorrect"}`}>{selected === question.correct_answer ? "Correct" : "Incorrect"}</p>
              <button type="button" onClick={reset} className="rounded-md px-2 py-1 text-xs font-medium text-arc-muted hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-arc-accent">Try again</button>
            </div>
            <QuestionExplanation question={question} />
          </> : <p className="px-5 py-4 font-sans text-xs leading-relaxed text-arc-muted">Select a choice, then press Answer to see the explanation.</p>}
        </div>
      </div>
    </div>
  );
}
