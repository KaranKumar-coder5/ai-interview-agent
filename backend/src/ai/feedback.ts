import type { Feedback, Session } from "./types.js";

export function buildFeedback(session: Session): Feedback {
  return {
    candidateName: session.candidate.name,
    answered: session.answers.length,
    total: session.askedQuestions.length,
    summary: `${session.candidate.name} answered ${session.answers.length} of ${session.askedQuestions.length} questions across ${session.askedQuestions.length} turns.`,
  };
}
