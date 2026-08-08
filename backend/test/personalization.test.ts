import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearSessions } from "../src/ai/context.js";
import {
  continueInterview,
  createProviderFromEnv,
  derivePersonalizationSignals,
  DeterministicInterviewProvider,
  getCandidateById,
  getPersonalizedQuestions,
  InterviewError,
  setLLMProvider,
  startInterview,
} from "../src/ai/index.js";
import type { CandidateRecord } from "../src/ai/types.js";

describe("Milestone 5C — Personalized Interview Engine Verification", () => {
  beforeEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  afterEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  it("1. Candidates with different learning histories receive different prioritized curriculum signals", () => {
    const cand1 = getCandidateById("CAND-001");
    const cand2 = getCandidateById("CAND-002");
    assert.ok(cand1);
    assert.ok(cand2);

    const questions1 = getPersonalizedQuestions(cand1);
    const questions2 = getPersonalizedQuestions(cand2);

    // Initial questions differ based on prioritized learning gaps
    assert.notEqual(
      questions1[0].id,
      questions2[0].id,
      "Expected CAND-001 and CAND-002 to have different initial question priorities based on their distinct learning histories",
    );
  });

  it("2. Failed/weak mission areas receive higher priority than strong areas", () => {
    const syntheticRecord: CandidateRecord = {
      member: {
        id: "TEST-WEAK-RAG",
        name: "Test User",
        jobRole: "AI Dev",
        yearsExperience: 2,
        education: "BS",
        status: "ACTIVE",
      },
      missions: [
        { day: 7, title: "Embeddings Explained", passed: false, attempts: 3 },
        { day: 8, title: "Vector Databases Overview", passed: false, attempts: 2 },
        { day: 12, title: "Prompt Engineering", passed: true, attempts: 1 },
      ],
      signals: { commitDays: 10, missionsCompleted: 5, missionsFirstTry: 3 },
    };

    const signals = derivePersonalizationSignals(syntheticRecord);
    const ragSignal = signals.find((s) => s.evaluationDay === 2);
    const promptSignal = signals.find((s) => s.evaluationDay === 1);

    assert.ok(ragSignal);
    assert.ok(promptSignal);
    assert.ok(ragSignal.riskScore > promptSignal.riskScore);
    assert.equal(ragSignal.priority, "HIGH");

    const questions = getPersonalizedQuestions(syntheticRecord);
    assert.equal(questions[0].day, 2, "Expected Day 2 (RAG) to be prioritized due to failed missions");
  });

  it("3. Multi-attempt missions influence prioritization score deterministically", () => {
    const syntheticRecord: CandidateRecord = {
      member: {
        id: "TEST-MULTI-ATTEMPT",
        name: "Attempt Tester",
        jobRole: "Engineer",
        yearsExperience: 4,
        education: "BS",
        status: "ACTIVE",
      },
      missions: [
        { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 5 },
        { day: 23, title: "Model Context Protocol", passed: true, attempts: 4 },
      ],
      signals: { commitDays: 15, missionsCompleted: 10, missionsFirstTry: 2 },
    };

    const signals = derivePersonalizationSignals(syntheticRecord);
    const agentSignal = signals.find((s) => s.evaluationDay === 3);

    assert.ok(agentSignal);
    assert.ok(agentSignal.riskScore >= 10);
    assert.equal(agentSignal.priority, "HIGH");

    const questions = getPersonalizedQuestions(syntheticRecord);
    assert.equal(questions[0].day, 3, "Expected Day 3 (Agents) to be prioritized due to high attempt counts");
  });

  it("4. Skipped missions are handled safely and increase domain priority", () => {
    const syntheticRecord: CandidateRecord = {
      member: {
        id: "TEST-SKIPPED",
        name: "Skip Tester",
        jobRole: "Dev",
        yearsExperience: 3,
        education: "MS",
        status: "ACTIVE",
      },
      missions: [
        { day: 29, title: "Monitoring & Observability", skipped: true },
      ],
      signals: { commitDays: 20, missionsCompleted: 15, missionsFirstTry: 10 },
    };

    const signals = derivePersonalizationSignals(syntheticRecord);
    const obsSignal = signals.find((s) => s.evaluationDay === 4);

    assert.ok(obsSignal);
    assert.ok(obsSignal.riskScore >= 8);
    assert.equal(obsSignal.priority, "HIGH");

    const questions = getPersonalizedQuestions(syntheticRecord);
    assert.equal(questions[0].day, 4, "Expected Day 4 (Observability) to be prioritized due to skipped mission");
  });

  it("5. Personalization is derived from candidate mission data and NOT hardcoded by candidate ID", () => {
    const record1 = getCandidateById("CAND-001");
    assert.ok(record1);

    // Create an identical clone with a different ID
    const clonedRecord: CandidateRecord = {
      ...record1,
      member: { ...record1.member, id: "CAND-CUSTOM-99" },
    };

    const questionsOriginal = getPersonalizedQuestions(record1);
    const questionsClone = getPersonalizedQuestions(clonedRecord);

    assert.deepEqual(
      questionsOriginal.map((q) => q.id),
      questionsClone.map((q) => q.id),
      "Expected question prioritization to depend strictly on mission signals, not hardcoded ID checks",
    );
  });

  it("6. The personalized interview still reaches at least 8 questions", async () => {
    await startInterview("pers-1", "CAND-001");

    let res = { done: false } as any;
    for (let i = 0; i < 8; i++) {
      res = await continueInterview(
        "pers-1",
        "Detailed explanation covering token prediction, context length, vector embeddings, agents, and observability metrics.",
      );
    }

    assert.equal(res.done, true);
    assert.ok(res.feedback);
    assert.ok(res.feedback.answered >= 8);
  });

  it("7. The personalized interview still covers at least 4 curriculum days", async () => {
    await startInterview("pers-2", "CAND-002");

    for (let i = 0; i < 8; i++) {
      await continueInterview(
        "pers-2",
        "Detailed technical response covering transformers, RAG retrieval, agent loops, and evaluation metrics.",
      );
    }

    const { getSessionProgress } = await import("../src/ai/progress.js");
    const progress = getSessionProgress("pers-2");

    assert.equal(progress.completed, true);
    assert.ok(progress.daysCovered >= 4, `Expected at least 4 days covered, got ${progress.daysCovered}`);
  });

  it("8. Existing superficial-answer follow-up behavior still works in personalized session", async () => {
    const startRes = await startInterview("pers-fu", "CAND-001");
    assert.equal(startRes.done, false);

    // Superficial single-word answer triggers follow-up
    const fuRes = await continueInterview("pers-fu", "yes");

    assert.equal(fuRes.done, false);
    assert.match(fuRes.reply, /\[Follow-up\]/);
  });

  it("9. Existing strong-answer behavior advances curriculum smoothly", async () => {
    await startInterview("pers-strong", "CAND-001");

    const answer =
      "Transformers process tokens using multi-head self-attention mechanisms to calculate contextual representations and predict next tokens.";
    const res = await continueInterview("pers-strong", answer);

    assert.equal(res.done, false);
    assert.doesNotMatch(res.reply, /\[Follow-up\]/);
  });

  it("10. Existing candidate payload object compatibility continues to work", async () => {
    const res = await startInterview("pers-compat", { name: "LegacyUser", role: "Developer" });
    assert.equal(res.sessionId, "pers-compat");
    assert.equal(res.done, false);
    assert.match(res.reply, /Hi LegacyUser!/);
  });

  it("11. CAND-001 and CAND-002 can start independent personalized sessions", async () => {
    const res1 = await startInterview("sess-cand-1", "CAND-001");
    const res2 = await startInterview("sess-cand-2", "CAND-002");

    assert.equal(res1.sessionId, "sess-cand-1");
    assert.equal(res2.sessionId, "sess-cand-2");
    assert.match(res1.reply, /Hi Sarah Johnson/);
    assert.match(res2.reply, /Hi Alex Turner/);

    // Verified independent question ordering for both sessions
    assert.notEqual(res1.reply, res2.reply);
  });

  it("12. Unknown candidateId returns clear candidate_not_found error", async () => {
    await assert.rejects(
      async () => await startInterview("sess-invalid", "CAND-999"),
      (err: unknown) =>
        err instanceof InterviewError && err.code === "candidate_not_found",
    );
  });
});
