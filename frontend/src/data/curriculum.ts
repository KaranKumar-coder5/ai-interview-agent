export interface CurriculumDayItem {
  day: number;
  title: string;
  isAuthoritative: boolean;
  topics: string[];
}

export interface CurriculumModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  days: CurriculumDayItem[];
}

/** Authoritative 4-day interview curriculum loaded from backend/data/curriculum.json */
export const AUTHORITATIVE_CURRICULUM_DAYS: CurriculumDayItem[] = [
  {
    day: 1,
    title: "LLM Foundations & Prompting",
    isAuthoritative: true,
    topics: ["LLM internals", "Context & limits"],
  },
  {
    day: 2,
    title: "Retrieval-Augmented Generation",
    isAuthoritative: true,
    topics: ["RAG overview", "Retrieval quality"],
  },
  {
    day: 3,
    title: "Building AI Agents",
    isAuthoritative: true,
    topics: ["Agent vs chat", "Agent loops"],
  },
  {
    day: 4,
    title: "Evaluation, Observability & Deployment",
    isAuthoritative: true,
    topics: ["Evaluation metrics", "Production monitoring"],
  },
];

export const COHORT_CURRICULUM: CurriculumModule[] = [
  {
    id: "m1",
    moduleNumber: 1,
    title: "Interview Curriculum Core (Days 1–4)",
    description: "Authoritative 4-day interview evaluation curriculum provided in backend/data/curriculum.json.",
    days: AUTHORITATIVE_CURRICULUM_DAYS,
  },
];
