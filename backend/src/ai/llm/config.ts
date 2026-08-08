export interface LLMConfig {
  provider: "gemini" | "deterministic";
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export function getLLMConfig(): LLMConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const rawProvider = process.env.LLM_PROVIDER?.trim().toLowerCase();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const timeoutMs = process.env.LLM_TIMEOUT_MS
    ? Number.parseInt(process.env.LLM_TIMEOUT_MS, 10)
    : 5000;

  let provider: "gemini" | "deterministic";

  if (rawProvider === "gemini") {
    provider = "gemini";
  } else if (rawProvider === "deterministic") {
    provider = "deterministic";
  } else {
    // If LLM_PROVIDER is not set, default to gemini if API key exists, else deterministic
    provider = apiKey ? "gemini" : "deterministic";
  }

  return {
    provider,
    apiKey: apiKey || undefined,
    model,
    timeoutMs: Number.isNaN(timeoutMs) || timeoutMs <= 0 ? 5000 : timeoutMs,
  };
}
