"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  classMonths,
  classesByDate,
  type WeeklyClass,
} from "@/data/weeklyClasses";
import { ClassRow, classAccent } from "./UpcomingClasses";
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  dateKey,
  daysInMonth as daysIn,
  leadingBlanks,
} from "./calendarGrid";


export function CalendarEvent({ item }: { item: WeeklyClass }) {
  const accent = classAccent(item.type);
  const short = item.type === "SAT Math" ? "SAT Math" : "Reading & Writing";
  return (
    <div className={`mt-1 rounded-lg px-1.5 py-1 text-left ${accent.chip}`}>
      <p className="font-sans text-[10px] font-medium leading-tight">{short}</p>
      <p className="font-sans text-[10px] leading-tight opacity-80">{item.time}</p>
    </div>
  );
}

export function CalendarMonth({
  year,
  month,
  byDate,
}: {
  year: number;
  month: number;
  byDate: Map<string, WeeklyClass>;
}) {
  const firstDayOffset = leadingBlanks(year, month);
  const monthLength = daysIn(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS.map((day, i) => (
          <span
            key={`${day}-${i}`}
            className="pb-1 text-center font-sans text-[11px] font-medium text-arc-muted"
          >
            {day}
          </span>
        ))}
        {Array.from({ length: firstDayOffset }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden />
        ))}
        {Array.from({ length: monthLength }, (_, i) => {
          const day = i + 1;
          const item = byDate.get(dateKey(year, month, day));
          return (
            <div
              key={day}
              className={`min-h-[4.5rem] rounded-xl border p-1.5 sm:min-h-[5.5rem] ${
                item ? "border-[#BDEBFF] bg-[#FAFDFF]" : "border-mkt-line bg-white"
              }`}
            >
              <span className="font-sans text-[11px] font-medium tabular-nums text-[#5A5A5A]">
                {day}
              </span>
              {item ? <CalendarEvent item={item} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

export default function WeeklyClassesCalendar({
  open,
  classes,
  onClose,
}: {
  open: boolean;
  classes: WeeklyClass[];
  onClose: () => void;
}) {
  const titleId = useId();
  const months = useMemo(() => classMonths(classes), [classes]);
  const byDate = useMemo(() => classesByDate(classes), [classes]);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Lock background scrolling, restoring whatever the page had before.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || months.length === 0) return null;

  const current = months[Math.min(index, months.length - 1)];
  const monthLabel = `${MONTH_NAMES[current.month]} ${current.year}`;
  const monthClasses = classes.filter(
    (item) => item.date.slice(0, 7) === `${current.year}-${String(current.month + 1).padStart(2, "0")}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A0A0A]/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[20px] bg-white sm:rounded-[20px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-mkt-line px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-medium tracking-[-0.01em] text-[#0A0A0A] sm:text-2xl">
              Weekly Classes
            </h2>
            <p className="mt-1 font-sans text-sm text-[#5A5A5A]">
              Live SAT Math and Reading &amp; Writing sessions
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-mkt-line bg-[#F3FBFF] px-2.5 py-1 font-sans text-[11px] font-medium text-[#0890D4] sm:inline">
              All times ET
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close class schedule"
              className="grid h-9 w-9 place-items-center rounded-full text-[#747474] transition hover:bg-[#F4F4F4] hover:text-[#0A0A0A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6FF]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-lg border border-mkt-line text-[#5A5A5A] transition hover:bg-[#F3FBFF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Arrow dir="prev" />
          </button>
          <p aria-live="polite" className="font-sans text-sm font-medium text-[#0A0A0A]">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(months.length - 1, i + 1))}
            disabled={index >= months.length - 1}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-lg border border-mkt-line text-[#5A5A5A] transition hover:bg-[#F3FBFF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Arrow dir="next" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7">
          {/* A month grid never fits a phone, so small screens get an agenda
              list of the same month's sessions instead of a squeezed grid. */}
          <div className="hidden sm:block">
            <CalendarMonth year={current.year} month={current.month} byDate={byDate} />
          </div>
          <ul className="space-y-2.5 sm:hidden">
            {monthClasses.map((item) => (
              <ClassRow key={`${item.date}-${item.type}`} item={item} />
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-mkt-line pt-4">
            {(["SAT Math", "SAT Reading & Writing"] as const).map((type) => (
              <span key={type} className="flex items-center gap-2 font-sans text-xs text-[#5A5A5A]">
                <span className={`h-2 w-2 rounded-full ${classAccent(type).dot}`} aria-hidden />
                {type}
              </span>
            ))}
            <span className="font-sans text-xs text-[#5A5A5A] sm:hidden">All times ET</span>
          </div>
        </div>
      </div>
    </div>
  );
}
