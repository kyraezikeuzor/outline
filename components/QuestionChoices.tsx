"use client";

import { useState } from "react";
import type { Question } from "@/lib/questions";
import MathText from "@/components/MathText";

function normalize(value: string) { return value.trim().toLowerCase(); }

/** The question player's answer choices, shared with the public practice demo. */
export default function QuestionChoices({ question, selected, submitted, isTestMode = false, submitPlacement = "inline", eliminated, onSelect, onSubmit: handleSubmit, onEliminate: toggleEliminate }: {
  question: Question;
  selected: string;
  submitted: boolean;
  isTestMode?: boolean;
  /** The hero uses a footer action; student practice keeps its inline Answer button. */
  submitPlacement?: "inline" | "footer";
  eliminated: Set<string>;
  onSelect: (letter: string) => void;
  onSubmit: () => void;
  onEliminate: (letter: string) => void;
}) {
  const [selectPulse, setSelectPulse] = useState<{ letter: string; n: number } | null>(null);
  return (
                    <div className="space-y-2.5">
                      {Object.entries(question.choices!).map(([letter, text]) => {
                        const isSelected = selected === letter;
                        const isEliminated = eliminated.has(letter);
                        const isTheCorrectAnswer =
                          normalize(letter) === normalize(question.correct_answer);
                        const isWrongPick =
                          submitted && isSelected && !isTheCorrectAnswer;

                        let stateClasses =
                          "border border-arc-muted/40 bg-white hover:border-arc-muted/70";
                        let bubbleClasses =
                          "border-arc-muted/50 bg-transparent text-arc-ink";

                        if (submitted && !isTestMode) {
                          if (isTheCorrectAnswer) {
                            stateClasses = "border border-arc-correct bg-arc-correctBg";
                            bubbleClasses = "border-arc-correct bg-arc-correct text-white";
                          } else if (isWrongPick) {
                            stateClasses =
                              "border border-arc-incorrect bg-arc-incorrectBg";
                            bubbleClasses =
                              "border-arc-incorrect bg-arc-incorrect text-white";
                          } else {
                            stateClasses =
                              "border border-arc-muted/30 bg-white opacity-55";
                            bubbleClasses =
                              "border-arc-muted/40 bg-transparent text-arc-ink/50";
                          }
                        } else if (isSelected) {
                          stateClasses = "border border-arc-accent bg-arc-accentSoft";
                          bubbleClasses = "border-arc-accent bg-arc-accent text-white";
                        } else if (isEliminated) {
                          stateClasses = "border border-arc-muted/30 bg-white opacity-60";
                          bubbleClasses =
                            "border-arc-muted/40 bg-transparent text-arc-ink/50";
                        }

                        const isPulsing = selectPulse?.letter === letter;

                        return (
          <div key={letter} className="relative flex items-center gap-2">
            <button
              type="button"
              disabled={submitted}
              onClick={() => {
                onSelect(letter);
                setSelectPulse(null);
                window.setTimeout(() => setSelectPulse({ letter, n: Date.now() }), 0);
              }}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setSelectPulse(null);
              }}
              className={`question-prose choice-text flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3 ${isSelected && !submitted && !isTestMode && submitPlacement === "inline" ? "pr-28" : ""} text-left transition-[border-color,background-color,box-shadow] duration-150 ${stateClasses}${
                isPulsing ? " choice-select-pulse" : ""
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-sans text-sm font-semibold ${bubbleClasses}`}
                aria-hidden={isWrongPick}
              >
                {isWrongPick ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                ) : (
                  letter
                )}
              </span>
              <MathText
                text={text}
                className={`math-text min-w-0 flex-1 ${
                  isEliminated && !submitted ? "line-through opacity-70" : ""
                }`}
              />
              {question.image_urls?.[`choice_${letter}`] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.image_urls[`choice_${letter}`]}
                  alt={`Choice ${letter}`}
                  className="max-h-10"
                />
              )}
            </button>
            {isSelected && !submitted && !isTestMode && submitPlacement === "inline" ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="absolute right-14 top-1/2 z-10 -translate-y-1/2 rounded-xl bg-arc-accent px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-arc-accentDeep"
              >
                Answer
              </button>
            ) : null}
            <button
              type="button"
              disabled={submitted}
              onClick={() => toggleEliminate(letter)}
              aria-label={
                isEliminated
                  ? `Restore choice ${letter}`
                  : `Eliminate choice ${letter}`
              }
              aria-pressed={isEliminated}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-sans text-sm font-medium transition disabled:opacity-40 ${
                isEliminated
                  ? "border-arc-ink bg-arc-ink text-white"
                  : "border-arc-line bg-white text-arc-muted hover:border-arc-muted hover:text-arc-ink"
              }`}
            >
              <span className="relative leading-none">
                {letter}
                <span
                  className="absolute left-1/2 top-1/2 h-px w-[1.1em] -translate-x-1/2 -translate-y-1/2 rotate-[-28deg] bg-current"
                  aria-hidden
                />
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
