import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { app } from "../src/app.js";

describe("HTTP API Smoke Test & Candidate ID API Tests", () => {
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

  it("GET /api/candidates/CAND-001 returns 200 with authoritative candidate record", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/CAND-001`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;

    assert.ok(data.member);
    assert.equal(data.member.id, "CAND-001");
    assert.equal(data.member.name, "Sarah Johnson");
    assert.equal(data.member.jobRole, "Senior Data Engineer");
    assert.equal(data.member.yearsExperience, 9);
    assert.equal(data.member.education, "MS Computer Science");
    assert.equal(data.member.status, "COMPLETED");

    assert.ok(Array.isArray(data.missions));
    assert.ok(data.missions.length > 0);
    assert.ok(data.signals);
    assert.equal(data.signals.commitDays, 28);
  });

  it("GET /api/candidates/CAND-020 returns 200 with upper-range candidate record", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/CAND-020`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;

    assert.ok(data.member);
    assert.equal(data.member.id, "CAND-020");
    assert.equal(data.member.name, "Priyanka Sharma");
    assert.equal(data.member.jobRole, "Software Engineer");
    assert.ok(Array.isArray(data.missions));
    assert.ok(data.signals);
  });

  it("GET /api/candidates/CAND-999 returns 404 candidate_not_found", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/CAND-999`);
    assert.equal(res.status, 404);
    const data = (await res.json()) as any;

    assert.equal(data.error, "candidate_not_found");
    assert.equal(data.message, 'No candidate found for candidateId "CAND-999".');
  });

  it("Enforces candidate isolation (CAND-001 does not return CAND-002 data)", async () => {
    const res1 = await fetch(`${baseUrl}/api/candidates/CAND-001`);
    const data1 = (await res1.json()) as any;

    const res2 = await fetch(`${baseUrl}/api/candidates/CAND-002`);
    const data2 = (await res2.json()) as any;

    assert.notEqual(data1.member.id, data2.member.id);
    assert.notEqual(data1.member.name, data2.member.name);
    assert.equal(data1.member.id, "CAND-001");
    assert.equal(data2.member.id, "CAND-002");
  });

  it("Handles whitespace and case insensitivity (cand-001 with spaces)", async () => {
    const res = await fetch(`${baseUrl}/api/candidates/cand-001%20`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.member.id, "CAND-001");
  });

  it("POST /api/interview starts a session with candidateId string (CAND-001)", async () => {
    const res = await fetch(`${baseUrl}/api/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "cid-session-1",
        candidateId: "CAND-001",
      }),
    });

    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.sessionId, "cid-session-1");
    assert.equal(data.done, false);
    assert.match(data.reply, /Hi Sarah Johnson/);
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
