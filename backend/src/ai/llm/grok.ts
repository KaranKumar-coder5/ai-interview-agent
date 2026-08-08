import type { AnswerAnalysis, Feedback, Question, Session } from "../types.js";
import { getLLMConfig } from "./config.js";
import type { LLMProvider } from "./provider.js";
import {
  buildAnswerAnalysisPrompt,
  buildFeedbackPrompt,
  buildFollowUpPrompt,
} from "./prompts.js";
import {
  parseJsonContent,
  validateAnswerAnalysis,
  validateFeedback,
  validateFollowUp,
} from "./validator.js";

export class GrokProvider implements LLMProvider {
  private apiKey: string;
  private modelName: string;
  private timeoutMs: number;
  private baseUrl: string;

  constructor(
    apiKey?: string,
    modelName?: string,
    timeoutMs?: number,
    baseUrl?: string,
  ) {
    const config = getLLMConfig();
    const key = apiKey || config.apiKey;

    if (!key) {
      throw new Error("XAI_API_KEY is missing or unconfigured.");
    }

    this.apiKey = key;
    this.modelName = modelName || (config.provider === "grok" ? config.model : "grok-2-latest");
    this.timeoutMs = timeoutMs || config.timeoutMs || 5000;
    this.baseUrl = baseUrl || "https://api.x.ai/v1/chat/completions";
  }

  private async generateWithTimeout(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(
          `Grok API returned HTTP error ${response.status}: ${response.statusText}`,
        );
      }

      const body = (await response.json()) as any;
      const text = body?.choices?.[0]?.message?.content;

      if (!text || typeof text !== "string" || text.trim() === "") {
        throw new Error("Grok API returned empty completion content.");
      }

      return text;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Grok request timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    }
  }

  async analyzeAnswer(
    question: Question,
    candidateAnswer: string,
    session: Session,
  ): Promise<AnswerAnalysis> {
    const prompt = buildAnswerAnalysisPrompt(question, candidateAnswer, session);
    const rawText = await this.generateWithTimeout(prompt);
    const json = parseJsonContent(rawText);
    const validated = validateAnswerAnalysis(json);

    if (!validated) {
      throw new Error("Grok returned malformed structured answer analysis JSON.");
    }

    return validated;
  }

  async generateFollowUp(
    question: Question,
    candidateAnswer: string,
    analysis: AnswerAnalysis,
    session: Session,
  ): Promise<string> {
    const prompt = buildFollowUpPrompt(question, candidateAnswer, analysis, session);
    const rawText = await this.generateWithTimeout(prompt);
    const json = parseJsonContent(rawText);
    const validated = validateFollowUp(json);

    if (!validated) {
      throw new Error("Grok returned malformed structured follow-up JSON.");
    }

    return validated;
  }

  async generateFeedback(session: Session): Promise<Feedback> {
    const prompt = buildFeedbackPrompt(session);
    const rawText = await this.generateWithTimeout(prompt);
    const json = parseJsonContent(rawText);
    const validated = validateFeedback(json, session.candidate.name);

    if (!validated) {
      throw new Error("Grok returned malformed structured feedback JSON.");
    }

    return validated;
  }
}
