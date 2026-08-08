import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSession } from "../src/ai/context.js";
import { buildAnswerAnalysisPrompt } from "../src/ai/llm/prompts.js";
import { GroqProvider } from "../src/ai/llm/groq.js";
import { DeterministicInterviewProvider } from "../src/ai/llm/provider.js";
import type { Question, Session } from "../src/ai/types.js";

describe("Evaluation Pipeline Bug Diagnosis & Regression Test", () => {
  const targetQuestion: Question = {
    id: "d2q3",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "Hybrid search & reranking",
    question:
      "Can you explain how dense vector similarity scoring differs from BM25 term matching, and how a hybrid search that combines both can improve recall and precision?",
    difficulty: "advanced",
  };

  const candidateAnswer = `Dense vector search and BM25 solve relevance in different ways.

Dense vector search converts the query and documents into embeddings and compares their vectors using a similarity metric such as cosine similarity or dot product. Because embeddings capture semantic meaning, dense retrieval can find relevant documents even when the query uses different words or synonyms from the document.

BM25 is a sparse keyword-based retrieval method. It scores documents based mainly on term matching, considering factors such as term frequency, inverse document frequency, and document length. BM25 is particularly useful when exact terms matter, such as product names, IDs, error codes, or technical keywords.

The weakness of dense retrieval is that it can sometimes miss exact keyword matches, while BM25 can miss semantically related content that uses different terminology. Therefore, I would use hybrid retrieval, combining the results from both dense and sparse search.

For example, I could retrieve the top 20 candidates from vector search and the top 20 from BM25, merge or fuse their rankings, and then optionally use a cross-encoder reranker to score the query-document pairs more precisely and select the best final chunks.

The overall flow would be:

Query → Dense embedding search + BM25 search → rank fusion → cross-encoder reranking → top-k relevant chunks → LLM

This improves recall because either semantic similarity or exact keyword matching can retrieve a relevant document, while reranking improves precision by putting the most relevant results at the top. The goal is to balance both rather than relying entirely on either dense or sparse retrieval.`;

  const sampleCandidate = {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "AI Engineer",
  };

  it("1. Verifies buildAnswerAnalysisPrompt formats the exact question and candidate answer correctly", () => {
    const session = createSession("session-bug-test-1", sampleCandidate, "CAND-001");
    session.turns.push({
      questionId: targetQuestion.id,
      questionText: targetQuestion.question,
      day: targetQuestion.day,
      dayTitle: targetQuestion.dayTitle,
      topic: targetQuestion.topic,
      isFollowUp: false,
    });

    const prompt = buildAnswerAnalysisPrompt(targetQuestion, candidateAnswer, session);

    assert.ok(prompt.includes(targetQuestion.question));
    assert.ok(prompt.includes("Dense vector search and BM25 solve relevance in different ways."));
    assert.ok(prompt.includes("Query → Dense embedding search + BM25 search"));
    assert.ok(prompt.includes("Hybrid search & reranking"));
  });

  it("2. Verifies DeterministicInterviewProvider evaluates the answer with a deep score (>= 8)", () => {
    const session = createSession("session-bug-test-2", sampleCandidate, "CAND-001");
    const provider = new DeterministicInterviewProvider();

    const analysis = provider.analyzeAnswer(targetQuestion, candidateAnswer, session);

    assert.equal(analysis.depth, "deep");
    assert.ok(analysis.score >= 8, `Expected score >= 8, got ${analysis.score}`);
    assert.notEqual(analysis.score, 0);
  });

  it("3. Verifies GroqProvider evaluates the answer with a high score using mock LLM response without live API calls", async () => {
    const origFetch = globalThis.fetch;
    let fetchCalled = false;
    let sentPayload: any = null;

    try {
      globalThis.fetch = async (_url: any, options: any) => {
        fetchCalled = true;
        sentPayload = JSON.parse(options.body);
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    score: 10,
                    depth: "deep",
                    keywordsFound: ["dense vector", "BM25", "hybrid search", "cross-encoder", "reranking"],
                    gapsIdentified: [],
                    feedbackSnippet: "Exceptional explanation of dense vs BM25 retrieval, hybrid rank fusion, and cross-encoder reranking.",
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      };

      const session = createSession("session-bug-test-3", sampleCandidate, "CAND-001");
      const groq = new GroqProvider("gsk-test-key-mock");

      const analysis = await groq.analyzeAnswer(targetQuestion, candidateAnswer, session);

      assert.equal(fetchCalled, true);
      assert.ok(sentPayload);
      assert.equal(sentPayload.messages[0].role, "user");
      assert.ok(sentPayload.messages[0].content.includes("Hybrid search & reranking"));
      assert.ok(sentPayload.messages[0].content.includes("BM25"));

      assert.equal(analysis.score, 10);
      assert.equal(analysis.depth, "deep");
      assert.ok(analysis.feedbackSnippet.includes("dense vs BM25"));
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});
