import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { clearSessions } from "../src/ai/context.js";
import {
  continueInterview,
  InterviewError,
  startInterview,
} from "../src/ai/index.js";
import { totalQuestions } from "../src/ai/questions.js";

describe("interview flow", () => {
  beforeEach(() => {
    clearSessions();
  });

  it("starts a session and asks the first question", () => {
    const res = startInterview("session-1", { name: "Priya", role: "AI Engineer" });

    assert.equal(res.sessionId, "session-1");
    assert.equal(res.done, false);
    assert.equal(res.feedback, null);
    assert.match(res.reply, /Hi Priya!/);
    assert.match(res.reply, /Day 1/);
  });

  it("advances through every question and ends with feedback", () => {
    startInterview("session-1", { name: "Priya" });

    const total = totalQuestions();
    assert.equal(total, 8);

    let res = { done: false } as { done: boolean; feedback: unknown };
    for (let i = 0; i < total; i++) {
      res = continueInterview("session-1", `answer number ${i + 1}`);
    }

    assert.equal(res.done, true);
    assert.notEqual(res.feedback, null);
  });

  it("fails with session_not_found for an unknown session", () => {
    assert.throws(
      () => continueInterview("missing-session", "hello"),
      (err: unknown) =>
        err instanceof InterviewError && err.code === "session_not_found",
    );
  });
});
