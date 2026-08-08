import type { AnswerAnalysis, Question, Session } from "../types.js";

export const SYSTEM_PERSONA_PROMPT = `You are a senior enterprise AI technical interviewer conducting a multi-turn evaluation for a 31-day Enterprise AI Engineering cohort.
Your demeanor is professional, technically rigorous, concise, constructive, and adaptive.
Your goal is to evaluate the candidate's practical and conceptual understanding of enterprise AI engineering topics.
You MUST output valid JSON only, strictly matching the requested schema.`;

export function buildAnswerAnalysisPrompt(
  question: Question,
  candidateAnswer: string,
  session: Session,
): string {
  const previousTurnsSummary = session.turns
    .slice(0, -1)
    .map(
      (t, idx) =>
        `Turn ${idx + 1} [Day ${t.day} - ${t.topic}]: Q: "${t.questionText}" | A: "${t.candidateAnswer || "N/A"}" | Score: ${t.analysis?.score ?? "N/A"}`,
    )
    .join("\n");

  return `${SYSTEM_PERSONA_PROMPT}

### Candidate Profile
Name: ${session.candidate.name}
Role: ${session.candidate.role || "AI Engineer Candidate"}

### Current Curriculum Context
Day ${question.day}: ${question.dayTitle}
Topic: ${question.topic}
Question Asked: "${question.question}"

### Candidate Response
"${candidateAnswer}"

${previousTurnsSummary ? `### Prior Interview History\n${previousTurnsSummary}\n` : ""}

### Task
Analyze the candidate's answer for technical accuracy, response depth, domain keyword coverage, and identified gaps.
Respond ONLY with a JSON object matching this schema:
{
  "score": <number 0-10>,
  "depth": <"superficial" | "adequate" | "deep">,
  "keywordsFound": [<array of identified technical terms>],
  "gapsIdentified": [<array of missing or weak concepts>],
  "feedbackSnippet": <short 1-2 sentence evaluation summary>
}`;
}

export function buildFollowUpPrompt(
  question: Question,
  candidateAnswer: string,
  analysis: AnswerAnalysis,
  session: Session,
): string {
  return `${SYSTEM_PERSONA_PROMPT}

### Candidate Profile
Candidate: ${session.candidate.name} (${session.candidate.role || "AI Engineer Candidate"})

### Context
Day ${question.day} — ${question.dayTitle} (${question.topic})
Original Question: "${question.question}"
Candidate Answer: "${candidateAnswer}"
Evaluation Depth: ${analysis.depth}
Identified Gaps: ${analysis.gapsIdentified.join(", ") || "Brief response requiring elaboration"}

### Task
Generate a targeted, constructive follow-up probing question to help the candidate demonstrate deeper technical knowledge on this topic.
Respond ONLY with a JSON object matching this schema:
{
  "followUpQuestion": <string: the question to ask the candidate>,
  "targetedGap": <string: the specific concept being probed>,
  "reasoning": <string: 1-sentence explanation of why this probe was selected>
}`;
}

export function buildFeedbackPrompt(session: Session): string {
  const transcript = session.turns
    .map(
      (t, idx) =>
        `Turn ${idx + 1} [Day ${t.day} - ${t.dayTitle} (${t.topic})]:
  Question: "${t.questionText}"
  Answer: "${t.candidateAnswer || "No answer provided"}"
  Score: ${t.analysis?.score ?? 7}/10 (${t.analysis?.depth ?? "adequate"})`,
    )
    .join("\n\n");

  return `${SYSTEM_PERSONA_PROMPT}

### Candidate Profile
Candidate: ${session.candidate.name}
Role: ${session.candidate.role || "AI Engineer"}

### Full Interview Transcript
${transcript}

### Task
Synthesize a comprehensive structured feedback evaluation for this candidate based on their performance across all curriculum days.
Respond ONLY with a JSON object matching this schema:
{
  "summary": <string: high-level performance summary>,
  "overallScore": <number 0-100 percentage>,
  "strengths": [<array of 2-3 specific technical strengths demonstrated>],
  "areasForImprovement": [<array of 2-3 specific technical growth areas>],
  "topicBreakdown": [
    {
      "day": <number>,
      "title": <string>,
      "score": <number 0-100 percentage>,
      "status": <"strong" | "developing" | "needs_work">
    }
  ]
}`;
}
