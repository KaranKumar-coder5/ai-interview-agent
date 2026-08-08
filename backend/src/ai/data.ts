import { readFileSync } from "node:fs";
import type { Candidate, Curriculum } from "./types.js";

const dataDir = new URL("../../data/", import.meta.url);

let curriculumCache: Curriculum | null = null;
let profilesCache: { profiles: Candidate[] } | null = null;

function readJson<T>(path: URL): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadCurriculum(): Curriculum {
  if (!curriculumCache) {
    curriculumCache = readJson<Curriculum>(new URL("curriculum.json", dataDir));
  }
  return curriculumCache;
}

/** Sample candidate profiles, reserved for profile-based personalization later. */
export function loadCandidateProfiles(): Candidate[] {
  if (!profilesCache) {
    profilesCache = readJson<{ profiles: Candidate[] }>(
      new URL("candidate-profiles.json", dataDir),
    );
  }
  return profilesCache.profiles;
}
