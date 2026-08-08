import { loadCurriculum } from "./data.js";
import type { Question } from "./types.js";

export function getQuestions(): Question[] {
  const curriculum = loadCurriculum();
  return curriculum.days.flatMap((day) =>
    day.questions.map((q) => ({ ...q, day: day.day, dayTitle: day.title })),
  );
}

export function getQuestionAt(index: number): Question | undefined {
  return getQuestions()[index];
}

export function totalQuestions(): number {
  return getQuestions().length;
}
