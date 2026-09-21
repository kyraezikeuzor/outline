/**
 * A miniature score report: blue header over a white score panel, sized to sit
 * inside the instructor composition rather than span it.
 *
 * Presentational and prop-driven. The wording is Tutormigo's own — this shows
 * a score, it does not reproduce any score portal's branding or copy.
 */
const HEADER = "#314EC6";

export default function SATScoreReport({
  total,
  math,
  readingWriting,
  heading = "Your SAT Score",
  className = "",
}: {
  total: number;
  math: number;
  readingWriting: number;
  heading?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-[16.5rem] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_36px_rgba(16,24,40,0.10)] ${className}`}
    >
      <div className="px-4 py-3" style={{ backgroundColor: HEADER }}>
        <p className="font-sans text-[13px] font-semibold tracking-[-0.01em] text-white">
          {heading}
        </p>
      </div>

      <div className="px-4 pb-4 pt-4">
        <p className="font-sans text-[2.5rem] font-bold leading-[0.9] tabular-nums tracking-[-0.03em] text-[#0A0A0A]">
          {total}
        </p>
        <p className="mt-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A8A8A]">
          Total score
        </p>

        <dl className="mt-4 space-y-2 border-t border-mkt-line pt-3">
          {[
            { label: "Reading & Writing", value: readingWriting },
            { label: "Math", value: math },
          ].map((part) => (
            <div key={part.label} className="flex items-baseline justify-between gap-3">
              <dt className="font-sans text-[11px] text-[#5A5A5A]">{part.label}</dt>
              <dd className="font-sans text-base font-bold tabular-nums leading-none text-[#0A0A0A]">
                {part.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
