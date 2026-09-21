"use client";

import { classesByDate, type WeeklyClass } from "@/data/weeklyClasses";
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  dateKey,
  daysInMonth,
  leadingBlanks,
} from "./calendarGrid";

/**
 * Compact month-at-a-glance strip. Marks the days that have a class so the
 * weekly rhythm is obvious without opening the full calendar.
 *
 * Reads the same `WeeklyClass[]` as everything else; it derives nothing of
 * its own and owns no schedule data.
 */
export default function MiniCalendar({
  classes,
  year,
  month,
}: {
  classes: WeeklyClass[];
  year: number;
  month: number;
}) {
  const byDate = classesByDate(classes);
  const blanks = leadingBlanks(year, month);
  const total = daysInMonth(year, month);

  return (
    <div className="rounded-2xl border border-mkt-line bg-[#FAFDFF] p-4">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0890D4]">
        {MONTH_NAMES[month]} {year}
      </p>

      <div className="mt-3 grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAY_LABELS.map((day, i) => (
          <span
            key={`${day}-${i}`}
            className="font-sans text-[10px] font-medium text-[#A3A3A3]"
          >
            {day}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const item = byDate.get(dateKey(year, month, day));
          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={`font-sans text-[11px] tabular-nums ${
                  item ? "font-semibold text-[#0A0A0A]" : "text-[#8A8A8A]"
                }`}
              >
                {day}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${item ? "bg-[#06B6FF]" : "bg-transparent"}`}
                aria-hidden
              />
            </div>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 font-sans text-[11px] text-[#5A5A5A]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#06B6FF]" aria-hidden />
        Class days
      </p>
    </div>
  );
}
