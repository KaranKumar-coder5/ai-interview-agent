import type { CandidateRecord } from "../api/types.js";

export type CandidateData = CandidateRecord;

/** Deprecated: candidates are loaded dynamically via GET /api/candidates/:candidateId */
export const CANDIDATES: CandidateRecord[] = [];
