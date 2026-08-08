import type { LLMProvider } from "./llm/provider.js";
import type { AnswerAnalysis, Question, Session } from "./types.js";

export class AnswerAnalyzer {
  constructor(private provider: LLMProvider) {}

  async analyze(
    question: Question,
    candidateAnswer: string,
    session: Session,
  ): Promise<AnswerAnalysis> {
    return this.provider.analyzeAnswer(question, candidateAnswer, session);
  }
}
