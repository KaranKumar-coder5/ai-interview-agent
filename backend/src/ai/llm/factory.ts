import { getLLMConfig } from "./config.js";
import { FallbackInterviewProvider } from "./fallback.js";
import { GeminiProvider } from "./gemini.js";
import { GrokProvider } from "./grok.js";
import { DeterministicInterviewProvider } from "./provider.js";
import type { LLMProvider } from "./provider.js";

export function createProviderFromEnv(): LLMProvider {
  const config = getLLMConfig();
  const deterministic = new DeterministicInterviewProvider();

  if (config.provider === "gemini" && config.apiKey) {
    try {
      const gemini = new GeminiProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(gemini, deterministic);
    } catch {
      return new FallbackInterviewProvider(null, deterministic);
    }
  }

  if (config.provider === "grok" && config.apiKey) {
    try {
      const grok = new GrokProvider(config.apiKey, config.model, config.timeoutMs);
      return new FallbackInterviewProvider(grok, deterministic);
    } catch {
      return new FallbackInterviewProvider(null, deterministic);
    }
  }

  return new FallbackInterviewProvider(null, deterministic);
}
