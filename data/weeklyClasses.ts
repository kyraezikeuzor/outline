/**
 * Mock weekly live-class schedule.
 *
 * This module is the ONLY place the schedule is defined. Every component in
 * the Weekly Classes section consumes `WeeklyClass[]` through props, so
 * swapping this array for an API/database response later requires no changes
 * to the UI — return the same shape and the section renders it.
 *
 * Dates are deliberately hardcoded rather than derived from `new Date()`, so
 * the landing page renders identically on the server and the client and does
 * not drift as time passes.
 */

export type ClassType = "SAT Math" | "SAT Reading & Writing";

export type WeeklyClass = {
  /** ISO date, `YYYY-MM-DD`. Local calendar date — not a UTC timestamp. */
  date: string;
  time: string;
  timezone: string;
  type: ClassType;
};

/** Saturdays (Math) and Sundays (R&W) from 19 Sep 2026 through 31 Oct 2026. */
export const weeklyClasses: WeeklyClass[] = [
  { date: "2026-09-19", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-09-20", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-09-26", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-09-27", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-10-03", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-10-04", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-10-10", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-10-11", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-10-17", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-10-18", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-10-24", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
  { date: "2026-10-25", time: "7:00 PM", timezone: "ET", type: "SAT Reading & Writing" },
  { date: "2026-10-31", time: "7:00 PM", timezone: "ET", type: "SAT Math" },
];

/** The months the calendar can page through, derived from the data itself. */
export function classMonths(classes: WeeklyClass[]) {
  const seen = new Set<string>();
  const months: { year: number; month: number }[] = [];
  for (const item of classes) {
    const key = item.date.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    const [year, month] = key.split("-").map(Number);
    months.push({ year, month: month - 1 });
  }
  return months.sort((a, b) => a.year - b.year || a.month - b.month);
}

/** Parse `YYYY-MM-DD` as a local date; `new Date(iso)` would shift by timezone. */
export function parseClassDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function classesByDate(classes: WeeklyClass[]) {
  const map = new Map<string, WeeklyClass>();
  for (const item of classes) map.set(item.date, item);
  return map;
}
