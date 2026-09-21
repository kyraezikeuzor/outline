"use client";

import { classMonths, parseClassDate, type WeeklyClass } from "@/data/weeklyClasses";
import MiniCalendar from "./MiniCalendar";

/** Math is the brand blue; R&W takes a muted indigo so the two read as one family. */
export function classAccent(type: WeeklyClass["type"]) {
  return type === "SAT Math"
    ? { dot: "bg-[#06B6FF]", chip: "bg-[#EAF8FF] text-[#0779A8]" }
    : { dot: "bg-[#7C8CF8]", chip: "bg-[#EEF0FE] text-[#4A56C4]" };
}

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ClassRow({ item }: { item: WeeklyClass }) {
  const date = parseClassDate(item.date);
  const accent = classAccent(item.type);

  return (
    <li className="flex items-center gap-4 rounded-xl border border-mkt-line px-4 py-3.5 transition hover:bg-[#FAFDFF]">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F3FBFF]">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[#0890D4]">
          {MONTH[date.getMonth()]}
        </span>
        <span className="font-sans text-base font-medium leading-none tabular-nums text-[#0A0A0A]">
          {date.getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} aria-hidden />
          <p className="truncate font-sans text-sm font-medium text-[#0A0A0A]">
            {item.type}
          </p>
        </div>
        <p className="mt-1 font-sans text-xs text-[#5A5A5A]">
          {DAY[date.getDay()]} · {item.time} {item.timezone}
        </p>
      </div>
    </li>
  );
}

export default function UpcomingClasses({
  classes,
  limit = 4,
  onViewAll,
}: {
  classes: WeeklyClass[];
  limit?: number;
  onViewAll: () => void;
}) {
  const upcoming = classes.slice(0, limit);
  // The preview always shows the month the next session falls in.
  const firstMonth = classMonths(classes)[0];

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-mkt-line bg-white p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium leading-snug tracking-[-0.01em] text-[#0A0A0A] sm:text-[1.5rem]">
            Upcoming classes
          </h3>
          <p className="mt-1.5 font-sans text-xs text-[#5A5A5A]">
            Live SAT Math + Reading &amp; Writing every weekend
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-mkt-line bg-[#F3FBFF] px-2.5 py-1 font-sans text-[11px] font-medium text-[#0890D4]">
          All times ET
        </span>
      </div>

      {firstMonth ? (
        <div className="mt-6">
          <MiniCalendar
            classes={classes}
            year={firstMonth.year}
            month={firstMonth.month}
          />
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {upcoming.map((item) => (
            <ClassRow key={`${item.date}-${item.type}`} item={item} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 font-sans text-sm text-[#5A5A5A]">
          No classes scheduled right now. Check back soon.
        </p>
      )}

      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={onViewAll}
          className="h-11 w-full rounded-xl border border-mkt-line bg-white font-sans text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#F3FBFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6FF]"
        >
          View full class schedule
        </button>
      </div>
    </div>
  );
}
