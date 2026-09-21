/** Treat assignment due dates as calendar dates, including timestamp inputs. */
export function formatAssignmentDueDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== `${year}-${month}-${day}`) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Keep the most recent miss for each question without discarding history. */
export function uniqueRecentMistakes<T extends { question_id: string; attempted_at: string }>(items: T[]): T[] {
  const latest = new Map<string, T>();
  for (const item of items) {
    const previous = latest.get(item.question_id);
    if (!previous || Date.parse(item.attempted_at) > Date.parse(previous.attempted_at)) latest.set(item.question_id, item);
  }
  return [...latest.values()].sort((a, b) => Date.parse(b.attempted_at) - Date.parse(a.attempted_at));
}
