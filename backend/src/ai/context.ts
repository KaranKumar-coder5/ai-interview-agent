import type { Candidate, Session } from "./types.js";

/**
 * In-memory session store keyed by sessionId.
 * Resets on process restart — no persistence by design (database is out of scope).
 */
const sessions = new Map<string, Session>();

export function createSession(sessionId: string, candidate: Candidate): Session {
  const session: Session = {
    sessionId,
    candidate,
    turns: [],
    askedQuestions: [],
    answers: [],
    currentDayIndex: 0,
    currentQuestionInDayIndex: 0,
    followUpsOnCurrentQuestion: 0,
    nextQuestionIndex: 0,
    topicScores: {},
    startedAt: Date.now(),
    done: false,
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function appendAnswer(sessionId: string, message: string): Session | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  session.answers.push(message);
  return session;
}

export function markQuestionAsked(sessionId: string, questionId: string): void {
  const session = sessions.get(sessionId);
  if (session) session.askedQuestions.push(questionId);
}

/** Test helper only. */
export function clearSessions(): void {
  sessions.clear();
}
