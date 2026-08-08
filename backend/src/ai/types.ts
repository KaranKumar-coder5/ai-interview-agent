export interface Candidate {
  id?: string;
  name: string;
  role?: string;
}

export interface CurriculumQuestion {
  id: string;
  topic: string;
  question: string;
}

export interface CurriculumDay {
  day: number;
  title: string;
  questions: CurriculumQuestion[];
}

export interface Curriculum {
  name: string;
  days: CurriculumDay[];
}

/** A question flattened with its day context, ready to ask. */
export interface Question extends CurriculumQuestion {
  day: number;
  dayTitle: string;
}

export interface Session {
  sessionId: string;
  candidate: Candidate;
  /** Question ids asked so far, in order. */
  askedQuestions: string[];
  /** Candidate answers received so far, in order. */
  answers: string[];
  /** Index of the question that will be asked next. */
  nextQuestionIndex: number;
  startedAt: number;
  done: boolean;
}

export interface Feedback {
  candidateName: string;
  answered: number;
  total: number;
  summary: string;
}

export interface InterviewResponse {
  sessionId: string;
  reply: string;
  done: boolean;
  feedback: Feedback | null;
}
