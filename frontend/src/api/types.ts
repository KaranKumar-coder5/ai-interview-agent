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

export type CandidateProfile = CandidateRecord;

export interface CandidatePayload {
  name: string;
  role?: string;
}

export interface StartSessionPayload {
  sessionId: string;
  candidateId?: string;
  candidate?: CandidatePayload;
}

export interface ContinueSessionPayload {
  sessionId: string;
  message: string;
}

export interface AnswerAnalysis {
  score: number;
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

export interface TopicFeedback {
  day: number;
  title: string;
  score: number;
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
  candidate: {
    name: string;
    role?: string;
  };
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
  candidate: {
    name: string;
    role?: string;
  };
  completed: boolean;
  totalQuestions: number;
  totalAnswers: number;
  followUpsAsked: number;
  daysCovered: number;
  overallScore: number;
  feedback: Feedback;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiError {
  error: string;
  message: string;
}
