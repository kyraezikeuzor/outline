export type DigitalSatModuleKey =
  | "reading_writing_1"
  | "reading_writing_2"
  | "math_1"
  | "math_2";

export type DigitalSatModuleCorrect = Record<DigitalSatModuleKey, number>;

export type DigitalSatScoreEstimate = {
  reading_writing: number;
  math: number;
  total: number;
};

/**
 * Module-aware Digital SAT score estimates for the current 27/27/22/22 format.
 *
 * These tables intentionally score each module separately. That preserves the
 * effect of first-module performance on an adaptive Digital SAT estimate while
 * avoiding the legacy 66-question R&W and 54-question Math conversion chart.
 */
const MODULE_SCORE_TABLES: Record<DigitalSatModuleKey, readonly number[]> = {
  reading_writing_1: [
    100, 100, 120, 140, 160, 170, 180, 190, 200, 200, 210, 210, 220, 230,
    240, 260, 270, 290, 310, 320, 340, 360, 370, 390, 410, 430, 440, 460,
  ],
  reading_writing_2: [
    100, 100, 100, 110, 110, 110, 120, 120, 120, 130, 130, 140, 150, 170,
    190, 190, 200, 210, 230, 240, 250, 260, 280, 290, 300, 310, 330, 340,
  ],
  math_1: [
    100, 100, 120, 140, 160, 160, 180, 180, 200, 200, 210, 240, 260, 280,
    300, 320, 340, 360, 390, 410, 430, 450, 470,
  ],
  math_2: [
    100, 100, 100, 120, 120, 130, 150, 170, 170, 170, 190, 190, 200, 200,
    210, 230, 240, 260, 270, 290, 300, 320, 330,
  ],
};

function getModuleScore(module: DigitalSatModuleKey, correct: number) {
  const table = MODULE_SCORE_TABLES[module];
  const index = Math.max(0, Math.min(Math.round(correct), table.length - 1));
  return table[index];
}

export function getDigitalSatScore(
  correct: DigitalSatModuleCorrect
): DigitalSatScoreEstimate {
  const readingWriting =
    getModuleScore("reading_writing_1", correct.reading_writing_1) +
    getModuleScore("reading_writing_2", correct.reading_writing_2);
  const math =
    getModuleScore("math_1", correct.math_1) +
    getModuleScore("math_2", correct.math_2);

  return {
    reading_writing: readingWriting,
    math,
    total: readingWriting + math,
  };
}
