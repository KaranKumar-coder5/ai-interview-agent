import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { clearSessions } from "../src/ai/context.js";
import {
  continueInterview,
  DeterministicInterviewProvider,
  getSessionProgress,
  getSessionSummary,
  InterviewError,
  setLLMProvider,
  startInterview,
} from "../src/ai/index.js";

describe("Session Progress & Summary Layer", () => {
  beforeEach(() => {
    clearSessions();
    setLLMProvider(new DeterministicInterviewProvider());
  });

  it("builds correct progress and currentPosition immediately after session start", async () => {
    const startRes = await startInterview("prog-1", { name: "Alice", role: "AI Dev" });

    const progress = getSessionProgress("prog-1");

    assert.equal(progress.sessionId, "prog-1");
    assert.equal(progress.candidate.name, "Alice");
    assert.equal(progress.status, "active");
    assert.equal(progress.completed, false);
    assert.equal(progress.questionsAsked, 1);
    assert.equal(progress.answersRecorded, 0);
    assert.equal(progress.followUpCount, 0);
    assert.equal(progress.daysCovered, 1);
    assert.equal(progress.topicsCovered, 1);
    assert.equal(progress.feedback, null);

    // Verify currentPosition is the first question immediately after start
    assert.ok(progress.currentPosition);
    assert.equal(progress.currentPosition.day, 1);
    assert.equal(progress.currentPosition.topic, "LLM internals");
    assert.match(progress.currentPosition.question, /Explain what a large language model is/);
    assert.match(startRes.reply, new RegExp(escapeRegex(progress.currentPosition.question)));
  });

  it("updates currentPosition to the next question after a normal answer", async () => {
    await startInterview("prog-2", { name: "Bob", role: "ML Engineer" });

    const initialProgress = getSessionProgress("prog-2");
    const firstQuestion = initialProgress.currentPosition?.question;
    assert.ok(firstQuestion);

    const answer =
      "A large language model uses a transformer architecture for next-token prediction based on trained weights and token probabilities.";
    const contRes = await continueInterview("prog-2", answer);

    const progress = getSessionProgress("prog-2");

    assert.equal(progress.status, "active");
    assert.equal(progress.questionsAsked, 2);
    assert.equal(progress.answersRecorded, 1);
    assert.equal(progress.followUpCount, 0);
    assert.equal(progress.feedback, null);

    // Verify currentPosition changed to the next question
    assert.ok(progress.currentPosition);
    assert.notEqual(progress.currentPosition.question, firstQuestion);
    assert.equal(progress.currentPosition.topic, "Context & limits");
    assert.match(progress.currentPosition.question, /What is context length/);
    assert.match(contRes.reply, new RegExp(escapeRegex(progress.currentPosition.question)));
  });

  it("updates currentPosition to represent the follow-up question after a superficial answer", async () => {
    await startInterview("prog-3", { name: "Charlie" });

    // Brief answer triggers a follow-up probe
    const contRes = await continueInterview("prog-3", "yes");

    const progress = getSessionProgress("prog-3");

    assert.equal(progress.answersRecorded, 1);
    assert.equal(progress.followUpCount, 1);
    assert.equal(progress.questionsAsked, 2);

    // Verify currentPosition represents the follow-up question
    assert.ok(progress.currentPosition);
    assert.equal(progress.currentPosition.topic, "LLM internals");
    assert.match(progress.currentPosition.question, /\[Follow-up\]|elaborate|expand/i);
    assert.match(contRes.reply, new RegExp(escapeRegex(progress.currentPosition.question)));
  });

  it("sets currentPosition to null when the interview completes", async () => {
    await startInterview("prog-comp", { name: "Eve" });

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

    for (const ans of answers) {
      await continueInterview("prog-comp", ans);
    }

    const progress = getSessionProgress("prog-comp");

    assert.equal(progress.completed, true);
    assert.equal(progress.status, "completed");
    // Explicitly verify currentPosition is null after completion
    assert.equal(progress.currentPosition, null);
    assert.ok(progress.feedback);
    assert.equal(progress.daysCovered, 4);

    const summary = getSessionSummary("prog-comp");
    assert.equal(summary.completed, true);
    assert.equal(summary.daysCovered, 4);
    assert.ok(summary.overallScore > 0);
    assert.ok(summary.feedback);
  });

  it("throws session_not_found for unknown session ID", () => {
    assert.throws(
      () => getSessionProgress("unknown-id"),
      (err: unknown) => err instanceof InterviewError && err.code === "session_not_found",
    );
  });

  it("prevents summary generation for active interviews with interview_not_completed", async () => {
    await startInterview("prog-4", { name: "Dana" });

    assert.throws(
      () => getSessionSummary("prog-4"),
      (err: unknown) => err instanceof InterviewError && err.code === "interview_not_completed",
    );
  });
});

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
