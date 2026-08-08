import type { AnswerAnalysis, Question, Session } from "./types.js";

export type StrategyActionType = "FOLLOW_UP" | "NEXT_QUESTION" | "COMPLETE";

export interface StrategyDecision {
  action: StrategyActionType;
  nextQuestion?: Question;
  followUpPrompt?: string;
}

export class DecisionStrategy {
  shouldFollowUp(
    analysis: AnswerAnalysis | undefined,
    session: Session,
  ): boolean {
    if (!analysis) return false;
    // Limit follow-ups to maximum 1 per main question to keep pacing balanced
    if (session.followUpsOnCurrentQuestion >= 1) return false;
    // Ask follow-up if candidate answer was superficial or missing critical keywords
    return analysis.depth === "superficial";
  }
}
