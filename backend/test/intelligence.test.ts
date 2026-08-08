import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { clearSessions, getSession } from "../src/ai/context.js";
import {
  continueInterview,
  DeterministicInterviewProvider,
  getLLMProvider,
  setLLMProvider,
  startInterview,
} from "../src/ai/index.js";
import type { LLMProvider } from "../src/ai/llm/provider.js";

describe("Interview Intelligence Architecture", () => {
  beforeEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  it("triggers follow-up question when candidate answer is superficial", async () => {
    await startInterview("intel-1", { name: "Marcus", role: "ML Engineer" });

    // Provide a very brief / superficial answer
    const res = await continueInterview("intel-1", "yes");

    assert.equal(res.done, false);
    assert.match(res.reply, /\[Follow-up\]/);

    const session = getSession("intel-1");
    assert.ok(session);
    assert.equal(session.turns[session.turns.length - 1].isFollowUp, true);
    assert.equal(session.turns[0].analysis?.depth, "superficial");
  });

  it("evaluates deep answer accurately without forcing unnecessary follow-ups", async () => {
    await startInterview("intel-2", { name: "Priya", role: "AI Engineer" });

    const answer =
      "A large language model uses a transformer architecture for next-token prediction based on trained weights and token probabilities.";
    const res = await continueInterview("intel-2", answer);

    assert.equal(res.done, false);
    assert.doesNotMatch(res.reply, /\[Follow-up\]/);

    const session = getSession("intel-2");
    assert.ok(session);
    assert.equal(session.turns[0].analysis?.depth, "deep");
  });

  it("guarantees 8+ questions, 4+ curriculum days, session history, and rich feedback", async () => {
    await startInterview("intel-3", { name: "Aria" });

    const answers = [
      "Transformers process tokens and predict next tokens via probability.",
      "Context window limits token count, memory usage, and enterprise latency cost.",
      "RAG combines document retrieval with vector embeddings for external search.",
      "Evaluate chunk precision, recall, and rerank relevance using eval metrics.",
      "Agents use autonomous action loops and tool call functions.",
      "Loops use retries, state fallbacks, and error handling for robust execution.",
      "Use Rouge, BLEU, and faithfulness metrics for summarization eval.",
      "Monitor production latency, throughput, token cost, drift, and log alerts.",
    ];

    let res = { done: false, feedback: null } as {
      done: boolean;
      feedback: any;
    };

    for (const ans of answers) {
      res = await continueInterview("intel-3", ans);
    }

    // 1. Completion & Minimum 8 questions requirement check
    assert.equal(res.done, true);
    const session = getSession("intel-3");
    assert.ok(session);
    assert.ok(session.turns.length >= 8, `Expected at least 8 questions, got ${session.turns.length}`);

    // 2. Minimum 4 curriculum days requirement check
    const uniqueDays = new Set(session.turns.map((t) => t.day));
    assert.ok(uniqueDays.size >= 4, `Expected at least 4 curriculum days covered, got ${uniqueDays.size}`);

    // 3. Session history content verification (question, answer, topic, analysis, follow-up decision)
    const turn1 = session.turns[0];
    assert.ok(turn1.questionId);
    assert.ok(turn1.questionText);
    assert.ok(turn1.candidateAnswer);
    assert.ok(turn1.topic);
    assert.ok(turn1.analysis);
    assert.ok(typeof turn1.analysis.score === "number");
    assert.ok(typeof turn1.isFollowUp === "boolean");

    // 4. Final feedback verification (topic breakdown & improvement recommendations)
    assert.ok(res.feedback);
    assert.equal(res.feedback.candidateName, "Aria");
    assert.ok(Array.isArray(res.feedback.topicBreakdown));
    assert.ok(res.feedback.topicBreakdown.length >= 4);
    assert.ok(Array.isArray(res.feedback.strengths));
    assert.ok(Array.isArray(res.feedback.areasForImprovement));
    assert.ok(res.feedback.areasForImprovement.length > 0);
    assert.ok(typeof res.feedback.overallScore === "number");
  });

  it("supports plugging in custom LLMProvider adapters dynamically", async () => {
    let mockCalled = false;

    class CustomMockLLMProvider extends DeterministicInterviewProvider implements LLMProvider {
      override analyzeAnswer(q: any, ans: any, session: any) {
        mockCalled = true;
        return super.analyzeAnswer(q, ans, session);
      }
    }

    setLLMProvider(new CustomMockLLMProvider());

    await startInterview("mock-1", { name: "TestUser" });
    await continueInterview("mock-1", "test response for custom provider");

    assert.equal(mockCalled, true);
  });
});
