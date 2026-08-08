import { Router } from "express";
import type { Request, Response } from "express";
import { getLLMProvider } from "../ai/index.js";
import { FallbackInterviewProvider } from "../ai/llm/fallback.js";

export const devRouter = Router();

/**
 * GET /api/dev/llm-status
 *
 * DEVELOPMENT-ONLY OBSERVABILITY ENDPOINT:
 * Returns the current in-memory LLM provider observability state.
 * Response schema: { provider: string, fallback: boolean, fallbackReason?: string }
 *
 * NEVER exposes API keys, environment variables, prompts, or candidate/session data.
 */
devRouter.get("/llm-status", (_req: Request, res: Response) => {
  const provider = getLLMProvider();

  if (provider instanceof FallbackInterviewProvider) {
    res.json(provider.getObservabilityState());
    return;
  }

  res.json({
    provider: "deterministic",
    fallback: false,
  });
});
