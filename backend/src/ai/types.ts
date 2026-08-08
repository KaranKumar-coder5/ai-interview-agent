/** Authoritative Cohort Curriculum types (from backend/data/curriculum.json) */
export interface CohortModule {
  n: number;
  title: string;
  days: [number, number];
}

export interface CohortDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CohortCurriculum {
  cohort: string;
  modules: CohortModule[];
  days: CohortDay[];
}

/** Authoritative Candidate dataset types (from backend/data/candidates.json) */
export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateRecord {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CandidatesData {
  candidates: CandidateRecord[];
}

/** Legacy / Interview Candidate interface (for active session & evaluation engine) */
export interface Candidate {
  id?: string;
  name: string;
  role?: string;
  cohortDay?: number;
  notes?: string;
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
  difficulty?: "basic" | "intermediate" | "advanced";
  tags?: string[];
}

export type AdaptiveStrategy =
  | "probe_weakness"
  | "deepen_strength"
  | "progression"
  | "topic_balance";

export interface GeneratedQuestion {
  question: string;
  topic: string;
  difficulty: "basic" | "intermediate" | "advanced";
  focus: string;
  reason: string;
}

export interface QuestionGenerationContext {
  day: number;
  dayTitle: string;
  topic: string;
  targetDifficulty: "basic" | "intermediate" | "advanced";
  strategy: AdaptiveStrategy;
  previousQuestion?: string;
  candidateAnswer?: string;
  lastAnalysis?: AnswerAnalysis;
  askedQuestionTexts: string[];
  candidateName: string;
  candidateRole?: string;
  candidateRecord?: CandidateRecord | null;
}

export interface AdaptiveDecision {
  questionId: string;
  strategy: AdaptiveStrategy;
  reason: string;
  selectedQuestion: Question;
  selectedAt?: number;
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
  adaptiveStrategy?: AdaptiveStrategy;
  adaptiveReason?: string;
}

export interface Session {
  sessionId: string;
  candidateId?: string;
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
  adaptiveDecisions?: AdaptiveDecision[];
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

export interface CurrentPosition {
  day: number;
  dayTitle: string;
  topic: string;
  question: string;
  questionIndex: number;
}

export interface SessionProgress {
  sessionId: string;
  candidateId?: string;
  candidate: Candidate;
  status: "active" | "completed";
  questionsAsked: number;
  answersRecorded: number;
  followUpCount: number;
  daysCovered: number;
  topicsCovered: number;
  currentPosition: CurrentPosition | null;
  completed: boolean;
  feedback: Feedback | null;
  turns?: InterviewTurn[];
}

export interface SessionSummary {
  sessionId: string;
  candidateId?: string;
  candidate: Candidate;
  completed: boolean;
  totalQuestions: number;
  totalAnswers: number;
  followUpsAsked: number;
  daysCovered: number;
  overallScore: number;
  feedback: Feedback;
}
