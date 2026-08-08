import { getLLMConfig } from "./config.js";
import { CerebrasProvider } from "./cerebras.js";
import { FallbackInterviewProvider } from "./fallback.js";
import { GeminiProvider } from "./gemini.js";
import { GrokProvider } from "./grok.js";
import { GroqProvider } from "./groq.js";
import { DeterministicInterviewProvider } from "./provider.js";
import type { LLMProvider } from "./provider.js";

export function createProviderFromEnv(): LLMProvider {
  const config = getLLMConfig();
  const deterministic = new DeterministicInterviewProvider();

  if (config.provider === "groq" && config.apiKey) {
    try {
      const groq = new GroqProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(groq, deterministic, "groq");
    } catch {
      return new FallbackInterviewProvider(null, deterministic, "groq");
    }
  }

  if (config.provider === "cerebras" && config.apiKey) {
    try {
      const cerebras = new CerebrasProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(cerebras, deterministic, "cerebras");
    } catch {
      return new FallbackInterviewProvider(null, deterministic, "cerebras");
    }
  }

  if (config.provider === "gemini" && config.apiKey) {
    try {
      const gemini = new GeminiProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(gemini, deterministic, "gemini");
    } catch {
      return new FallbackInterviewProvider(null, deterministic, "gemini");
    }
  }

  if (config.provider === "grok" && config.apiKey) {
    try {
      const grok = new GrokProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(grok, deterministic, "grok");
    } catch {
      return new FallbackInterviewProvider(null, deterministic, "grok");
    }
  }

  return new FallbackInterviewProvider(null, deterministic, "deterministic");
}
