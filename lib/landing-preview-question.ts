import type { Question } from "@/lib/questions";

/** Public question-bank sample, read from Supabase on 2026-09-13.
 * A fixed public demo avoids account writes and a database request on every visit.
 */
export const landingPreviewQuestion: Question = {
  "question_id": "arc_9ba172a169",
  "domain": "Algebra",
  "skill": "Linear equations in one variable",
  "tier": 2,
  "stem": "If \\(5(2x-1)-3=4(x+2)\\), what is the value of \\(3x+2\\)?",
  "choices": {
    "A": "10",
    "B": "8",
    "C": "12",
    "D": "14"
  },
  "correct_answer": "A",
  "rationale": "Expanding gives \\(10x-8=4x+8\\). Thus \\(6x=16\\), so \\(x=\\frac{8}{3}\\). Therefore, \\(3x+2=3\\left(\\frac{8}{3}\\right)+2=10\\).",
  "graph_spec": null
};
