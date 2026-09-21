"use client";

import type { ReactNode } from "react";
import type { SubjectFilter, TierFilter } from "@/lib/subjects";
import { filterPillClass, SELECTED_FILTER_STYLE } from "@/lib/uiStyles";

const SUBJECT_OPTIONS: { value: SubjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "math", label: "Math" },
  { value: "reading_writing", label: "R and W" },
];

const DIFFICULTY_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "Random" },
  { value: 1, label: "Easy" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hard" },
];

const COUNT_OPTIONS = [10, 20, 30] as const;

function OptionRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="arc-card-label mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Practice setup used by the student question bank and the public preview. */
export default function PracticeSetup({ subject, setSubject, tier, setTier, count, setCount, children }: {
  subject: SubjectFilter;
  setSubject: (subject: SubjectFilter) => void;
  tier: TierFilter;
  setTier: (tier: TierFilter) => void;
  count: 10 | 20 | 30;
  setCount: (count: 10 | 20 | 30) => void;
  children: ReactNode;
}) {
  return (
    <div className="arc-card mt-4 divide-y divide-arc-line">
      <OptionRow label="Subject">
        {SUBJECT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setSubject(o.value)}
            className={filterPillClass(subject === o.value)}
            style={subject === o.value ? SELECTED_FILTER_STYLE : undefined}
            aria-pressed={subject === o.value}
          >
            {o.label}
          </button>
        ))}
      </OptionRow>

      <OptionRow label="Difficulty">
        {DIFFICULTY_OPTIONS.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => setTier(o.value)}
            className={filterPillClass(tier === o.value)}
            style={tier === o.value ? SELECTED_FILTER_STYLE : undefined}
            aria-pressed={tier === o.value}
          >
            {o.label}
          </button>
        ))}
      </OptionRow>

      <OptionRow label="How many questions">
        {COUNT_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={filterPillClass(count === n)}
            style={count === n ? SELECTED_FILTER_STYLE : undefined}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
      </OptionRow>

      {children}
    </div>
  );
}
