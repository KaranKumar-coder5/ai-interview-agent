import type { Question } from "./types.js";

/**
 * Core 8 technical interview evaluation questions mapped across 4 curriculum days.
 */
const BASE_INTERVIEW_QUESTIONS: Question[] = [
  {
    id: "d1q1",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "LLM internals",
    question: "Explain what a large language model is, including the self-attention mechanism in Transformers.",
    difficulty: "basic",
    tags: ["transformer", "self-attention", "llm-internals"],
  },
  {
    id: "d1q2",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "Context & limits",
    question: "What is context length and what strategies do you use when a prompt exceeds context limits?",
    difficulty: "intermediate",
    tags: ["context-window", "prompt-truncation", "summarization"],
  },
  {
    id: "d2q1",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "RAG overview",
    question: "Describe your architecture for an end-to-end RAG system from document ingestion to response generation.",
    difficulty: "basic",
    tags: ["rag-pipeline", "ingestion", "vector-db"],
  },
  {
    id: "d2q2",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "Retrieval quality",
    question: "How do you evaluate and improve retrieval precision and recall in a vector database setup?",
    difficulty: "intermediate",
    tags: ["precision-recall", "vector-search", "embeddings"],
  },
  {
    id: "d3q1",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent vs chat",
    question: "What is the key difference between a stateless chat assistant and an autonomous AI agent?",
    difficulty: "basic",
    tags: ["agent-architecture", "statefulness", "autonomy"],
  },
  {
    id: "d3q2",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent loops",
    question: "How do you implement tool calling and prevent infinite loops in agent reasoning chains?",
    difficulty: "intermediate",
    tags: ["tool-calling", "react-loop", "loop-prevention"],
  },
  {
    id: "d4q1",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "Evaluation metrics",
    question: "How do you measure hallucinations and answer relevance in production LLM applications?",
    difficulty: "basic",
    tags: ["evals", "ragas", "faithfulness"],
  },
  {
    id: "d4q2",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "Production monitoring",
    question: "What metrics and logging do you track when serving an LLM model behind a production API?",
    difficulty: "intermediate",
    tags: ["telemetry", "tracing", "token-usage"],
  },
];

/**
 * Approved probing and deepening questions for adaptive selection.
 */
const PROBING_INTERVIEW_QUESTIONS: Question[] = [
  {
    id: "d1q3",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "Transformer architecture",
    question: "How do Query, Key, and Value matrices interact in multi-head attention to compute token relationships?",
    difficulty: "advanced",
    tags: ["qkv", "multi-head-attention", "matrix-multiplication"],
  },
  {
    id: "d1q4",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "Prompt engineering",
    question: "What techniques do you use to structure prompts and eliminate prompt injection or hallucination risks?",
    difficulty: "intermediate",
    tags: ["prompt-design", "system-prompts", "hallucination-mitigation"],
  },
  {
    id: "d2q3",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "Hybrid search & reranking",
    question: "Compare dense vector search against sparse BM25 retrieval and explain how hybrid search and cross-encoder reranking improve accuracy.",
    difficulty: "advanced",
    tags: ["hybrid-search", "bm25", "reranking"],
  },
  {
    id: "d2q4",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "Chunking & indexing",
    question: "How do chunking strategy, overlap size, and embedding model selection impact RAG query latency and semantic accuracy?",
    difficulty: "intermediate",
    tags: ["chunking", "semantic-overlap", "latency"],
  },
  {
    id: "d3q3",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent planning & multi-agent",
    question: "How do state machines, plan-and-solve loops, and multi-agent coordination improve complex task execution reliability?",
    difficulty: "advanced",
    tags: ["planning", "state-machines", "multi-agent"],
  },
  {
    id: "d3q4",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent memory",
    question: "What memory patterns (short-term message buffers vs vector memory vs scratchpad state) do you use in production agents?",
    difficulty: "intermediate",
    tags: ["agent-memory", "scratchpad", "conversation-state"],
  },
  {
    id: "d4q3",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "LLM-as-a-Judge",
    question: "How do you implement LLM-as-a-judge automated regression testing pipelines before deploying model or prompt updates?",
    difficulty: "advanced",
    tags: ["llm-as-judge", "regression-testing", "prompt-evals"],
  },
  {
    id: "d4q4",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "Serving & latency",
    question: "What load balancing, semantic caching, and rate-limiting strategies do you deploy to handle API latency spikes?",
    difficulty: "intermediate",
    tags: ["caching", "rate-limiting", "latency-optimization"],
  },
];

const ALL_INTERVIEW_QUESTIONS: Question[] = [
  ...BASE_INTERVIEW_QUESTIONS,
  ...PROBING_INTERVIEW_QUESTIONS,
];

export function getQuestions(): Question[] {
  return ALL_INTERVIEW_QUESTIONS;
}

export function getBaseQuestions(): Question[] {
  return BASE_INTERVIEW_QUESTIONS;
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_INTERVIEW_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionAt(index: number): Question | undefined {
  return BASE_INTERVIEW_QUESTIONS[index];
}

export function totalQuestions(): number {
  return BASE_INTERVIEW_QUESTIONS.length;
}
