export interface CandidateData {
  id: string;
  name: string;
  role: string;
  cohortDay: number;
  notes: string;
}

export const CANDIDATES: CandidateData[] = [
  {
    id: "priya-dev",
    name: "Priya Sharma",
    role: "AI Engineer",
    cohortDay: 12,
    notes: "Strong Python, building her first RAG application.",
  },
  {
    id: "marcus-ml",
    name: "Marcus Lee",
    role: "ML Engineer",
    cohortDay: 20,
    notes: "Comfortable with fine-tuning, new to agent tooling.",
  },
];
