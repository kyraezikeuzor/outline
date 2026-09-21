/**
 * Shared week-grid geometry for the schedule calendars.
 *
 * Weeks start on Monday so Saturday and Sunday sit next to each other in the
 * last two columns — the classes are a weekend pair, and a Sunday-first grid
 * splits them across two rows.
 */
export const WEEK_START = 1;

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** Empty cells before the 1st, given the week start. */
export function leadingBlanks(year: number, month: number) {
  return (new Date(year, month, 1).getDay() - WEEK_START + 7) % 7;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
