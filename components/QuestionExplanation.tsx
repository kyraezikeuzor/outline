import type { Question } from "@/lib/questions";
import MathText from "@/components/MathText";

function formatCorrectDisplay(question: Question) {
  const key = question.correct_answer?.trim() ?? "";
  if (question.choices && key in question.choices) {
    return { letter: key, text: question.choices[key] };
  }
  const upper = key.toUpperCase();
  if (question.choices && upper in question.choices) {
    return { letter: upper, text: question.choices[upper] };
  }
  return { letter: null as string | null, text: key };
}

/** Split SAT rationales so each new sentence starts on its own line. */
function splitRationaleByChoices(text: string): string[] {
  let cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  // Bank text often jams sentences: "well.Choice B" → "well. Choice B"
  cleaned = cleaned.replace(/([.!?])([A-Z])/g, "$1 $2");

  // Split after sentence-ending punctuation when a new sentence follows.
  // Skip common abbreviations (Mr./Mrs./Ms./Dr./etc.).
  const parts = cleaned
    .split(
      /(?<=(?<!\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|approx))[.!?])(?=\s+[A-Z])/
    )
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts;

  const byChoice = cleaned
    .split(/(?=\bChoice\s+[A-D]\b)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byChoice.length > 1) return byChoice;

  return [cleaned];
}

/** Shared answer and rationale panel from the question player. */
export default function QuestionExplanation({ question }: { question: Question }) {
  const correctDisplay = formatCorrectDisplay(question);
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 font-sans">
      <div className="mb-5 rounded-2xl border border-arc-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-arc-muted">Correct Answer</p>
        <div className="flex w-full items-center gap-3 rounded-xl bg-arc-correctBg px-3 py-2.5">
          {correctDisplay.letter && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arc-correct text-sm font-semibold text-white">
              {correctDisplay.letter}
            </span>
          )}
          <MathText
            text={correctDisplay.text}
            className="min-w-0 font-sans text-base font-medium text-arc-ink"
          />
        </div>
      </div>

      {question.rationale ? (
        <>
          <p className="mb-3 text-sm font-semibold text-arc-ink">Step-by-step explanation</p>
          <div className="space-y-4">
            {splitRationaleByChoices(question.rationale).map((line, i) => (
              <MathText
                key={`${i}-${line.slice(0, 24)}`}
                block
                text={line}
                className="font-sans text-base font-normal leading-relaxed text-arc-ink"
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-arc-muted">No explanation available for this question.</p>
      )}
    </div>
  );
}
