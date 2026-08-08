import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { AdaptiveQuestionSelector } from "../src/ai/adaptive.js";
import { clearSessions, createSession } from "../src/ai/context.js";
import { setLLMProvider, startInterview, continueInterview } from "../src/ai/index.js";
import { FallbackInterviewProvider } from "../src/ai/llm/fallback.js";
import { GroqProvider } from "../src/ai/llm/groq.js";
import { DeterministicInterviewProvider } from "../src/ai/llm/provider.js";
import { getQuestions } from "../src/ai/questions.js";
import type { AnswerAnalysis, Question, Session } from "../src/ai/types.js";

describe("Milestone 13 — Adaptive Interview Intelligence Unit & Integration Tests", () => {
  const origFetch = globalThis.fetch;
  const origEnv = { ...process.env };

  const sampleCandidate = {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "AI Engineer",
    yearsExperience: 4,
    education: "M.S. AI",
    status: "ACTIVE",
  };

  let session: Session;

  beforeEach(() => {
    clearSessions();
    process.env.GROQ_API_KEY = "gsk-test-secret-key-adaptive";
    process.env.LLM_PROVIDER = "groq";
    setLLMProvider(new FallbackInterviewProvider(new GroqProvider("gsk-test-secret-key-adaptive"), new DeterministicInterviewProvider(), "groq"));
    session = createSession("session-adaptive-test", sampleCandidate, "CAND-001");
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    process.env = { ...origEnv };
    clearSessions();
    setLLMProvider(createProviderFromEnvDefault());
  });

  function createProviderFromEnvDefault() {
    return new FallbackInterviewProvider(null, new DeterministicInterviewProvider(), "deterministic");
  }

  it("1. Weak answer triggers probe_weakness adaptive strategy", async () => {
    const selector = new AdaptiveQuestionSelector(new DeterministicInterviewProvider());
    session.askedQuestions = ["d1q1"];
    session.turns = [
      {
        questionId: "d1q1",
        questionText: "Explain Transformers",
        day: 1,
        dayTitle: "LLM Foundations",
        topic: "LLM internals",
        isFollowUp: false,
        candidateAnswer: "It predicts words.",
        analysis: {
          score: 3,
          depth: "superficial",
          keywordsFound: ["predicts"],
          gapsIdentified: ["self-attention"],
          feedbackSnippet: "Superficial answer",
        },
      },
    ];

    const decision = await selector.selectNextQuestion(session, session.turns[0].analysis);
    assert.equal(decision.strategy, "probe_weakness");
    assert.ok(decision.questionId.startsWith("d1"));
    assert.equal(session.askedQuestions.includes(decision.questionId), false);
  });

  it("2. Strong answer triggers deepen_strength adaptive strategy", async () => {
    const selector = new AdaptiveQuestionSelector(new DeterministicInterviewProvider());
    session.askedQuestions = ["d1q1"];
    session.turns = [
      {
        questionId: "d1q1",
        questionText: "Explain Transformers",
        day: 1,
        dayTitle: "LLM Foundations",
        topic: "LLM internals",
        isFollowUp: false,
        candidateAnswer: "Multi-head attention projects queries, keys, and values into sub-spaces.",
        analysis: {
          score: 9,
          depth: "deep",
          keywordsFound: ["multi-head", "queries", "keys", "values"],
          gapsIdentified: [],
          feedbackSnippet: "Deep answer",
        },
      },
    ];

    const decision = await selector.selectNextQuestion(session, session.turns[0].analysis);
    assert.equal(decision.strategy, "deepen_strength");
    assert.equal(decision.selectedQuestion.difficulty, "advanced");
  });

  it("3. Same question ID is NEVER selected twice in session", async () => {
    const selector = new AdaptiveQuestionSelector(new DeterministicInterviewProvider());
    session.askedQuestions = ["d1q1", "d1q2", "d1q3", "d1q4", "d2q1"];

    for (let i = 0; i < 5; i++) {
      const decision = await selector.selectNextQuestion(session);
      assert.equal(session.askedQuestions.includes(decision.questionId), false);
      session.askedQuestions.push(decision.questionId);
    }
  });

  it("4. Unknown LLM question ID is rejected and falls back deterministically", async () => {
    const mockGroqWithUnknownId = {
      analyzeAnswer: () => ({ score: 7, depth: "adequate" as const, keywordsFound: [], gapsIdentified: [], feedbackSnippet: "ok" }),
      generateFollowUp: () => "followup",
      generateFeedback: () => ({ candidateName: "Sarah", answered: 8, total: 8, summary: "ok", overallScore: 80, strengths: ["s"], areasForImprovement: ["a"], topicBreakdown: [] }),
      selectNextQuestion: async () => ({
        questionId: "hallucinated-nonexistent-q999",
        strategy: "probe_weakness" as const,
        reason: "LLM invented a non-existent question ID",
        selectedQuestion: { id: "hallucinated-nonexistent-q999", day: 1, dayTitle: "t", topic: "t", question: "q" },
      }),
    };

    const selector = new AdaptiveQuestionSelector(mockGroqWithUnknownId);
    session.askedQuestions = ["d1q1"];

    const decision = await selector.selectNextQuestion(session);
    assert.notEqual(decision.questionId, "hallucinated-nonexistent-q999");
    assert.ok(getQuestions().some((q) => q.id === decision.questionId));
  });

  it("5. Malformed adaptive JSON from LLM triggers deterministic fallback", async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "{ invalid_json_object: ",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const groq = new GroqProvider("gsk-test-secret-key-adaptive");
    const selector = new AdaptiveQuestionSelector(groq);
    session.askedQuestions = ["d1q1"];

    const decision = await selector.selectNextQuestion(session);
    assert.ok(getQuestions().some((q) => q.id === decision.questionId));
  });

  it("6. Groq timeout triggers deterministic fallback without crashing", async () => {
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

    const groq = new GroqProvider("gsk-test-secret-key-adaptive", "openai/gpt-oss-120b", 20);
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");
    const selector = new AdaptiveQuestionSelector(fallbackWrapper);
    session.askedQuestions = ["d1q1"];

    const decision = await selector.selectNextQuestion(session);
    assert.ok(decision.questionId);
    assert.ok(getQuestions().some((q) => q.id === decision.questionId));
  });

  it("7. Groq provider error does not crash interview continuation", async () => {
    globalThis.fetch = async () => {
      return new Response("Internal Server Error", { status: 500, statusText: "Server Error" });
    };

    const groq = new GroqProvider("gsk-test-secret-key-adaptive");
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");
    setLLMProvider(fallbackWrapper);

    const startRes = await startInterview("adaptive-session-err", "CAND-001");
    assert.equal(startRes.done, false);

    const contRes = await continueInterview(
      "adaptive-session-err",
      "Vector embeddings represent semantic relationships in high dimensional vector space.",
    );

    assert.equal(contRes.done, false);
    assert.ok(contRes.reply.length > 0);
  });

  it("8. Missing Groq configuration does not crash interview", async () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_PROVIDER;

    const fallbackWrapper = new FallbackInterviewProvider(null, new DeterministicInterviewProvider(), "deterministic");
    setLLMProvider(fallbackWrapper);

    const startRes = await startInterview("adaptive-no-config", "CAND-001");
    assert.equal(startRes.done, false);

    const contRes = await continueInterview("adaptive-no-config", "I am explaining vector search fundamentals.");
    assert.equal(contRes.done, false);
  });

  it("9. Adaptive selection respects 8 main question limit", async () => {
    setLLMProvider(new DeterministicInterviewProvider());
    let currentRes = await startInterview("limit-test-session", "CAND-001");

    let count = 0;
    while (!currentRes.done && count < 20) {
      count++;
      currentRes = await continueInterview(
        "limit-test-session",
        "Comprehensive technical explanation of architecture, embeddings, evaluation, and latency trade-offs.",
      );
    }

    assert.equal(currentRes.done, true);
    assert.ok(currentRes.feedback);
    assert.ok(currentRes.feedback.overallScore >= 0);
  });

  it("10. Existing sequential and personalized selection still works", async () => {
    const selector = new AdaptiveQuestionSelector(new DeterministicInterviewProvider());
    const decision = selector.selectDeterministicAdaptiveQuestion(
      session,
      getQuestions().filter((q) => q.id !== "d1q1"),
      undefined,
      null,
    );

    assert.ok(decision.questionId);
    assert.ok(decision.selectedQuestion);
  });

  it("11. Existing final evaluation still works", async () => {
    setLLMProvider(new DeterministicInterviewProvider());
    await startInterview("eval-test-session", "CAND-001");

    let res: any;
    for (let i = 0; i < 8; i++) {
      res = await continueInterview(
        "eval-test-session",
        "Deep technical response covering transformer attention mechanisms, vector databases, RAG precision, agents, and observability metrics.",
      );
    }

    assert.equal(res.done, true);
    assert.ok(res.feedback);
    assert.ok(typeof res.feedback.overallScore === "number");
    assert.ok(res.feedback.topicBreakdown.length > 0);
  });

  it("12. Existing provider observability state remains accessible", () => {
    const groq = new GroqProvider("gsk-test-secret-key-adaptive");
    const fallbackWrapper = new FallbackInterviewProvider(groq, new DeterministicInterviewProvider(), "groq");

    const obs = fallbackWrapper.getObservabilityState();
    assert.equal(obs.provider, "groq");
    assert.equal(obs.fallback, false);
  });
});
