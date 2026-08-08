import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearSessions } from "../src/ai/context.js";
import {
  continueInterview,
  DeterministicInterviewProvider,
  FallbackInterviewProvider,
  getLLMConfig,
  setLLMProvider,
  startInterview,
} from "../src/ai/index.js";
import type { LLMProvider } from "../src/ai/llm/provider.js";
import {
  parseJsonContent,
  validateAnswerAnalysis,
  validateFeedback,
  validateFollowUp,
} from "../src/ai/llm/validator.js";
import type { AnswerAnalysis, Feedback, Question, Session } from "../src/ai/types.js";

describe("Gemini Provider, Validator & Resilient Fallback Tests", () => {
  beforeEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  afterEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  it("1. Resolves LLM configuration accurately from environment variables", () => {
    const config = getLLMConfig();
    assert.ok(typeof config.model === "string");
    assert.ok(typeof config.timeoutMs === "number");
    assert.equal(config.provider, "deterministic"); // Default when API keys are not set
  });

  it("1b. Resolves Grok configuration when LLM_PROVIDER=grok or XAI_API_KEY is present", () => {
    const origProvider = process.env.LLM_PROVIDER;
    const origXaiKey = process.env.XAI_API_KEY;
    const origXaiModel = process.env.XAI_MODEL;
    const origGeminiKey = process.env.GEMINI_API_KEY;

    try {
      delete process.env.GEMINI_API_KEY;
      process.env.LLM_PROVIDER = "grok";
      process.env.XAI_API_KEY = "xai-test-key-123";
      process.env.XAI_MODEL = "grok-2-custom";

      const config = getLLMConfig();
      assert.equal(config.provider, "grok");
      assert.equal(config.apiKey, "xai-test-key-123");
      assert.equal(config.model, "grok-2-custom");

      // Test fallback resolution when LLM_PROVIDER is unset but XAI_API_KEY is set
      delete process.env.LLM_PROVIDER;
      const configAuto = getLLMConfig();
      assert.equal(configAuto.provider, "grok");

      // Test explicit provider without API key (returns provider with undefined key without throwing)
      process.env.LLM_PROVIDER = "grok";
      delete process.env.XAI_API_KEY;
      const configNoKey = getLLMConfig();
      assert.equal(configNoKey.provider, "grok");
      assert.equal(configNoKey.apiKey, undefined);
    } finally {
      if (origProvider) process.env.LLM_PROVIDER = origProvider; else delete process.env.LLM_PROVIDER;
      if (origXaiKey) process.env.XAI_API_KEY = origXaiKey; else delete process.env.XAI_API_KEY;
      if (origXaiModel) process.env.XAI_MODEL = origXaiModel; else delete process.env.XAI_MODEL;
      if (origGeminiKey) process.env.GEMINI_API_KEY = origGeminiKey; else delete process.env.GEMINI_API_KEY;
    }
  });

  it("2. Parses and validates valid Answer Analysis JSON", () => {
    const raw = `\`\`\`json
    {
      "score": 9,
      "depth": "deep",
      "keywordsFound": ["token", "transformer"],
      "gapsIdentified": [],
      "feedbackSnippet": "Excellent explanation of transformer token mechanics."
    }
    \`\`\``;

    const parsed = parseJsonContent(raw);
    const validated = validateAnswerAnalysis(parsed);

    assert.ok(validated);
    assert.equal(validated.score, 9);
    assert.equal(validated.depth, "deep");
    assert.deepEqual(validated.keywordsFound, ["token", "transformer"]);
  });

  it("3. Rejects malformed JSON and invalid structured schemas", () => {
    assert.equal(parseJsonContent("invalid { json"), null);

    const invalidSchema = {
      score: "not_a_number",
      depth: "unknown_depth",
    };
    assert.equal(validateAnswerAnalysis(invalidSchema), null);
  });

  it("4. Validates structured follow-up JSON correctly", () => {
    const valid = {
      followUpQuestion: "How do you handle context window limit truncation?",
      targetedGap: "context window",
      reasoning: "Candidate omitted memory limits.",
    };
    assert.equal(validateFollowUp(valid), "How do you handle context window limit truncation?");

    const invalid = { followUpQuestion: "" };
    assert.equal(validateFollowUp(invalid), null);
  });

  it("5. Validates structured feedback JSON correctly", () => {
    const valid = {
      summary: "Candidate completed overall interview with solid results.",
      overallScore: 88,
      strengths: ["Strong knowledge of vector search."],
      areasForImprovement: ["Study evaluation metrics like ROUGE."],
      topicBreakdown: [{ day: 1, title: "LLM Foundations", score: 90, status: "strong" }],
    };

    const validated = validateFeedback(valid, "Priya");
    assert.ok(validated);
    assert.equal(validated.candidateName, "Priya");
    assert.equal(validated.overallScore, 88);
    assert.equal(validated.strengths.length, 1);
  });

  it("6 & 7 & 8. FallbackInterviewProvider degrades to deterministic on provider errors/timeouts", async () => {
    class FailingPrimaryProvider implements LLMProvider {
      analyzeAnswer(): AnswerAnalysis {
        throw new Error("Simulated upstream provider outage.");
      }
      generateFollowUp(): string {
        throw new Error("Simulated upstream provider outage.");
      }
      generateFeedback(): Feedback {
        throw new Error("Simulated upstream provider outage.");
      }
    }

    const fallbackProvider = new FallbackInterviewProvider(
      new FailingPrimaryProvider(),
      new DeterministicInterviewProvider(),
    );

    setLLMProvider(fallbackProvider);

    await startInterview("fb-1", { name: "FallbackUser" });
    const res = await continueInterview("fb-1", "brief answer");

    assert.equal(res.done, false);
    // Verified fallback executed without throwing runtime crash and preserving attempted provider identity
    const state = fallbackProvider.getObservabilityState();
    assert.equal(state.provider, "gemini");
    assert.equal(state.fallback, true);
    assert.equal(state.fallbackReason, "provider_error");
  });

  it("9. FallbackInterviewProvider handles missing primary configuration smoothly", async () => {
    const fallbackProvider = new FallbackInterviewProvider(
      null,
      new DeterministicInterviewProvider(),
    );

    setLLMProvider(fallbackProvider);

    await startInterview("fb-2", { name: "NoConfigUser" });
    const res = await continueInterview("fb-2", "A deep explanation of tokens and transformers");

    assert.equal(res.done, false);
    const state = fallbackProvider.getObservabilityState();
    assert.equal(state.provider, "deterministic");
    assert.equal(state.fallback, true);
    assert.equal(state.fallbackReason, "missing_configuration");
  });

  it("10 & 11 & 12 & 13. Executable Primary Provider produces valid output when healthy", async () => {
    class HealthyPrimaryProvider implements LLMProvider {
      analyzeAnswer(_q: Question, _ans: string, _s: Session): AnswerAnalysis {
        return {
          score: 10,
          depth: "deep",
          keywordsFound: ["transformer", "prediction"],
          gapsIdentified: [],
          feedbackSnippet: "Flawless technical explanation.",
        };
      }
      generateFollowUp(_q: Question, _ans: string, _a: AnswerAnalysis, _s: Session): string {
        return "Can you explain attention mechanisms?";
      }
      generateFeedback(session: Session): Feedback {
        return {
          candidateName: session.candidate.name,
          answered: 8,
          total: 8,
          summary: "Outstanding candidate performance.",
          overallScore: 95,
          strengths: ["Domain mastery."],
          areasForImprovement: ["None."],
          topicBreakdown: [{ day: 1, title: "LLM Foundations", score: 95, status: "strong" }],
        };
      }
    }

    const fallbackProvider = new FallbackInterviewProvider(
      new HealthyPrimaryProvider(),
      new DeterministicInterviewProvider(),
    );

    setLLMProvider(fallbackProvider);

    await startInterview("healthy-1", { name: "StarCandidate" });
    await continueInterview("healthy-1", "Transformers use self attention to predict tokens");

    const state = fallbackProvider.getObservabilityState();
    assert.equal(state.provider, "gemini");
    assert.equal(state.fallback, false);
  });
});
