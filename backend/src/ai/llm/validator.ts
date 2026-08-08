import type { AnswerAnalysis, Feedback, TopicFeedback } from "../types.js";

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

  const score = typeof obj.score === "number" ? Math.max(0, Math.min(10, Math.round(obj.score))) : null;
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
  const overallScore = typeof obj.overallScore === "number" ? Math.max(0, Math.min(100, Math.round(obj.overallScore))) : null;

  const strengths = Array.isArray(obj.strengths)
    ? obj.strengths.filter((s): s is string => typeof s === "string" && s.trim() !== "")
    : [];

  const areasForImprovement = Array.isArray(obj.areasForImprovement)
    ? obj.areasForImprovement.filter((a): a is string => typeof a === "string" && a.trim() !== "")
    : [];

  if (!summary || overallScore === null || strengths.length === 0 || areasForImprovement.length === 0) {
    return null;
  }

  const topicBreakdown: TopicFeedback[] = [];
  if (Array.isArray(obj.topicBreakdown)) {
    for (const item of obj.topicBreakdown) {
      if (typeof item === "object" && item !== null) {
        const tObj = item as Record<string, unknown>;
        const day = typeof tObj.day === "number" ? tObj.day : 1;
        const title = typeof tObj.title === "string" ? tObj.title : `Day ${day}`;
        const score = typeof tObj.score === "number" ? Math.max(0, Math.min(100, Math.round(tObj.score))) : 75;
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
