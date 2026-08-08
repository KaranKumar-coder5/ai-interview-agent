import type {
  AdaptiveDecision,
  AnswerAnalysis,
  Feedback,
  GeneratedQuestion,
  Question,
  QuestionGenerationContext,
  Session,
} from "../types.js";

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
  provider: "gemini" | "grok" | "cerebras" | "groq" | "deterministic";
  fallback: boolean;
  fallbackReason?: FallbackReason;
  questionGeneration?: boolean;
  strategy?: string;
  difficulty?: string;
}

export class FallbackInterviewProvider implements LLMProvider {
  private primary: LLMProvider | null;
  private fallback: LLMProvider;
  private primaryName: "gemini" | "grok" | "cerebras" | "groq" | "deterministic";
  private lastObservabilityState: FallbackObservabilityState;

  constructor(
    primaryProvider?: LLMProvider | null,
    fallbackProvider?: LLMProvider,
    primaryName?: "gemini" | "grok" | "cerebras" | "groq" | "deterministic",
  ) {
    this.primary = primaryProvider ?? null;
    this.fallback = fallbackProvider || new DeterministicInterviewProvider();

    if (primaryName) {
      this.primaryName = primaryName;
    } else if (this.primary) {
      const ctorName = this.primary.constructor.name;
      if (ctorName === "GroqProvider") {
        this.primaryName = "groq";
      } else if (ctorName === "CerebrasProvider") {
        this.primaryName = "cerebras";
      } else if (ctorName === "GrokProvider") {
        this.primaryName = "grok";
      } else if (ctorName === "GeminiProvider") {
        this.primaryName = "gemini";
      } else if (ctorName === "DeterministicInterviewProvider") {
        this.primaryName = "deterministic";
      } else {
        this.primaryName = "gemini";
      }
    } else {
      this.primaryName = "deterministic";
    }

    this.lastObservabilityState = {
      provider: this.primaryName,
      fallback: !this.primary,
      fallbackReason: !this.primary ? "missing_configuration" : undefined,
      questionGeneration: false,
    };
  }

  getObservabilityState(): FallbackObservabilityState {
    return { ...this.lastObservabilityState };
  }

  private categorizeError(err: unknown): FallbackReason {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (
        msg.includes("missing") ||
        msg.includes("unconfigured") ||
        msg.includes("401") ||
        msg.includes("unauthorized")
      ) {
        return "missing_configuration";
      }
      if (msg.includes("time") || msg.includes("timeout") || msg.includes("abort")) {
        return "timeout";
      }
      if (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("econnrefused")
      ) {
        return "network_error";
      }
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
        return "rate_limit";
      }
      if (
        msg.includes("malformed") ||
        msg.includes("invalid") ||
        msg.includes("json")
      ) {
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
        this.lastObservabilityState = { provider: this.primaryName, fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: this.primaryName,
          fallback: true,
          fallbackReason: reason,
        };
        if (process.env.NODE_ENV !== "production") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[FallbackInterviewProvider Dev Observability] Primary provider "${this.primaryName}" analyzeAnswer failed (${reason}): ${msg}`,
          );
        }
      }
    } else {
      this.lastObservabilityState = {
        provider: this.primaryName,
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
        this.lastObservabilityState = { provider: this.primaryName, fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: this.primaryName,
          fallback: true,
          fallbackReason: reason,
        };
        if (process.env.NODE_ENV !== "production") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[FallbackInterviewProvider Dev Observability] Primary provider "${this.primaryName}" generateFollowUp failed (${reason}): ${msg}`,
          );
        }
      }
    } else {
      this.lastObservabilityState = {
        provider: this.primaryName,
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
        this.lastObservabilityState = { provider: this.primaryName, fallback: false };
        return result;
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: this.primaryName,
          fallback: true,
          fallbackReason: reason,
        };
        if (process.env.NODE_ENV !== "production") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[FallbackInterviewProvider Dev Observability] Primary provider "${this.primaryName}" generateFeedback failed (${reason}): ${msg}`,
          );
        }
      }
    } else {
      this.lastObservabilityState = {
        provider: this.primaryName,
        fallback: true,
        fallbackReason: "missing_configuration",
      };
    }

    return this.fallback.generateFeedback(session);
  }

  async selectNextQuestion(
    availableQuestions: Question[],
    lastAnalysis?: AnswerAnalysis,
    session?: Session,
  ): Promise<AdaptiveDecision | null> {
    if (this.primary && typeof this.primary.selectNextQuestion === "function") {
      try {
        const res = await this.primary.selectNextQuestion(
          availableQuestions,
          lastAnalysis,
          session,
        );
        if (res) {
          this.lastObservabilityState = { provider: this.primaryName, fallback: false };
          return res;
        }
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: this.primaryName,
          fallback: true,
          fallbackReason: reason,
        };
        if (process.env.NODE_ENV !== "production") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[FallbackInterviewProvider Dev Observability] Primary provider "${this.primaryName}" selectNextQuestion failed (${reason}): ${msg}`,
          );
        }
      }
    }
    return null;
  }

  async generateQuestion(
    context: QuestionGenerationContext,
  ): Promise<GeneratedQuestion | null> {
    if (this.primary && typeof this.primary.generateQuestion === "function") {
      try {
        const res = await this.primary.generateQuestion(context);
        if (res) {
          this.lastObservabilityState = {
            provider: this.primaryName,
            fallback: false,
            questionGeneration: true,
            strategy: context.strategy,
            difficulty: context.targetDifficulty,
          };
          return res;
        }
      } catch (err: unknown) {
        const reason = this.categorizeError(err);
        this.lastObservabilityState = {
          provider: this.primaryName,
          fallback: true,
          fallbackReason: reason,
          questionGeneration: false,
        };
        if (process.env.NODE_ENV !== "production") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[FallbackInterviewProvider Dev Observability] Primary provider "${this.primaryName}" generateQuestion failed (${reason}): ${msg}`,
          );
        }
      }
    }
    return null;
  }
}
