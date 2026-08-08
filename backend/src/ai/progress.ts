import { getSession } from "./context.js";
import { InterviewError } from "./errors.js";
import { buildFeedback } from "./feedback.js";
import type { Session, SessionProgress, SessionSummary } from "./types.js";

export function buildSessionProgress(session: Session): SessionProgress {
  const questionsAsked = session.turns.length;
  const answersRecorded = session.answers.length;
  const followUpCount = session.turns.filter((t) => t.isFollowUp).length;
  const daysCovered = new Set(session.turns.map((t) => t.day)).size;
  const topicsCovered = new Set(session.turns.map((t) => t.topic)).size;

  const activeTurn = session.turns[session.turns.length - 1];
  const currentPosition =
    !session.done && activeTurn
      ? {
          day: activeTurn.day,
          dayTitle: activeTurn.dayTitle,
          topic: activeTurn.topic,
          question: activeTurn.questionText,
          questionIndex: session.nextQuestionIndex,
        }
      : null;

  const feedback = session.done ? buildFeedback(session) : null;

  return {
    sessionId: session.sessionId,
    candidateId: session.candidateId,
    candidate: session.candidate,
    status: session.done ? "completed" : "active",
    questionsAsked,
    answersRecorded,
    followUpCount,
    daysCovered,
    topicsCovered,
    currentPosition,
    completed: session.done,
    feedback,
  };
}

export function getSessionProgress(sessionId: string): SessionProgress {
  const session = getSession(sessionId);
  if (!session) {
    throw new InterviewError(
      "session_not_found",
      `No interview session found for sessionId "${sessionId}".`,
    );
  }
  return buildSessionProgress(session);
}

export function buildSessionSummary(session: Session): SessionSummary {
  if (!session.done) {
    throw new InterviewError(
      "interview_not_completed",
      "Interview is not completed yet.",
    );
  }

  const feedback = buildFeedback(session);

  return {
    sessionId: session.sessionId,
    candidateId: session.candidateId,
    candidate: session.candidate,
    completed: true,
    totalQuestions: session.turns.length,
    totalAnswers: session.answers.length,
    followUpsAsked: session.turns.filter((t) => t.isFollowUp).length,
    daysCovered: new Set(session.turns.map((t) => t.day)).size,
    overallScore: feedback.overallScore,
    feedback,
  };
}

export function getSessionSummary(sessionId: string): SessionSummary {
  const session = getSession(sessionId);
  if (!session) {
    throw new InterviewError(
      "session_not_found",
      `No interview session found for sessionId "${sessionId}".`,
    );
  }
  return buildSessionSummary(session);
}
