import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearSessions, createSession } from "../src/ai/context.js";
import { createProviderFromEnv } from "../src/ai/llm/factory.js";
import { FallbackInterviewProvider } from "../src/ai/llm/fallback.js";
import { GroqProvider } from "../src/ai/llm/groq.js";
import { DeterministicInterviewProvider } from "../src/ai/llm/provider.js";
import type { Question, Session } from "../src/ai/types.js";

describe("Groq LLM Provider Unit & Integration Tests", () => {
  const origFetch = globalThis.fetch;
  const origEnv = { ...process.env };

  const sampleQuestion: Question = {
    id: "q-groq-1",
    day: 1,
    dayTitle: "LLM Foundations",
    topic: "Prompt Engineering",
    question: "Explain how attention mechanisms process contextual token embeddings.",
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
    process.env.GROQ_API_KEY = "gsk-test-secret-key-987654";
    process.env.LLM_PROVIDER = "groq";
    testSession = createSession("session-groq-test", sampleCandidate, "CAND-001");
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    process.env = { ...origEnv };
    clearSessions();
  });

  it("1. Analyzes candidate answer successfully using mock Groq API", async () => {
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
                  keywordsFound: ["attention", "tokens", "embeddings"],
                  gapsIdentified: [],
                  feedbackSnippet: "Excellent breakdown of Query, Key, and Value projections in multi-head attention.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654", "openai/gpt-oss-120b", 5000);
    const analysis = await groq.analyzeAnswer(
      sampleQuestion,
      "Multi-head self-attention projects queries, keys, and values into parallel attention heads.",
      testSession,
    );

    assert.equal(analysis.score, 9);
    assert.equal(analysis.depth, "deep");
    assert.deepEqual(analysis.keywordsFound, ["attention", "tokens", "embeddings"]);
    assert.equal(capturedHeader, "Bearer gsk-test-secret-key-987654");
  });

  it("2. Generates targeted follow-up question successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  followUpQuestion: "How does FlashAttention optimize QKV memory bandwidth bottlenecks?",
                  targetedGap: "memory efficiency",
                  reasoning: "Candidate understands attention math but did not address hardware memory access costs.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    const followUp = await groq.generateFollowUp(
      sampleQuestion,
      "Self attention computes dot products across token embeddings.",
      {
        score: 7,
        depth: "adequate",
        keywordsFound: ["attention"],
        gapsIdentified: ["memory efficiency"],
        feedbackSnippet: "Good answer.",
      },
      testSession,
    );

    assert.ok(followUp.includes("FlashAttention"));
  });

  it("3. Generates evaluation feedback successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: "Sarah exhibited outstanding technical depth in LLM attention layers and vector embeddings.",
                  overallScore: 94,
                  strengths: ["Flawless command of transformer attention math."],
                  areasForImprovement: ["Explore speculative decoding strategies."],
                  topicBreakdown: [
                    { day: 1, title: "LLM Foundations", score: 94, status: "strong" },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    const feedback = await groq.generateFeedback(testSession);

    assert.equal(feedback.candidateName, "Sarah Johnson");
    assert.equal(feedback.overallScore, 94);
    assert.equal(feedback.strengths.length, 1);
  });

  it("4. Throws descriptive error when GROQ_API_KEY is missing", () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_PROVIDER;

    assert.throws(
      () => new GroqProvider(undefined),
      /GROQ_API_KEY is missing or unconfigured/,
    );
  });

  it("5. Throws error on HTTP 401 Unauthorized failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Unauthorized", { status: 401, statusText: "Unauthorized" });
    };

    const groq = new GroqProvider("gsk-invalid-key");
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Groq API returned HTTP error 401/,
    );
  });

  it("6. Throws error on HTTP 429 Rate Limit failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Too Many Requests", { status: 429, statusText: "Rate Limited" });
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Groq API returned HTTP error 429/,
    );
  });

  it("7. Throws error on HTTP 500 Server failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Server Error" });
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Groq API returned HTTP error 500/,
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

    const groq = new GroqProvider("gsk-test-secret-key-987654", "openai/gpt-oss-120b", 50);
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
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
                content: "Not a valid JSON payload from Groq model",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Groq returned malformed structured answer analysis JSON/,
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
                  score: "invalid_number",
                  depth: "unrecognized",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    await assert.rejects(
      () => groq.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Groq returned malformed structured answer analysis JSON/,
    );
  });

  it("11. Guarantees API key is sent only in Authorization header and never appears in output", async () => {
    const secretKey = "gsk-super-secret-key-111222333";
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
                  keywordsFound: ["attention"],
                  gapsIdentified: [],
                  feedbackSnippet: "Outstanding execution.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider(secretKey);
    const result = await groq.analyzeAnswer(sampleQuestion, "Flawless response", testSession);

    assert.equal(sentHeaders["Authorization"], `Bearer ${secretKey}`);
    const serializedResult = JSON.stringify(result);
    assert.equal(serializedResult.includes(secretKey), false);
  });

  it("12. Factory creates Groq provider wrapped in FallbackInterviewProvider when configured", () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "gsk-test-key-factory";

    const provider = createProviderFromEnv();
    assert.ok(provider instanceof FallbackInterviewProvider);

    const obs = (provider as FallbackInterviewProvider).getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, false);
  });

  it("13. Provider-Aware Fallback: Groq success reports provider=groq and fallback=false", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 9,
                  depth: "deep",
                  keywordsFound: ["attention"],
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

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Attention mechanism tokens", testSession);
    assert.equal(analysis.score, 9);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, false);
  });

  it("14. Provider-Aware Fallback: Groq HTTP 500 degrades to deterministic and reports provider=groq, fallback=true", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Error", { status: 500, statusText: "Server Error" });
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Attention mechanism tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "provider_error");
  });

  it("15. Provider-Aware Fallback: Groq 429 rate-limiting reports provider=groq, fallbackReason=rate_limit", async () => {
    globalThis.fetch = async () => {
      return new Response("Rate limit exceeded", { status: 429, statusText: "Too Many Requests" });
    };

    const groq = new GroqProvider("gsk-test-secret-key-987654");
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Attention mechanism tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "rate_limit");
  });

  it("16. Provider-Aware Fallback: Groq timeout reports provider=groq, fallbackReason=timeout", async () => {
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

    const groq = new GroqProvider("gsk-test-secret-key-987654", "openai/gpt-oss-120b", 20);
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Attention mechanism tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "timeout");
  });

  it("17. Provider-Aware Fallback: Missing GROQ_API_KEY reports provider=groq, fallbackReason=missing_configuration", async () => {
    const fallbackWrapper = new FallbackInterviewProvider(null, new DeterministicInterviewProvider(), "groq");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "Attention mechanism tokens", testSession);
    assert.ok(analysis.score >= 1);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "missing_configuration");
  });
});
