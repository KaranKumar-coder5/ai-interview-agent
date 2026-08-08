import {
  appendAnswer,
  createSession,
  getSession,
  markQuestionAsked,
} from "./context.js";
import { buildFeedback } from "./feedback.js";
import { getQuestionAt } from "./questions.js";
import type { Candidate, InterviewResponse } from "./types.js";

export class InterviewError extends Error {
  constructor(
    public readonly code: "session_not_found" | "interview_already_ended",
    message: string,
  ) {
    super(message);
    this.name = "InterviewError";
  }
}

/** First request: create a session and ask the first question. */
export function startInterview(
  sessionId: string,
  candidate: Candidate,
): InterviewResponse {
  const session = createSession(sessionId, candidate);
  const first = getQuestionAt(0);

  if (!first) {
    session.done = true;
    return {
      sessionId,
      reply: "No questions are available for this curriculum yet.",
      done: true,
      feedback: buildFeedback(session),
    };
  }

  markQuestionAsked(sessionId, first.id);
  return {
    sessionId,
    reply: `Hi ${candidate.name}! Welcome to your technical interview. Let's begin with Day ${first.day} — ${first.dayTitle}. ${first.question}`,
    done: false,
    feedback: null,
  };
}

/** Subsequent requests: record the answer and advance to the next question. */
export function continueInterview(
  sessionId: string,
  message: string,
): InterviewResponse {
  const session = getSession(sessionId);
  if (!session) {
    throw new InterviewError(
      "session_not_found",
      `No interview session found for sessionId "${sessionId}". Start a new session first.`,
    );
  }
  if (session.done) {
    throw new InterviewError(
      "interview_already_ended",
      "This interview session has already ended.",
    );
  }

  appendAnswer(sessionId, message);

  const nextIndex = session.nextQuestionIndex + 1;
  const next = getQuestionAt(nextIndex);

  if (!next) {
    session.done = true;
    session.nextQuestionIndex = nextIndex;
    const feedback = buildFeedback(session);
    return {
      sessionId,
      reply: `Interview complete! ${feedback.summary} Thanks for your time, ${session.candidate.name}.`,
      done: true,
      feedback,
    };
  }

  session.nextQuestionIndex = nextIndex;
  markQuestionAsked(sessionId, next.id);
  return {
    sessionId,
    reply: `Day ${next.day} — ${next.dayTitle}: ${next.question}`,
    done: false,
    feedback: null,
  };
}
