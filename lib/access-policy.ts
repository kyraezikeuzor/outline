export const FREE_QUESTION_LIMIT = 100;

export const FREE_QUESTION_LIMIT_ERROR =
  "You have used all 100 questions included with the Free plan. Upgrade to Plus to keep practicing new questions.";

/**
 * `tier` is the entitlement level; `isPro` stays as the coarse "has full
 * question-bank access" flag that the question-bank gates read, and is true for
 * both Plus and Max (and admins).
 */
export type QuestionAccess = {
  tier: "free" | "plus" | "max";
  planId: string;
  planLabel: string;
  isPro: boolean;
  uniqueQuestionsUsed: number;
  questionLimit: number | null;
  remainingQuestions: number | null;
  canAccessNewQuestion: boolean;
  accessEndsAt: string | null;
  provider: string | null;
};
