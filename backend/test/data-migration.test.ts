import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCandidateById, loadCandidates, loadCurriculum } from "../src/ai/data.js";

describe("Milestone 5A — Authoritative Data Migration Verification", () => {
  it("1. Curriculum loads successfully from backend/data/curriculum.json", () => {
    const curriculum = loadCurriculum();
    assert.ok(curriculum);
    assert.ok(typeof curriculum.cohort === "string");
    assert.ok(Array.isArray(curriculum.modules));
    assert.ok(Array.isArray(curriculum.days));
  });

  it("2. Curriculum contains exactly 31 days", () => {
    const curriculum = loadCurriculum();
    assert.equal(curriculum.days.length, 31);
  });

  it("3. Day numbers cover sequentially 1 through 31", () => {
    const curriculum = loadCurriculum();
    const dayNumbers = curriculum.days.map((d) => d.day);
    for (let day = 1; day <= 31; day++) {
      assert.ok(
        dayNumbers.includes(day),
        `Expected curriculum to contain day ${day}`,
      );
    }
  });

  it("4. Candidate dataset loads successfully from backend/data/candidates.json", () => {
    const candidates = loadCandidates();
    assert.ok(candidates);
    assert.ok(Array.isArray(candidates));
  });

  it("5. Candidate dataset contains all authoritative candidates (20 total)", () => {
    const candidates = loadCandidates();
    assert.equal(candidates.length, 20);
  });

  it("6. Candidate IDs are unique across the dataset", () => {
    const candidates = loadCandidates();
    const ids = candidates.map((c) => c.member.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, 20);
  });

  it("7. Candidate lookup returns CAND-001 (Sarah Johnson)", () => {
    const candidate = getCandidateById("CAND-001");
    assert.ok(candidate);
    assert.equal(candidate.member.id, "CAND-001");
    assert.equal(candidate.member.name, "Sarah Johnson");
    assert.equal(candidate.member.jobRole, "Senior Data Engineer");
    assert.equal(candidate.member.yearsExperience, 9);
    assert.equal(candidate.member.education, "MS Computer Science");
  });

  it("8. Candidate lookup returns CAND-010 and CAND-020", () => {
    const candidate10 = getCandidateById("CAND-010");
    assert.ok(candidate10);
    assert.equal(candidate10.member.id, "CAND-010");

    const candidate20 = getCandidateById("CAND-020");
    assert.ok(candidate20);
    assert.equal(candidate20.member.id, "CAND-020");
    assert.equal(candidate20.member.name, "Priyanka Sharma");
  });

  it("9. Unknown candidate ID returns undefined", () => {
    const unknownCandidate = getCandidateById("CAND-999");
    assert.equal(unknownCandidate, undefined);
  });

  it("10. Required authoritative fields (member, missions, signals, tools, objectives) are preserved", () => {
    const curriculum = loadCurriculum();
    const day1 = curriculum.days.find((d) => d.day === 1);
    assert.ok(day1);
    assert.ok(Array.isArray(day1.tools));
    assert.ok(Array.isArray(day1.objectives));
    assert.ok(day1.tools.length > 0);
    assert.ok(day1.objectives.length > 0);

    const candidates = loadCandidates();
    const candidate1 = candidates[0];
    assert.ok(candidate1.member);
    assert.ok(candidate1.member.id);
    assert.ok(candidate1.member.name);
    assert.ok(candidate1.member.jobRole);
    assert.ok(typeof candidate1.member.yearsExperience === "number");
    assert.ok(candidate1.member.education);
    assert.ok(candidate1.member.status);

    assert.ok(Array.isArray(candidate1.missions));
    assert.ok(candidate1.signals);
    assert.ok(typeof candidate1.signals.commitDays === "number");
    assert.ok(typeof candidate1.signals.missionsCompleted === "number");
    assert.ok(typeof candidate1.signals.missionsFirstTry === "number");
  });
});
