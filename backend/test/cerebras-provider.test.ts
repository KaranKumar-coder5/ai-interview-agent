import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearSessions, createSession } from "../src/ai/context.js";
import { createProviderFromEnv } from "../src/ai/llm/factory.js";
import { FallbackInterviewProvider } from "../src/ai/llm/fallback.js";
import { CerebrasProvider } from "../src/ai/llm/cerebras.js";
import { DeterministicInterviewProvider } from "../src/ai/llm/provider.js";
import type { Question, Session } from "../src/ai/types.js";

describe("Cerebras LLM Provider Unit & Integration Tests", () => {
  const origFetch = globalThis.fetch;
  const origEnv = { ...process.env };

  const sampleQuestion: Question = {
    id: "q-cerebras-1",
    day: 1,
    dayTitle: "LLM Foundations",
    topic: "Prompt Engineering",
    question: "Explain the role of context windows in transformer LLMs.",
  };

  const sampleCandidate = {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "AI Engineer",
    yearsExperience: 4,
    education: "M.S. AI",
    status: "ACTIVE",
  };

  let testSession: Session;

  beforeEach(() => {
    clearSessions();
    process.env.CEREBRAS_API_KEY = "csk-test-secret-key-123456";
    process.env.LLM_PROVIDER = "cerebras";
    testSession = createSession("session-cerebras-test", sampleCandidate, "CAND-001");
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    process.env = { ...origEnv };
    clearSessions();
  });

  it("1. Analyzes candidate answer successfully using mock Cerebras API", async () => {
    let capturedHeader = "";

    globalThis.fetch = async (url: any, options: any) => {
      capturedHeader = options.headers["Authorization"];
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 9,
                  depth: "deep",
                  keywordsFound: ["context", "window", "attention"],
                  gapsIdentified: [],
                  feedbackSnippet: "Comprehensive explanation of context window limits and self-attention memory requirements.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456", "llama-3.3-70b", 5000);
    const analysis = await cerebras.analyzeAnswer(
      sampleQuestion,
      "The context window determines the maximum token count for attention computations.",
      testSession,
    );

    assert.equal(analysis.score, 9);
    assert.equal(analysis.depth, "deep");
    assert.deepEqual(analysis.keywordsFound, ["context", "window", "attention"]);
    assert.equal(capturedHeader, "Bearer csk-test-secret-key-123456");
  });

  it("2. Generates targeted follow-up question successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  followUpQuestion: "How do RoPE (Rotary Position Embeddings) extend context length capabilities?",
                  targetedGap: "positional encoding",
                  reasoning: "Candidate discussed context limits but not RoPE scaling.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    const followUp = await cerebras.generateFollowUp(
      sampleQuestion,
      "Context windows cap max tokens.",
      {
        score: 6,
        depth: "adequate",
        keywordsFound: ["context"],
        gapsIdentified: ["positional encoding"],
        feedbackSnippet: "Brief answer.",
      },
      testSession,
    );

    assert.ok(followUp.includes("Rotary Position Embeddings"));
  });

  it("3. Generates evaluation feedback successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: "Sarah demonstrated deep architectural mastery of transformer context and memory limits.",
                  overallScore: 92,
                  strengths: ["Strong understanding of self-attention memory complexity."],
                  areasForImprovement: ["Study long-context KV cache compression techniques."],
                  topicBreakdown: [
                    { day: 1, title: "LLM Foundations", score: 92, status: "strong" },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    const feedback = await cerebras.generateFeedback(testSession);

    assert.equal(feedback.candidateName, "Sarah Johnson");
    assert.equal(feedback.overallScore, 92);
    assert.equal(feedback.strengths.length, 1);
  });

  it("4. Throws descriptive error when CEREBRAS_API_KEY is missing", () => {
    delete process.env.CEREBRAS_API_KEY;
    delete process.env.LLM_PROVIDER;

    assert.throws(
      () => new CerebrasProvider(undefined),
      /CEREBRAS_API_KEY is missing or unconfigured/,
    );
  });

  it("5. Throws error on HTTP 401 Unauthorized failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Unauthorized", { status: 401, statusText: "Unauthorized" });
    };

    const cerebras = new CerebrasProvider("csk-invalid-key");
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Cerebras API returned HTTP error 401/,
    );
  });

  it("6. Throws error on HTTP 429 Rate Limit failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Too Many Requests", { status: 429, statusText: "Rate Limited" });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Cerebras API returned HTTP error 429/,
    );
  });

  it("7. Throws error on HTTP 500 Server failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Server Error" });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Cerebras API returned HTTP error 500/,
    );
  });

  it("8. Throws error on request timeout", async () => {
    globalThis.fetch = async (_url: any, options: any) => {
      return new Promise((_, reject) => {
        const signal = options.signal;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456", "llama-3.3-70b", 50);
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /timed out after 50ms/,
    );
  });

  it("9. Throws error on malformed non-JSON completion response", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Not a valid JSON payload from Cerebras model",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Cerebras returned malformed structured answer analysis JSON/,
    );
  });

  it("10. Throws error on invalid structured JSON schema", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: "not_a_number",
                  depth: "invalid_depth_value",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    await assert.rejects(
      () => cerebras.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Cerebras returned malformed structured answer analysis JSON/,
    );
  });

  it("11. Guarantees API key is sent only in Authorization header and never appears in output", async () => {
    const secretKey = "csk-super-secret-key-999888777";
    let sentHeaders: any = {};

    globalThis.fetch = async (_url: any, options: any) => {
      sentHeaders = options.headers;
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 10,
                  depth: "deep",
                  keywordsFound: ["context"],
                  gapsIdentified: [],
                  feedbackSnippet: "Flawless response.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider(secretKey);
    const result = await cerebras.analyzeAnswer(sampleQuestion, "Perfect explanation", testSession);

    // Verify secret key was sent strictly in HTTP Authorization header
    assert.equal(sentHeaders["Authorization"], `Bearer ${secretKey}`);

    // Verify secret key never appears in returned analysis object
    const serializedResult = JSON.stringify(result);
    assert.equal(serializedResult.includes(secretKey), false);
  });

  it("12. Factory creates Cerebras provider wrapped in FallbackInterviewProvider when configured", () => {
    process.env.LLM_PROVIDER = "cerebras";
    process.env.CEREBRAS_API_KEY = "csk-test-key-factory";

    const provider = createProviderFromEnv();
    assert.ok(provider instanceof FallbackInterviewProvider);

    const obs = (provider as FallbackInterviewProvider).getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, false);
  });

  it("13. Provider-Aware Fallback: Cerebras success reports provider=cerebras and fallback=false", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 8,
                  depth: "deep",
                  keywordsFound: ["context"],
                  gapsIdentified: [],
                  feedbackSnippet: "Clear explanation.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    const fallbackWrapper = new FallbackInterviewProvider(cerebras, new DeterministicInterviewProvider(), "cerebras");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Context window tokens", testSession);
    assert.equal(analysis.score, 8);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, false);
  });

  it("14. Provider-Aware Fallback: Cerebras HTTP 500 degrades to deterministic and reports provider=cerebras, fallback=true", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Error", { status: 500, statusText: "Server Error" });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    const fallbackWrapper = new FallbackInterviewProvider(cerebras, new DeterministicInterviewProvider(), "cerebras");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Context window tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "provider_error");
  });

  it("15. Provider-Aware Fallback: Cerebras 429 rate-limiting reports provider=cerebras, fallbackReason=rate_limit", async () => {
    globalThis.fetch = async () => {
      return new Response("Rate limit exceeded", { status: 429, statusText: "Too Many Requests" });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456");
    const fallbackWrapper = new FallbackInterviewProvider(cerebras, new DeterministicInterviewProvider(), "cerebras");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Context window tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "rate_limit");
  });

  it("16. Provider-Aware Fallback: Cerebras timeout reports provider=cerebras, fallbackReason=timeout", async () => {
    globalThis.fetch = async (_url: any, options: any) => {
      return new Promise((_, reject) => {
        const signal = options.signal;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    };

    const cerebras = new CerebrasProvider("csk-test-secret-key-123456", "llama-3.3-70b", 20);
    const fallbackWrapper = new FallbackInterviewProvider(cerebras, new DeterministicInterviewProvider(), "cerebras");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Context window tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "timeout");
  });

  it("17. Provider-Aware Fallback: Missing CEREBRAS_API_KEY reports provider=cerebras, fallbackReason=missing_configuration", async () => {
    const fallbackWrapper = new FallbackInterviewProvider(null, new DeterministicInterviewProvider(), "cerebras");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Context window tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "cerebras");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "missing_configuration");
  });

  it("18. Provider-Aware Fallback: Deterministic mode reports provider=deterministic", async () => {
    const fallbackWrapper = new FallbackInterviewProvider(new DeterministicInterviewProvider(), new DeterministicInterviewProvider(), "deterministic");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.ok(analysis);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "deterministic");
    assert.equal(obs.fallback, false);
  });
});
