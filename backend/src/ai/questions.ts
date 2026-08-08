import type { Question } from "./types.js";

/**
 * Technical interview evaluation questions mapped across core curriculum domains.
 * Guarantees 8+ questions across 4 curriculum days for the interview engine.
 */
const INTERVIEW_QUESTIONS: Question[] = [
  {
    id: "d1q1",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "LLM internals",
    question: "Explain what a large language model is, including the self-attention mechanism in Transformers.",
  },
  {
    id: "d1q2",
    day: 1,
    dayTitle: "LLM Foundations & Prompting",
    topic: "Context & limits",
    question: "What is context length and what strategies do you use when a prompt exceeds context limits?",
  },
  {
    id: "d2q1",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "RAG overview",
    question: "Describe your architecture for an end-to-end RAG system from document ingestion to response generation.",
  },
  {
    id: "d2q2",
    day: 2,
    dayTitle: "Retrieval-Augmented Generation",
    topic: "Retrieval quality",
    question: "How do you evaluate and improve retrieval precision and recall in a vector database setup?",
  },
  {
    id: "d3q1",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent vs chat",
    question: "What is the key difference between a stateless chat assistant and an autonomous AI agent?",
  },
  {
    id: "d3q2",
    day: 3,
    dayTitle: "Building AI Agents",
    topic: "Agent loops",
    question: "How do you implement tool calling and prevent infinite loops in agent reasoning chains?",
  },
  {
    id: "d4q1",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "Evaluation metrics",
    question: "How do you measure hallucinations and answer relevance in production LLM applications?",
  },
  {
    id: "d4q2",
    day: 4,
    dayTitle: "Evaluation, Observability & Deployment",
    topic: "Production monitoring",
    question: "What metrics and logging do you track when serving an LLM model behind a production API?",
  },
];

export function getQuestions(): Question[] {
  return INTERVIEW_QUESTIONS;
}

export function getQuestionAt(index: number): Question | undefined {
  return INTERVIEW_QUESTIONS[index];
}

export function totalQuestions(): number {
  return INTERVIEW_QUESTIONS.length;
}
