import { GoogleGenAI } from "@google/genai";
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

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;
  private modelName: string;
  private timeoutMs: number;

  constructor(apiKey?: string, modelName?: string, timeoutMs?: number) {
    const config = getLLMConfig();
    const key = apiKey || config.apiKey;

    if (!key) {
      throw new Error("GEMINI_API_KEY is missing or unconfigured.");
    }

    this.ai = new GoogleGenAI({ apiKey: key });
    this.modelName = modelName || config.model;
    this.timeoutMs = timeoutMs || config.timeoutMs;
  }

  private async generateWithTimeout(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      clearTimeout(timer);

      const text = response.text;
      if (!text || text.trim() === "") {
        throw new Error("Gemini returned empty text completion.");
      }

      return text;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Gemini request timed out after ${this.timeoutMs}ms.`);
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
      throw new Error("Gemini returned malformed structured answer analysis JSON.");
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
      throw new Error("Gemini returned malformed structured follow-up JSON.");
    }

    return validated;
  }

  async generateFeedback(session: Session): Promise<Feedback> {
    const prompt = buildFeedbackPrompt(session);
    const rawText = await this.generateWithTimeout(prompt);
    const json = parseJsonContent(rawText);
    const validated = validateFeedback(json, session.candidate.name);

    if (!validated) {
      throw new Error("Gemini returned malformed structured feedback JSON.");
    }

    return validated;
  }
}
