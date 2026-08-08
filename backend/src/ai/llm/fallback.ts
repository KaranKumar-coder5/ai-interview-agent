import type { AnswerAnalysis, Feedback, Question, Session } from "../types.js";

import { DeterministicInterviewProvider } from "./provider.js";
import type { LLMProvider } from "./provider.js";

export type FallbackReason =
  | "missing_configuration"
  | "timeout"
  | "network_error"
  | "rate_limit"
  | "invalid_response"
  | "provider_error";

export interface FallbackObservabilityState {
  provider: "gemini" | "deterministic";
  fallback: boolean;
  fallbackReason?: FallbackReason;
}

export class FallbackInterviewProvider implements LLMProvider {
  private primary: LLMProvider | null;
  private fallback: LLMProvider;
  private lastObservabilityState: FallbackObservabilityState = {
    provider: "deterministic",
    fallback: false,
  };

  constructor(
    primaryProvider?: LLMProvider | null,
    fallbackProvider?: LLMProvider,
  ) {
    this.primary = primaryProvider ?? null;
    this.fallback = fallbackProvider || new DeterministicInterviewProvider();
  }

  getObservabilityState(): FallbackObservabilityState {
    return { ...this.lastObservabilityState };
  }

  private categorizeError(err: unknown): FallbackReason {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("missing") || msg.includes("unconfigured")) {
        return "missing_configuration";
      }
      if (msg.includes("time") || msg.includes("timeout") || msg.includes("abort")) {
        return "timeout";
      }
      if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
        return "network_error";
      }
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
        return "rate_limit";
      }
      if (msg.includes("malformed") || msg.includes("invalid") || msg.includes("json")) {
        return "invalid_response";
      }
    }
    return "provider_error";
  }

  async analyzeAnswer(
    question: Question,
    candidateAnswer: string,
    session: Session,
  ): Promise<AnswerAnalysis> {
    if (this.primary) {
      try {
        const result = await this.primary.analyzeAnswer(question, candidateAnswer, session);
        this.lastObservabilityState = { provider: "gemini", fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: "deterministic",
          fallback: true,
          fallbackReason: reason,
        };
      }
    } else {
      this.lastObservabilityState = {
        provider: "deterministic",
        fallback: true,
        fallbackReason: "missing_configuration",
      };
    }

    return this.fallback.analyzeAnswer(question, candidateAnswer, session);
  }

  async generateFollowUp(
    question: Question,
    candidateAnswer: string,
    analysis: AnswerAnalysis,
    session: Session,
  ): Promise<string> {
    if (this.primary) {
      try {
        const result = await this.primary.generateFollowUp(
          question,
          candidateAnswer,
          analysis,
          session,
        );
        this.lastObservabilityState = { provider: "gemini", fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: "deterministic",
          fallback: true,
          fallbackReason: reason,
        };
      }
    } else {
      this.lastObservabilityState = {
        provider: "deterministic",
        fallback: true,
        fallbackReason: "missing_configuration",
      };
    }

    return this.fallback.generateFollowUp(question, candidateAnswer, analysis, session);
  }

  async generateFeedback(session: Session): Promise<Feedback> {
    if (this.primary) {
      try {
        const result = await this.primary.generateFeedback(session);
        this.lastObservabilityState = { provider: "gemini", fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: "deterministic",
          fallback: true,
          fallbackReason: reason,
        };
      }
    } else {
      this.lastObservabilityState = {
        provider: "deterministic",
        fallback: true,
        fallbackReason: "missing_configuration",
      };
    }

    return this.fallback.generateFeedback(session);
  }
}
