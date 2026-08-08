import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearSessions, createSession } from "../src/ai/context.js";
import { FallbackInterviewProvider } from "../src/ai/llm/fallback.js";
import { GrokProvider } from "../src/ai/llm/grok.js";
import { DeterministicInterviewProvider } from "../src/ai/llm/provider.js";
import type { Question, Session } from "../src/ai/types.js";

describe("Grok LLM Provider Unit & Integration Tests", () => {
  const origFetch = globalThis.fetch;
  const origEnv = { ...process.env };

  const sampleQuestion: Question = {
    id: "q-grok-1",
    day: 1,
    dayTitle: "LLM Foundations",
    topic: "Prompt Engineering",
    question: "Explain the role of temperature in LLM sampling.",
  };

  const sampleCandidate = {
    id: "CAND-001",
    name: "Alex Rivera",
    jobRole: "AI Engineer",
    yearsExperience: 3,
    education: "B.S. CS",
    status: "ACTIVE",
  };

  let testSession: Session;

  beforeEach(() => {
    clearSessions();
    process.env.XAI_API_KEY = "xai-test-secret-key-999";
    process.env.LLM_PROVIDER = "grok";
    testSession = createSession("session-grok-test", sampleCandidate, "CAND-001");
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    process.env = { ...origEnv };
    clearSessions();
  });

  it("1. Analyzes candidate answer successfully using mock Grok API", async () => {
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
                  keywordsFound: ["temperature", "sampling", "logits"],
                  gapsIdentified: [],
                  feedbackSnippet: "Clear explanation of sampling randomness and logits.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const grok = new GrokProvider("xai-test-secret-key-999", "grok-2-latest", 5000);
    const analysis = await grok.analyzeAnswer(
      sampleQuestion,
      "Higher temperature increases randomness by flattening logit distributions.",
      testSession,
    );

    assert.equal(analysis.score, 9);
    assert.equal(analysis.depth, "deep");
    assert.deepEqual(analysis.keywordsFound, ["temperature", "sampling", "logits"]);
    assert.equal(capturedHeader, "Bearer xai-test-secret-key-999");
  });

  it("2. Generates targeted follow-up question successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  followUpQuestion: "How does top-p (nucleus sampling) differ from temperature?",
                  targetedGap: "top-p sampling",
                  reasoning: "Candidate discussed temperature but not top-p truncation.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    const followUp = await grok.generateFollowUp(
      sampleQuestion,
      "Higher temperature increases randomness.",
      {
        score: 5,
        depth: "superficial",
        keywordsFound: ["temperature"],
        gapsIdentified: ["top-p"],
        feedbackSnippet: "Brief response.",
      },
      testSession,
    );

    assert.ok(followUp.includes("nucleus sampling"));
  });

  it("3. Generates evaluation feedback successfully", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: "Alex displayed solid understanding of LLM sampling controls.",
                  overallScore: 88,
                  strengths: ["Clear logit mathematical intuition."],
                  areasForImprovement: ["Study nucleus sampling mechanics."],
                  topicBreakdown: [
                    { day: 1, title: "LLM Foundations", score: 88, status: "strong" },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    const feedback = await grok.generateFeedback(testSession);

    assert.equal(feedback.candidateName, "Alex Rivera");
    assert.equal(feedback.overallScore, 88);
    assert.equal(feedback.strengths.length, 1);
  });

  it("4. Throws descriptive error when XAI_API_KEY is missing", () => {
    delete process.env.XAI_API_KEY;
    delete process.env.LLM_PROVIDER;

    assert.throws(
      () => new GrokProvider(undefined),
      /XAI_API_KEY is missing or unconfigured/,
    );
  });

  it("5. Throws error on HTTP 500 server failure", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Server Error" });
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    await assert.rejects(
      () => grok.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Grok API returned HTTP error 500/,
    );
  });

  it("6. Throws error on HTTP 429 rate limit error", async () => {
    globalThis.fetch = async () => {
      return new Response("Too Many Requests", { status: 429, statusText: "Rate Limited" });
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    await assert.rejects(
      () => grok.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Grok API returned HTTP error 429/,
    );
  });

  it("7. Throws error on request timeout", async () => {
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

    const grok = new GrokProvider("xai-test-secret-key-999", "grok-2-latest", 50);
    await assert.rejects(
      () => grok.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /timed out after 50ms/,
    );
  });

  it("8. Throws error on malformed non-JSON completion response", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Not a valid JSON response from Grok model",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    await assert.rejects(
      () => grok.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Grok returned malformed structured answer analysis JSON/,
    );
  });

  it("9. Throws error on invalid structured JSON schema", async () => {
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

    const grok = new GrokProvider("xai-test-secret-key-999");
    await assert.rejects(
      () => grok.analyzeAnswer(sampleQuestion, "test answer", testSession),
      /Grok returned malformed structured answer analysis JSON/,
    );
  });

  it("10 & 11. Guarantees API key is sent only in Authorization header and never appears in output", async () => {
    const secretKey = "xai-top-secret-token-abcdef123456";
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
                  keywordsFound: ["temperature"],
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

    const grok = new GrokProvider(secretKey);
    const result = await grok.analyzeAnswer(sampleQuestion, "Perfect explanation", testSession);

    // Verify secret key was sent strictly in HTTP Authorization header
    assert.equal(sentHeaders["Authorization"], `Bearer ${secretKey}`);

    // Verify secret key never appears in returned analysis object
    const serializedResult = JSON.stringify(result);
    assert.equal(serializedResult.includes(secretKey), false);
  });

  it("12. Provider-Aware Fallback: Grok success reports provider=grok and fallback=false", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 9,
                  depth: "deep",
                  keywordsFound: ["token"],
                  gapsIdentified: [],
                  feedbackSnippet: "Good answer.",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    const fallbackWrapper = new FallbackInterviewProvider(grok, new DeterministicInterviewProvider(), "grok");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.equal(analysis.score, 9);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "grok");
    assert.equal(obs.fallback, false);
  });

  it("13. Provider-Aware Fallback: Grok HTTP 500 degrades to deterministic and reports provider=grok, fallback=true", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Server Error" });
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    const fallbackWrapper = new FallbackInterviewProvider(grok, new DeterministicInterviewProvider(), "grok");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.ok(analysis); // Deterministic fallback result returned

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "grok");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "provider_error");
  });

  it("14. Provider-Aware Fallback: Grok 429 rate-limiting reports provider=grok, fallbackReason=rate_limit", async () => {
    globalThis.fetch = async () => {
      return new Response("Too Many Requests", { status: 429, statusText: "Rate Limited" });
    };

    const grok = new GrokProvider("xai-test-secret-key-999");
    const fallbackWrapper = new FallbackInterviewProvider(grok, new DeterministicInterviewProvider(), "grok");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.ok(analysis);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "grok");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "rate_limit");
  });

  it("15. Provider-Aware Fallback: Grok timeout reports provider=grok, fallbackReason=timeout", async () => {
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

    const grok = new GrokProvider("xai-test-secret-key-999", "grok-2-latest", 10);
    const fallbackWrapper = new FallbackInterviewProvider(grok, new DeterministicInterviewProvider(), "grok");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.ok(analysis);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "grok");
    assert.equal(obs.fallback, true);
    assert.equal(obs.fallbackReason, "timeout");
  });

  it("16. Provider-Aware Fallback: Deterministic mode reports provider=deterministic", async () => {
    const fallbackWrapper = new FallbackInterviewProvider(new DeterministicInterviewProvider(), new DeterministicInterviewProvider(), "deterministic");

    const analysis = await fallbackWrapper.analyzeAnswer(sampleQuestion, "token prediction", testSession);
    assert.ok(analysis);

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "deterministic");
    assert.equal(obs.fallback, false);
  });
});
