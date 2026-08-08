import { derivePersonalizationSignals, getPersonalizedQuestions } from "./personalization.js";
import { getQuestions } from "./questions.js";

import type { LLMProvider } from "./llm/provider.js";
import type {
  AdaptiveDecision,
  AnswerAnalysis,
  CandidateRecord,
  Question,
  Session,
} from "./types.js";

export class AdaptiveQuestionSelector {
  constructor(private provider?: LLMProvider | null) {}

  async selectNextQuestion(
    session: Session,
    lastAnalysis?: AnswerAnalysis,
    candidateRecord?: CandidateRecord | null,
  ): Promise<AdaptiveDecision> {
    const askedIds = new Set(session.askedQuestions || []);
    for (const turn of session.turns) {
      if (turn.questionId && !turn.questionId.endsWith("_fu")) {
        askedIds.add(turn.questionId);
      }
    }

    const allQuestions = getQuestions();
    const availableQuestions = allQuestions.filter((q) => !askedIds.has(q.id));

    // If all questions in question bank have been asked, return fallback
    if (availableQuestions.length === 0) {
      const fallbackQ = allQuestions[0];
      return {
        questionId: fallbackQ.id,
        strategy: "progression",
        reason: "All questions in question bank have been completed.",
        selectedQuestion: fallbackQ,
      };
    }

    // Try LLM provider first if available
    if (this.provider && typeof this.provider.selectNextQuestion === "function") {
      try {
        const llmDecision = await this.provider.selectNextQuestion(
          availableQuestions,
          lastAnalysis,
          session,
        );

        if (
          llmDecision &&
          llmDecision.questionId &&
          !askedIds.has(llmDecision.questionId) &&
          allQuestions.some((q) => q.id === llmDecision.questionId)
        ) {
          const matched = allQuestions.find((q) => q.id === llmDecision.questionId)!;
          return {
            questionId: matched.id,
            strategy: llmDecision.strategy || "progression",
            reason: llmDecision.reason || "Selected adaptively by LLM provider.",
            selectedQuestion: matched,
          };
        }
      } catch {
        // Fall back gracefully to deterministic rule-based selector
      }
    }

    // Deterministic Rule-Based Adaptive Selector
    return this.selectDeterministicAdaptiveQuestion(
      session,
      availableQuestions,
      lastAnalysis,
      candidateRecord,
    );
  }

  public selectDeterministicAdaptiveQuestion(
    session: Session,
    availableQuestions: Question[],
    lastAnalysis?: AnswerAnalysis,
    candidateRecord?: CandidateRecord | null,
  ): AdaptiveDecision {
    const lastTurn = session.turns.slice().reverse().find((t) => !t.isFollowUp);
    const lastScore = lastAnalysis?.score ?? lastTurn?.analysis?.score;
    const lastDepth = lastAnalysis?.depth ?? lastTurn?.analysis?.depth;
    const lastDay = lastTurn?.day || 1;

    // Get candidate personalized domain priority (order of 4 days: e.g. [1, 2, 3, 4] or [2, 1, 3, 4])
    const personalizedBase = getPersonalizedQuestions(candidateRecord);
    const orderedDays: number[] = [];
    for (const q of personalizedBase) {
      if (!orderedDays.includes(q.day)) {
        orderedDays.push(q.day);
      }
    }
    for (let d = 1; d <= 4; d++) {
      if (!orderedDays.includes(d)) orderedDays.push(d);
    }

    // Count how many main questions have been asked per day
    const askedQuestionsPerDay: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const turn of session.turns) {
      if (!turn.isFollowUp) {
        askedQuestionsPerDay[turn.day] = (askedQuestionsPerDay[turn.day] || 0) + 1;
      }
    }

    // Determine target day for this question:
    let targetDay = lastDay;
    if (
      (askedQuestionsPerDay[lastDay] || 0) >= 2 ||
      !availableQuestions.some((q) => q.day === lastDay)
    ) {
      const nextDay = orderedDays.find(
        (d) =>
          (askedQuestionsPerDay[d] || 0) < 2 &&
          availableQuestions.some((q) => q.day === d),
      );
      if (nextDay !== undefined) {
        targetDay = nextDay;
      }
    }

    const availableInTargetDay = availableQuestions.filter((q) => q.day === targetDay);

    // PRIORITY 1: Probe weakness if score < 5 or superficial in current domain
    if ((typeof lastScore === "number" && lastScore < 5) || lastDepth === "superficial") {
      const probeQ = availableInTargetDay.find(
        (q) =>
          q.id !== lastTurn?.questionId &&
          (q.id.endsWith("3") ||
            q.id.endsWith("4") ||
            q.difficulty === "advanced" ||
            q.difficulty === "intermediate"),
      );
      if (probeQ) {
        return {
          questionId: probeQ.id,
          strategy: "probe_weakness",
          reason: `Candidate showed superficial understanding (score: ${
            lastScore ?? "N/A"
          }) on Day ${targetDay}. Probing domain weakness.`,
          selectedQuestion: probeQ,
        };
      }
    }

    // PRIORITY 2: Deepen strength if score >= 8 and deep response in current domain
    if (typeof lastScore === "number" && lastScore >= 8 && lastDepth === "deep") {
      const deepenQ = availableInTargetDay.find(
        (q) => q.difficulty === "advanced" || q.id.endsWith("3"),
      );
      if (deepenQ) {
        return {
          questionId: deepenQ.id,
          strategy: "deepen_strength",
          reason: `Candidate demonstrated strong deep mastery (score: ${lastScore}) on Day ${targetDay}. Advancing to higher-difficulty concept.`,
          selectedQuestion: deepenQ,
        };
      }
    }

    // PRIORITY 3: Base curriculum progression for target day
    const nextPersonalizedInDay = availableInTargetDay.find((q) =>
      personalizedBase.some((pq) => pq.id === q.id),
    );
    if (nextPersonalizedInDay) {
      return {
        questionId: nextPersonalizedInDay.id,
        strategy: "progression",
        reason: `Advancing curriculum progression on Day ${nextPersonalizedInDay.day} (${nextPersonalizedInDay.dayTitle}).`,
        selectedQuestion: nextPersonalizedInDay,
      };
    }

    // PRIORITY 4: Fallback to next available question in bank
    const nextQuestion = availableQuestions[0];
    return {
      questionId: nextQuestion.id,
      strategy: "progression",
      reason: "Advancing curriculum to next unasked question in bank.",
      selectedQuestion: nextQuestion,
    };
  }
}
