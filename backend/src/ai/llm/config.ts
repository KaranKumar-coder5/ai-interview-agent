export interface LLMConfig {
  provider: "gemini" | "grok" | "cerebras" | "groq" | "deterministic";
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export function getLLMConfig(): LLMConfig {
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  const cerebrasApiKey = process.env.CEREBRAS_API_KEY?.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const xaiApiKey = process.env.XAI_API_KEY?.trim();
  const rawProvider = process.env.LLM_PROVIDER?.trim().toLowerCase();

  const groqModel = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";
  const cerebrasModel = process.env.CEREBRAS_MODEL?.trim() || "llama-3.3-70b";
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const xaiModel = process.env.XAI_MODEL?.trim() || "grok-2-latest";

  const rawTimeoutMs = process.env.LLM_TIMEOUT_MS
    ? Number.parseInt(process.env.LLM_TIMEOUT_MS, 10)
    : 5000;
  const timeoutMs =
    Number.isNaN(rawTimeoutMs) || rawTimeoutMs <= 0 ? 5000 : rawTimeoutMs;

  let provider: "gemini" | "grok" | "cerebras" | "groq" | "deterministic";
  let apiKey: string | undefined;
  let model: string;

  if (rawProvider === "groq") {
    provider = "groq";
    apiKey = groqApiKey || undefined;
    model = groqModel;
  } else if (rawProvider === "cerebras") {
    provider = "cerebras";
    apiKey = cerebrasApiKey || undefined;
    model = cerebrasModel;
  } else if (rawProvider === "gemini") {
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
    // If LLM_PROVIDER is unset: prefer Groq when GROQ_API_KEY exists, else Cerebras, Gemini, Grok/xAI, or deterministic
    if (groqApiKey) {
      provider = "groq";
      apiKey = groqApiKey;
      model = groqModel;
    } else if (cerebrasApiKey) {
      provider = "cerebras";
      apiKey = cerebrasApiKey;
      model = cerebrasModel;
    } else if (geminiApiKey) {
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
