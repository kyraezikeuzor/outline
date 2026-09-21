import { SELECTED_FILTER_STYLE } from "@/lib/uiStyles";

/**
 * Miniature, non-interactive mockups of real Tutormigo surfaces, used by the
 * landing page's "how it works" cards.
 *
 * Presentational only: no state, no data fetching, no auth. They mirror the
 * tokens the live components use — the accent from `SELECTED_FILTER_STYLE`,
 * the `#1BB1F6`-on-`#ECECEC` progress bar from MasterySnapshot — so the
 * previews stay in step with the product instead of drifting into lookalikes.
 *
 * Each is marked aria-hidden: the controls are cosmetic, and the card's own
 * heading and description carry the meaning for assistive tech.
 */

const PILL_BASE =
  "rounded-lg px-2.5 py-1 font-sans text-[11px] font-medium leading-none";
const PILL_IDLE = `${PILL_BASE} border border-arc-line text-arc-heading`;
const PILL_ON = `${PILL_BASE} border-2`;

function Pill({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <span
      className={on ? PILL_ON : PILL_IDLE}
      style={on ? SELECTED_FILTER_STYLE : undefined}
    >
      {label}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-2.5">
      <p className="mb-1.5 font-sans text-[10px] font-normal text-arc-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Bar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "good" }) {
  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ECECEC]">
      <div
        className={`h-full rounded-full ${tone === "good" ? "bg-[#22C55E]" : "bg-[#1BB1F6]"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[16rem] overflow-hidden rounded-2xl border border-arc-line bg-white">
      {children}
    </div>
  );
}

export function PracticePreview() {
  return (
    <div aria-hidden className="flex w-full justify-center">
      <Shell>
        <div className="divide-y divide-arc-line">
          <Row label="Subject">
            <Pill label="Math" on />
            <Pill label="Reading & Writing" />
          </Row>
          <Row label="Difficulty">
            <Pill label="Easy" />
            <Pill label="Medium" on />
            <Pill label="Hard" />
          </Row>
          <Row label="Questions">
            <Pill label="10" />
            <Pill label="20" on />
            <Pill label="30" />
          </Row>
          <div className="px-3.5 py-3">
            <span className="flex h-8 w-full items-center justify-center rounded-lg bg-arc-accent font-sans text-[11px] font-semibold text-white">
              Start practice
            </span>
          </div>
        </div>
      </Shell>
    </div>
  );
}

const SKILLS = [
  { name: "Linear equations", pct: 82, focus: false },
  { name: "Problem solving", pct: 64, focus: true },
  { name: "Advanced math", pct: 71, focus: false },
];

export function MasteryPreview() {
  return (
    <div aria-hidden className="flex w-full justify-center">
      <Shell>
        <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-arc-muted">
            Mastery
          </p>
        </div>
        <div className="space-y-2 px-2 pb-3">
          {SKILLS.map((s) => (
            <div
              key={s.name}
              className={`rounded-xl px-1.5 py-1.5 ${s.focus ? "bg-[#F3FBFF] ring-1 ring-[#BDEBFF]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-sans text-[11px] font-normal text-arc-heading">
                  {s.name}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {s.focus && (
                    <span className="rounded-full bg-[#E5F7FF] px-1.5 py-0.5 font-sans text-[9px] font-medium text-[#0890D4]">
                      Focus next
                    </span>
                  )}
                  <span className="font-sans text-[11px] font-semibold tabular-nums text-arc-heading">
                    {s.pct}%
                  </span>
                </div>
              </div>
              <Bar pct={s.pct} tone={s.pct >= 75 ? "good" : "accent"} />
            </div>
          ))}
        </div>
      </Shell>
    </div>
  );
}

function TaskIcon({ done }: { done: boolean }) {
  return done ? (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5F7FF] text-[#0890D4]">
      <svg
        viewBox="0 0 24 24"
        className="h-2.5 w-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
      >
        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : (
    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-arc-line" />
  );
}

const TASKS = [
  { name: "Linear equations", count: "10 questions", done: true },
  { name: "Problem solving", count: "15 questions", done: false },
  { name: "Reading: Craft & Structure", count: "10 questions", done: false },
];

export function RoadmapPreview() {
  return (
    <div aria-hidden className="flex w-full justify-center">
      <Shell>
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-arc-muted">
            This week
          </p>
          <span className="font-sans text-[10px] font-medium tabular-nums text-[#0890D4]">
            2 of 5 goals
          </span>
        </div>
        <div className="space-y-2.5 px-3.5 pb-3">
          {TASKS.map((t) => (
            <div key={t.name} className="flex items-start gap-2">
              <TaskIcon done={t.done} />
              <div className="min-w-0">
                <p
                  className={`truncate font-sans text-[11px] font-normal ${t.done ? "text-arc-muted line-through" : "text-arc-heading"}`}
                >
                  {t.name}
                </p>
                <p className="font-sans text-[10px] text-arc-muted">{t.count}</p>
              </div>
            </div>
          ))}
          <div className="pt-0.5">
            <Bar pct={40} />
          </div>
        </div>
      </Shell>
    </div>
  );
}
