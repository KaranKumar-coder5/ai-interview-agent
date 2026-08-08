import { AnswerAnalyzer } from "./analyzer.js";
import {
  appendAnswer,
  createSession,
  getSession,
  markQuestionAsked,
} from "./context.js";
import { buildFeedback } from "./feedback.js";
import { createProviderFromEnv } from "./llm/factory.js";
import type { LLMProvider } from "./llm/provider.js";
import { InterviewPlanner } from "./planner.js";
import type { Candidate, InterviewResponse } from "./types.js";

export { getLLMConfig } from "./llm/config.js";
export { createProviderFromEnv } from "./llm/factory.js";
export { FallbackInterviewProvider } from "./llm/fallback.js";
export { GeminiProvider } from "./llm/gemini.js";
export { DeterministicInterviewProvider } from "./llm/provider.js";
export type { LLMProvider } from "./llm/provider.js";

export class InterviewError extends Error {
  constructor(
    public readonly code: "session_not_found" | "interview_already_ended",
    message: string,
  ) {
    super(message);
    this.name = "InterviewError";
  }
}

// Configurable provider instance (defaulting to environment auto-detection)
let currentProvider: LLMProvider = createProviderFromEnv();

export function setLLMProvider(provider: LLMProvider): void {
  currentProvider = provider;
}

export function getLLMProvider(): LLMProvider {
  return currentProvider;
}

/** First request: create a session and ask the first question. */
export async function startInterview(
  sessionId: string,
  candidate: Candidate,
): Promise<InterviewResponse> {
  const session = createSession(sessionId, candidate);
  const planner = new InterviewPlanner(currentProvider);

  const plan = await planner.planNextTurn(session);

  if (plan.done || !plan.turn) {
    session.done = true;
    const feedback = buildFeedback(session, currentProvider);
    return {
      sessionId,
      reply: "No questions are available for this curriculum yet.",
      done: true,
      feedback,
    };
  }

  session.turns.push(plan.turn);
  markQuestionAsked(sessionId, plan.turn.questionId);

  return {
    sessionId,
    reply: plan.reply,
    done: false,
    feedback: null,
  };
}

/** Subsequent requests: analyze answer, handle follow-ups, and advance curriculum. */
export async function continueInterview(
  sessionId: string,
  message: string,
): Promise<InterviewResponse> {
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

  // Get the last active turn that was waiting for an answer
  const currentTurn = session.turns[session.turns.length - 1];
  if (currentTurn) {
    currentTurn.candidateAnswer = message;

    // Analyze the candidate's answer
    const analyzer = new AnswerAnalyzer(currentProvider);
    const questionObj = {
      id: currentTurn.questionId,
      topic: currentTurn.topic,
      question: currentTurn.questionText,
      day: currentTurn.day,
      dayTitle: currentTurn.dayTitle,
    };

    const analysis = await analyzer.analyze(questionObj, message, session);
    currentTurn.analysis = analysis;

    if (!session.topicScores[currentTurn.topic]) {
      session.topicScores[currentTurn.topic] = [];
    }
    session.topicScores[currentTurn.topic].push(analysis.score);
  }

  const planner = new InterviewPlanner(currentProvider);
  const lastAnalysis = currentTurn?.analysis;

  const plan = await planner.planNextTurn(session, lastAnalysis);

  if (plan.done) {
    session.done = true;
    const feedback = buildFeedback(session, currentProvider);
    return {
      sessionId,
      reply: `Interview complete! ${feedback.summary} Thanks for your time, ${session.candidate.name}.`,
      done: true,
      feedback,
    };
  }

  if (plan.turn) {
    session.turns.push(plan.turn);
    markQuestionAsked(sessionId, plan.turn.questionId);
  }

  return {
    sessionId,
    reply: plan.reply,
    done: false,
    feedback: null,
  };
}
