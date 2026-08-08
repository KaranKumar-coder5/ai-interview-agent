import type {
  AdaptiveStrategy,
  AnswerAnalysis,
  Feedback,
  Question,
  TopicFeedback,
} from "../types.js";

export function parseJsonContent(rawText: string): unknown {
  try {
    // Clean potential markdown codeblock wrappers like ```json ... ```
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export function validateAnswerAnalysis(data: unknown): AnswerAnalysis | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;

  const score =
    typeof obj.score === "number" ? Math.max(0, Math.min(10, Math.round(obj.score))) : null;
  const depth =
    obj.depth === "superficial" || obj.depth === "adequate" || obj.depth === "deep"
      ? obj.depth
      : null;

  const keywordsFound = Array.isArray(obj.keywordsFound)
    ? obj.keywordsFound.filter((k): k is string => typeof k === "string")
    : [];

  const gapsIdentified = Array.isArray(obj.gapsIdentified)
    ? obj.gapsIdentified.filter((g): g is string => typeof g === "string")
    : [];

  const feedbackSnippet =
    typeof obj.feedbackSnippet === "string" && obj.feedbackSnippet.trim() !== ""
      ? obj.feedbackSnippet.trim()
      : null;

  if (score === null || depth === null || feedbackSnippet === null) {
    return null;
  }

  return {
    score,
    depth,
    keywordsFound,
    gapsIdentified,
    feedbackSnippet,
  };
}

export function validateFollowUp(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.followUpQuestion === "string" && obj.followUpQuestion.trim() !== "") {
    return obj.followUpQuestion.trim();
  }
  return null;
}

export function validateFeedback(data: unknown, candidateName: string): Feedback | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;

  const summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
  const overallScore =
    typeof obj.overallScore === "number"
      ? Math.max(0, Math.min(100, Math.round(obj.overallScore)))
      : null;

  const strengths = Array.isArray(obj.strengths)
    ? obj.strengths.filter((s): s is string => typeof s === "string" && s.trim() !== "")
    : [];

  const areasForImprovement = Array.isArray(obj.areasForImprovement)
    ? obj.areasForImprovement.filter((a): a is string => typeof a === "string" && a.trim() !== "")
    : [];

  if (
    !summary ||
    overallScore === null ||
    strengths.length === 0 ||
    areasForImprovement.length === 0
  ) {
    return null;
  }

  const topicBreakdown: TopicFeedback[] = [];
  if (Array.isArray(obj.topicBreakdown)) {
    for (const item of obj.topicBreakdown) {
      if (typeof item === "object" && item !== null) {
        const tObj = item as Record<string, unknown>;
        const day = typeof tObj.day === "number" ? tObj.day : 1;
        const title = typeof tObj.title === "string" ? tObj.title : `Day ${day}`;
        const score =
          typeof tObj.score === "number"
            ? Math.max(0, Math.min(100, Math.round(tObj.score)))
            : 75;
        const status =
          tObj.status === "strong" || tObj.status === "developing" || tObj.status === "needs_work"
            ? tObj.status
            : score >= 80
            ? "strong"
            : score < 60
            ? "needs_work"
            : "developing";

        topicBreakdown.push({ day, title, score, status });
      }
    }
  }

  return {
    candidateName,
    answered: topicBreakdown.length > 0 ? topicBreakdown.length : 8,
    total: topicBreakdown.length > 0 ? topicBreakdown.length : 8,
    summary,
    overallScore,
    strengths,
    areasForImprovement,
    topicBreakdown,
  };
}

export function validateAdaptiveSelection(
  data: unknown,
  availableQuestions: Question[],
  askedQuestionIds: string[],
): { questionId: string; strategy: AdaptiveStrategy; reason: string } | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;

  const questionId = typeof obj.questionId === "string" ? obj.questionId.trim() : "";
  const rawStrategy = typeof obj.strategy === "string" ? obj.strategy.trim().toLowerCase() : "";
  const reason = typeof obj.reason === "string" ? obj.reason.trim() : "Adaptive selection";

  const validStrategies: AdaptiveStrategy[] = [
    "probe_weakness",
    "deepen_strength",
    "progression",
    "topic_balance",
  ];

  if (!questionId || !validStrategies.includes(rawStrategy as AdaptiveStrategy)) {
    return null;
  }

  // MUST exist in available controlled question bank
  const match = availableQuestions.find((q) => q.id === questionId);
  if (!match) {
    return null;
  }

  // MUST NOT have been asked already
  if (askedQuestionIds.includes(questionId)) {
    return null;
  }

  return {
    questionId: match.id,
    strategy: rawStrategy as AdaptiveStrategy,
    reason: reason || `Selected ${match.id} via ${rawStrategy}`,
  };
}

export function isDuplicateQuestionText(
  newQuestion: string,
  askedQuestionTexts: string[],
  threshold = 0.5,
): boolean {
  if (!askedQuestionTexts || askedQuestionTexts.length === 0) return false;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const newWords = new Set(normalize(newQuestion));
  if (newWords.size === 0) return false;

  for (const asked of askedQuestionTexts) {
    const askedWords = new Set(normalize(asked));
    if (askedWords.size === 0) continue;

    const intersection = new Set([...newWords].filter((x) => askedWords.has(x)));
    const union = new Set([...newWords, ...askedWords]);
    const jaccard = intersection.size / union.size;

    if (jaccard >= threshold) return true;
  }

  return false;
}

export function validateGeneratedQuestion(
  data: unknown,
  askedQuestionTexts: string[] = [],
): import("../types.js").GeneratedQuestion | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;

  const question = typeof obj.question === "string" ? obj.question.trim() : "";
  const topic = typeof obj.topic === "string" ? obj.topic.trim() : "AI Engineering";
  const rawDiff = typeof obj.difficulty === "string" ? obj.difficulty.trim().toLowerCase() : "intermediate";
  const focus = typeof obj.focus === "string" ? obj.focus.trim() : "Technical evaluation";
  const reason = typeof obj.reason === "string" ? obj.reason.trim() : "Dynamically generated question";

  // 1. Non-empty string
  if (!question) return null;

  // 2. Reasonably sized (15 to 500 chars)
  if (question.length < 15 || question.length > 500) return null;

  // 3. Question format check
  const hasQuestionMark = question.includes("?");
  const hasQuestionKeyword = /\b(what|how|explain|describe|compare|why|can|could|would|discuss|detail)\b/i.test(question);
  if (!hasQuestionMark && !hasQuestionKeyword) return null;

  // 4. Valid difficulty
  const validDifficulties: ("basic" | "intermediate" | "advanced")[] = ["basic", "intermediate", "advanced"];
  const difficulty = validDifficulties.includes(rawDiff as any)
    ? (rawDiff as "basic" | "intermediate" | "advanced")
    : "intermediate";

  // 5. Must NOT contain internal leak terms
  const internalLeakTerms = ["score:", "gapsidentified", "evaluation:", "feedbacksnippet", "system_persona", "json_object"];
  const lowerQ = question.toLowerCase();
  if (internalLeakTerms.some((term) => lowerQ.includes(term))) return null;

  // 6. Semantic duplicate prevention
  if (isDuplicateQuestionText(question, askedQuestionTexts)) return null;

  return {
    question,
    topic,
    difficulty,
    focus,
    reason,
  };
}
