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

export interface AnswerAnalysis {
  score: number; // 0 to 10 scale
  depth: "superficial" | "adequate" | "deep";
  keywordsFound: string[];
  gapsIdentified: string[];
  feedbackSnippet: string;
}

export interface InterviewTurn {
  questionId: string;
  questionText: string;
  day: number;
  dayTitle: string;
  topic: string;
  isFollowUp: boolean;
  candidateAnswer?: string;
  analysis?: AnswerAnalysis;
}

export interface Session {
  sessionId: string;
  candidate: Candidate;
  turns: InterviewTurn[];
  /** Question ids asked so far, in order. */
  askedQuestions: string[];
  /** Candidate answers received so far, in order. */
  answers: string[];
  currentDayIndex: number;
  currentQuestionInDayIndex: number;
  followUpsOnCurrentQuestion: number;
  /** Index of the question that will be asked next (legacy compatibility). */
  nextQuestionIndex: number;
  topicScores: Record<string, number[]>;
  startedAt: number;
  done: boolean;
}

export interface TopicFeedback {
  day: number;
  title: string;
  score: number; // 0-100 percentage
  status: "strong" | "developing" | "needs_work";
}

export interface Feedback {
  candidateName: string;
  answered: number;
  total: number;
  summary: string;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  topicBreakdown: TopicFeedback[];
}

export interface InterviewResponse {
  sessionId: string;
  reply: string;
  done: boolean;
  feedback: Feedback | null;
}

