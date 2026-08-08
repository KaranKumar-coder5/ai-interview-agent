import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { app } from "../src/app.js";

describe("HTTP API Smoke Test", () => {
  let server: Server;
  let baseUrl: string;

  before((_, done) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  it("GET /health returns 200 ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as { status: string; service: string };
    assert.equal(data.status, "ok");
    assert.equal(data.service, "ai-interview-agent");
  });

  it("GET /api/candidates/:candidateId returns 200 for valid candidate ID", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/priya-dev`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.id, "priya-dev");
    assert.equal(data.name, "Priya Sharma");
    assert.equal(data.role, "AI Engineer");
    assert.equal(data.cohortDay, 12);
  });

  it("GET /api/candidates/:candidateId returns 404 for unknown candidate ID", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/unknown-cand-id`);
    assert.equal(res.status, 404);
    const data = (await res.json()) as any;
    assert.equal(data.error, "candidate_not_found");
  });

  it("POST /api/interview starts a session with candidateId string", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "cid-session-1",
        candidateId: "priya-dev",
      }),
    });

    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.sessionId, "cid-session-1");
    assert.equal(data.done, false);
    assert.match(data.reply, /Hi Priya Sharma/);
  });

  it("POST /api/interview returns 404 when starting with unknown candidateId", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "invalid-cid-session",
        candidateId: "non-existent-candidate",
      }),
    });

    assert.equal(res.status, 404);
    const data = (await res.json()) as any;
    assert.equal(data.error, "candidate_not_found");
  });

  it("POST /api/interview starts a session with candidate object (backward compatibility)", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "smoke-session-1",
        candidate: { name: "SmokeTester", role: "AI Dev" },
      }),
    });

    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.sessionId, "smoke-session-1");
    assert.equal(data.done, false);
    assert.equal(data.feedback, null);
    assert.match(data.reply, /Hi SmokeTester/);
  });

  it("GET /api/interview/:sessionId/progress returns 200 for active session", async () => {
    const res = await fetch(`${baseUrl}/api/interview/smoke-session-1/progress`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;

    assert.equal(data.sessionId, "smoke-session-1");
    assert.equal(data.candidate.name, "SmokeTester");
    assert.equal(data.status, "active");
    assert.equal(data.completed, false);
    assert.equal(data.questionsAsked, 1);
    assert.equal(data.answersRecorded, 0);
    assert.equal(data.feedback, null);
  });

  it("GET /api/interview/:sessionId/summary returns 400 for active session", async () => {
    const res = await fetch(`${baseUrl}/api/interview/smoke-session-1/summary`);
    assert.equal(res.status, 400);
    const data = (await res.json()) as any;
    assert.equal(data.error, "interview_not_completed");
  });

  it("POST /api/interview continues an existing session", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "smoke-session-1",
        message: "Transformers process input tokens using self-attention mechanisms.",
      }),
    });

    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.sessionId, "smoke-session-1");
    assert.equal(data.done, false);
  });

  it("POST /api/interview returns 400 for invalid request payload", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const data = (await res.json()) as any;
    assert.equal(data.error, "invalid_request");
  });

  it("POST /api/interview returns 404 for unknown sessionId", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "non-existent-session-999",
        message: "hello",
      }),
    });

    assert.equal(res.status, 404);
    const data = (await res.json()) as any;
    assert.equal(data.error, "session_not_found");
  });

  it("GET /api/interview/:sessionId/progress returns 404 for unknown sessionId", async () => {
    const res = await fetch(`${baseUrl}/api/interview/non-existent-session-999/progress`);
    assert.equal(res.status, 404);
    const data = (await res.json()) as any;
    assert.equal(data.error, "session_not_found");
  });

  it("GET /api/interview/:sessionId/summary returns 404 for unknown sessionId", async () => {
    const res = await fetch(`${baseUrl}/api/interview/non-existent-session-999/summary`);
    assert.equal(res.status, 404);
    const data = (await res.json()) as any;
    assert.equal(data.error, "session_not_found");
  });
});
