import type {
  AdaptiveDecision,
  AnswerAnalysis,
  Feedback,
  GeneratedQuestion,
  Question,
  QuestionGenerationContext,
  Session,
  TopicFeedback,
} from "../types.js";

export interface LLMProvider {
  analyzeAnswer(
    question: Question,
    candidateAnswer: string,
    session: Session,
  ): Promise<AnswerAnalysis> | AnswerAnalysis;

  generateFollowUp(
    question: Question,
    candidateAnswer: string,
    analysis: AnswerAnalysis,
    session: Session,
  ): Promise<string> | string;

  generateFeedback(session: Session): Promise<Feedback> | Feedback;

  selectNextQuestion?(
    availableQuestions: Question[],
    lastAnalysis?: AnswerAnalysis,
    session?: Session,
  ): Promise<AdaptiveDecision | null> | AdaptiveDecision | null;

  generateQuestion?(
    context: QuestionGenerationContext,
  ): Promise<GeneratedQuestion | null> | GeneratedQuestion | null;
}

/**
 * Deterministic interview engine providing heuristic signal evaluation
 * (length analysis, domain keyword matching, and structured feedback rules).
 *
 * NOTE: This is a rule-based deterministic implementation designed for fast,
 * reliable offline testing. It does NOT perform true semantic AI reasoning.
 * It implements the LLMProvider interface so a real LLM provider (e.g. GeminiProvider)
 * can easily replace or extend it in future milestones.
 */
export class DeterministicInterviewProvider implements LLMProvider {
  analyzeAnswer(
    question: Question,
    candidateAnswer: string,
    _session: Session,
  ): AnswerAnalysis {
    const text = candidateAnswer.trim().toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Technical domain keywords per topic for simple heuristic signal processing
    const domainKeywords: Record<string, string[]> = {
      "LLM internals": ["token", "prediction", "transformer", "weight", "probabilit"],
      "Context & limits": ["window", "token", "memory", "cost", "latency", "truncat"],
      "Transformer architecture": ["query", "key", "value", "attention", "head", "matrix", "qkv"],
      "Prompt engineering": ["prompt", "system", "injection", "hallucination", "template", "structure"],
      "RAG overview": ["retrieval", "vector", "embedding", "document", "knowledge", "search"],
      "Retrieval quality": ["precision", "recall", "relevance", "chunk", "rerank", "eval"],
      "Hybrid search & reranking": ["dense", "bm25", "hybrid", "rerank", "sparse", "fusion", "recall"],
      "Chunking & indexing": ["chunk", "overlap", "embedding", "latency", "semantic", "index"],
      "Agent vs chat": ["tool", "action", "function", "autonomous", "loop", "call"],
      "Agent loops": ["retry", "error", "fallback", "state", "step", "reflect"],
      "Agent planning & multi-agent": ["plan", "state", "machine", "multi-agent", "coordination", "step"],
      "Agent memory": ["memory", "buffer", "vector", "scratchpad", "conversation", "state"],
      "Evaluation metrics": ["rouge", "bleu", "faithfulness", "accuracy", "llm-as-a-judge"],
      "Production monitoring": ["latency", "throughput", "cost", "drift", "logging", "alert"],
      "LLM-as-a-Judge": ["judge", "eval", "regression", "pipeline", "benchmark", "rubric"],
      "Serving & latency": ["cache", "rate-limit", "latency", "spike", "load", "batch"],
    };

    const expected = domainKeywords[question.topic] || ["model", "data", "system", "vector", "search", "retrieval"];
    const foundKeywords = expected.filter((kw) => text.includes(kw));

    let depth: "superficial" | "adequate" | "deep" = "adequate";
    let score = 7;

    if (wordCount < 5) {
      depth = "superficial";
      score = Math.max(3, wordCount);
    } else if (foundKeywords.length >= 2 || wordCount >= 15) {
      depth = "deep";
      score = Math.min(10, 8 + foundKeywords.length);
    } else {
      depth = "adequate";
      score = 6 + Math.min(2, foundKeywords.length);
    }

    const missingKeywords = expected.filter((kw) => !foundKeywords.includes(kw));
    const gaps = depth === "superficial" ? missingKeywords.slice(0, 2) : [];

    let snippet = "Heuristic match: candidate response addresses core concepts.";
    if (depth === "superficial") {
      snippet = "Heuristic flag: response length is brief and lacks expected domain terms.";
    } else if (depth === "deep") {
      snippet = "Heuristic match: detailed response with expected technical terminology.";
    }

    return {
      score,
      depth,
      keywordsFound: foundKeywords,
      gapsIdentified: gaps,
      feedbackSnippet: snippet,
    };
  }

  generateFollowUp(
    question: Question,
    _candidateAnswer: string,
    analysis: AnswerAnalysis,
    _session: Session,
  ): string {
    if (analysis.depth === "superficial") {
      if (analysis.gapsIdentified.length > 0) {
        return `That's a start! Could you elaborate specifically on how ${analysis.gapsIdentified[0]} fits into ${question.topic}?`;
      }
      return `Could you expand on your response for ${question.topic} with a concrete technical example?`;
    }

    return `Interesting point. How would you handle trade-offs or edge cases related to ${question.topic} in production?`;
  }

  generateFeedback(session: Session): Feedback {
    const turns = session.turns.filter((t) => t.candidateAnswer);
    const totalAnswered = turns.length;
    const totalAsked = session.turns.length;

    // Calculate scores per curriculum day / topic
    const dayScores: Record<number, { title: string; scores: number[] }> = {};

    for (const turn of session.turns) {
      if (!dayScores[turn.day]) {
        dayScores[turn.day] = { title: turn.dayTitle, scores: [] };
      }
      if (turn.analysis) {
        dayScores[turn.day].scores.push(turn.analysis.score);
      }
    }

    const topicBreakdown: TopicFeedback[] = Object.entries(dayScores).map(
      ([dayStr, data]) => {
        const dayNum = Number.parseInt(dayStr, 10);
        const avgScore =
          data.scores.length > 0
            ? Math.round(
                (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10,
              )
            : 70;

        let status: "strong" | "developing" | "needs_work" = "developing";
        if (avgScore >= 80) status = "strong";
        else if (avgScore < 60) status = "needs_work";

        return {
          day: dayNum,
          title: data.title,
          score: avgScore,
          status,
        };
      },
    );

    const overallAvg =
      topicBreakdown.length > 0
        ? Math.round(
            topicBreakdown.reduce((acc, t) => acc + t.score, 0) /
              topicBreakdown.length,
          )
        : 75;

    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    for (const t of topicBreakdown) {
      if (t.status === "strong") {
        strengths.push(`Strong conceptual grasp of Day ${t.day}: ${t.title}`);
      } else if (t.status === "needs_work") {
        areasForImprovement.push(
          `Focus on deepening practical knowledge in Day ${t.day}: ${t.title}`,
        );
      }
    }

    if (strengths.length === 0) {
      strengths.push("Consistent effort across enterprise AI fundamentals.");
    }
    if (areasForImprovement.length === 0) {
      areasForImprovement.push(
        "Practice articulating complex architectural trade-offs under timed conditions.",
      );
    }

    const summary = `${session.candidate.name} completed the technical interview, answering ${totalAnswered} of ${totalAsked} questions across ${topicBreakdown.length} curriculum modules with an overall score of ${overallAvg}%.`;

    return {
      candidateName: session.candidate.name,
      answered: totalAnswered,
      total: totalAsked,
      summary,
      overallScore: overallAvg,
      strengths,
      areasForImprovement,
      topicBreakdown,
    };
  }
}
