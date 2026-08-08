export interface LLMConfig {
  provider: "gemini" | "grok" | "deterministic";
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export function getLLMConfig(): LLMConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const xaiApiKey = process.env.XAI_API_KEY?.trim();
  const rawProvider = process.env.LLM_PROVIDER?.trim().toLowerCase();

  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const xaiModel = process.env.XAI_MODEL?.trim() || "grok-2-latest";

  const rawTimeoutMs = process.env.LLM_TIMEOUT_MS
    ? Number.parseInt(process.env.LLM_TIMEOUT_MS, 10)
    : 5000;
  const timeoutMs =
    Number.isNaN(rawTimeoutMs) || rawTimeoutMs <= 0 ? 5000 : rawTimeoutMs;

  let provider: "gemini" | "grok" | "deterministic";
  let apiKey: string | undefined;
  let model: string;

  if (rawProvider === "gemini") {
    provider = "gemini";
    apiKey = geminiApiKey || undefined;
    model = geminiModel;
  } else if (rawProvider === "grok") {
    provider = "grok";
    apiKey = xaiApiKey || undefined;
    model = xaiModel;
  } else if (rawProvider === "deterministic") {
    provider = "deterministic";
    apiKey = undefined;
    model = "deterministic";
  } else {
    // If LLM_PROVIDER is not set: default to gemini if GEMINI_API_KEY exists, else grok if XAI_API_KEY exists, else deterministic
    if (geminiApiKey) {
      provider = "gemini";
      apiKey = geminiApiKey;
      model = geminiModel;
    } else if (xaiApiKey) {
      provider = "grok";
      apiKey = xaiApiKey;
      model = xaiModel;
    } else {
      provider = "deterministic";
      apiKey = undefined;
      model = "deterministic";
    }
  }

  return {
    provider,
    apiKey,
    model,
    timeoutMs,
  };
}
