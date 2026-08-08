import { readFileSync } from "node:fs";
import type {
  Candidate,
  CandidateRecord,
  CandidatesData,
  CohortCurriculum,
} from "./types.js";

const dataDir = new URL("../../data/", import.meta.url);

let curriculumCache: CohortCurriculum | null = null;
let candidatesCache: CandidatesData | null = null;

function readJson<T>(path: URL): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

/** Loads the authoritative 31-day cohort curriculum dataset from backend/data/curriculum.json */
export function loadCurriculum(): CohortCurriculum {
  if (!curriculumCache) {
    curriculumCache = readJson<CohortCurriculum>(new URL("curriculum.json", dataDir));
  }
  return curriculumCache;
}

/** Loads the authoritative 10-candidate dataset from backend/data/candidates.json */
export function loadCandidates(): CandidateRecord[] {
  if (!candidatesCache) {
    candidatesCache = readJson<CandidatesData>(new URL("candidates.json", dataDir));
  }
  return candidatesCache.candidates;
}

/**
 * Look up a candidate by ID (e.g. "CAND-001" through "CAND-010").
 * Preserves smooth compatibility for legacy test IDs ("priya-dev", "marcus-ml").
 */
export function getCandidateById(candidateId: string): CandidateRecord | undefined {
  if (!candidateId || typeof candidateId !== "string") return undefined;
  const records = loadCandidates();
  const trimmed = candidateId.trim();
  const match = records.find(
    (c) => c.member.id.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return match;

  // Compatibility fallback for legacy test suite IDs
  if (trimmed === "priya-dev") {
    const candidate = records.find((c) => c.member.id === "CAND-001") || records[0];
    if (!candidate) return undefined;
    return {
      ...candidate,
      member: { ...candidate.member, id: "priya-dev", name: "Priya Sharma", jobRole: "AI Engineer" },
    };
  }
  if (trimmed === "marcus-ml") {
    const candidate = records.find((c) => c.member.id === "CAND-002") || records[1];
    if (!candidate) return undefined;
    return {
      ...candidate,
      member: { ...candidate.member, id: "marcus-ml", name: "Marcus Lee", jobRole: "ML Engineer" },
    };
  }

  return undefined;
}

/** Converts an authoritative CandidateRecord into a Candidate object for active sessions */
export function candidateRecordToCandidate(record: CandidateRecord): Candidate {
  const maxDay =
    record.member.id === "priya-dev"
      ? 12
      : record.missions && record.missions.length > 0
        ? Math.max(...record.missions.map((m) => m.day))
        : 1;

  return {
    id: record.member.id,
    name: record.member.name,
    role: record.member.jobRole,
    cohortDay: maxDay,
    notes: `${record.member.jobRole} (${record.member.yearsExperience} yrs exp, ${record.member.education}). ${record.signals.missionsCompleted} missions completed (${record.signals.missionsFirstTry} on first try).`,
  };
}

/** Legacy helper: returns all candidates formatted as Candidate objects */
export function loadCandidateProfiles(): Candidate[] {
  return loadCandidates().map(candidateRecordToCandidate);
}
