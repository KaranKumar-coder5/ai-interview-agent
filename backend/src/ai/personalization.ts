import type { CandidateRecord, Question } from "./types.js";
import { getQuestions } from "./questions.js";

export interface CandidateDomainSignal {
  evaluationDay: number;
  dayTitle: string;
  riskScore: number;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
  reasons: string[];
}

/** Mapping of evaluation days to their corresponding 31-day cohort roadmap day ranges */
const DOMAIN_COHORT_DAY_MAP: Record<number, { title: string; cohortDays: number[] }> = {
  1: { title: "LLM Foundations & Prompting", cohortDays: [11, 12, 13, 14, 15] },
  2: { title: "Retrieval-Augmented Generation", cohortDays: [7, 8, 9, 10] },
  3: { title: "Building AI Agents", cohortDays: [21, 22, 23, 24] },
  4: { title: "Evaluation, Observability & Deployment", cohortDays: [25, 26, 27, 28, 29, 30, 31] },
};

/**
 * Deterministically analyzes an authoritative CandidateRecord to derive domain priority signals.
 * Does NOT use an LLM or hardcode candidate IDs.
 */
export function derivePersonalizationSignals(
  record?: CandidateRecord | null,
): CandidateDomainSignal[] {
  const signals: CandidateDomainSignal[] = [];

  for (let day = 1; day <= 4; day++) {
    const domainInfo = DOMAIN_COHORT_DAY_MAP[day];
    let riskScore = 0;
    const reasons: string[] = [];

    if (record && record.missions && Array.isArray(record.missions)) {
      const domainMissions = record.missions.filter((m) =>
        domainInfo.cohortDays.includes(m.day),
      );

      for (const m of domainMissions) {
        if (m.passed === false) {
          riskScore += 10;
          reasons.push(`Failed mission on Day ${m.day}: "${m.title}"`);
        }
        if (m.skipped === true) {
          riskScore += 8;
          reasons.push(`Skipped mission on Day ${m.day}: "${m.title}"`);
        }
        if (m.attempts && m.attempts > 1) {
          const extra = (m.attempts - 1) * 3;
          riskScore += extra;
          reasons.push(`Required ${m.attempts} attempts on Day ${m.day}: "${m.title}"`);
        }
      }
    }

    let priority: "HIGH" | "MEDIUM" | "NORMAL" = "NORMAL";
    if (riskScore >= 5) {
      priority = "HIGH";
    } else if (riskScore >= 2) {
      priority = "MEDIUM";
    }

    signals.push({
      evaluationDay: day,
      dayTitle: domainInfo.title,
      riskScore,
      priority,
      reasons,
    });
  }

  return signals;
}

/**
 * Returns the 8 interview questions ordered deterministically by candidate priority.
 * Guaranteed to contain 8 questions across all 4 curriculum days.
 */
export function getPersonalizedQuestions(
  record?: CandidateRecord | null,
): Question[] {
  const baseQuestions = getQuestions();
  if (!record) return baseQuestions;

  const domainSignals = derivePersonalizationSignals(record);

  // Sort evaluation days by riskScore descending; tie-breaker: original day order
  const sortedDays = [...domainSignals].sort((a, b) => {
    if (b.riskScore !== a.riskScore) {
      return b.riskScore - a.riskScore;
    }
    return a.evaluationDay - b.evaluationDay;
  });

  const personalizedList: Question[] = [];

  for (const domain of sortedDays) {
    const dayQuestions = baseQuestions.filter((q) => q.day === domain.evaluationDay);
    personalizedList.push(...dayQuestions);
  }

  return personalizedList;
}

/**
 * Returns the question at index from candidate's personalized question sequence.
 */
export function getPersonalizedQuestionAt(
  index: number,
  record?: CandidateRecord | null,
): Question | undefined {
  const list = getPersonalizedQuestions(record);
  return list[index];
}
