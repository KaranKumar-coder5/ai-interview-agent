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

export function buildAdaptiveSelectionPrompt(
  availableQuestions: Question[],
  lastAnalysis?: AnswerAnalysis,
  session?: Session,
): string {
  const optionsSummary = availableQuestions
    .map(
      (q) =>
        `- ID: "${q.id}" | Day ${q.day} (${q.dayTitle}) | Topic: "${q.topic}" | Difficulty: "${q.difficulty || "intermediate"}" | Question: "${q.question}"`,
    )
    .join("\n");

  const lastTurn = session?.turns[session.turns.length - 1];
  const lastContext = lastTurn
    ? `Last Question [Day ${lastTurn.day} - ${lastTurn.topic}]: "${lastTurn.questionText}"
Last Answer: "${lastTurn.candidateAnswer || "N/A"}"
Last Evaluation: Score ${lastAnalysis?.score ?? "N/A"}/10, Depth: ${lastAnalysis?.depth ?? "N/A"}
Identified Gaps: ${lastAnalysis?.gapsIdentified?.join(", ") || "None"}`
    : "Interview initialization — select first question.";

  return `${SYSTEM_PERSONA_PROMPT}

### Candidate Profile
Candidate: ${session?.candidate.name || "Candidate"}

### Recent Evaluation Context
${lastContext}

### Approved Question Bank Options (Unasked)
${optionsSummary}

### Task
Select the single best next question ID from the provided approved question list to adaptively evaluate the candidate.
- If last score < 5 or depth is "superficial", prefer a question that probes the weak topic ("probe_weakness").
- If last score >= 8 and depth is "deep", prefer a deeper or advanced concept ("deepen_strength").
- Otherwise, balance curriculum coverage ("topic_balance" or "progression").

You MUST select a question ID from the provided list. Do NOT invent a new question ID or question text.

Respond ONLY with a JSON object matching this schema:
{
  "questionId": <string: exact ID from the approved question list>,
  "strategy": <"probe_weakness" | "deepen_strength" | "progression" | "topic_balance">,
  "reason": <string: short 1-sentence justification for this question choice>
}`;
}

export function buildQuestionGenerationPrompt(
  context: import("../types.js").QuestionGenerationContext,
): string {
  const previouslyAsked =
    context.askedQuestionTexts && context.askedQuestionTexts.length > 0
      ? context.askedQuestionTexts.map((q, idx) => `${idx + 1}. "${q}"`).join("\n")
      : "None asked yet in this session.";

  const prevQContext = context.previousQuestion
    ? `### Previous Question Asked\n"${context.previousQuestion}"\n\n### Candidate Previous Response\n"${(
        context.candidateAnswer || ""
      ).replace(/"/g, "'")}"\n\n### Candidate Response Evaluation\nScore: ${
        context.lastAnalysis?.score ?? "N/A"
      }/10 | Depth: ${context.lastAnalysis?.depth ?? "N/A"}\nDemonstrated Terms: ${
        context.lastAnalysis?.keywordsFound?.join(", ") || "None"
      }\nIdentified Gaps / Missing Concepts: ${
        context.lastAnalysis?.gapsIdentified?.join(", ") || "None"
      }\nEvaluation Summary: ${context.lastAnalysis?.feedbackSnippet || "N/A"}`
    : "### Interview Initialization\nThis is the opening question of the technical interview.";

  return `${SYSTEM_PERSONA_PROMPT}

### Candidate Profile
Name: ${context.candidateName}
Role: ${context.candidateRole || "AI Engineer Candidate"}

### Current Curriculum Scope & Objectives
Curriculum Module: Day ${context.day} — ${context.dayTitle}
Target Topic: ${context.topic}
Target Difficulty: ${context.targetDifficulty}
Adaptive Strategy: ${context.strategy}

${prevQContext}

### Questions Previously Asked (DO NOT REPEAT OR DUPLICATE ANY OF THESE)
${previouslyAsked}

### Question Generation Instructions
As an expert senior AI technical interviewer, dynamically generate ONE technically rigorous interview question.
- The question MUST stay within the scope of Day ${context.day} (${context.dayTitle}: ${context.topic}).
- Target difficulty: ${context.targetDifficulty}.
- If strategy is "probe_weakness": target the candidate's specific identified gaps (${context.lastAnalysis?.gapsIdentified?.join(", ") || "missing concepts"}) with a focused fundamental/diagnostic question.
- If strategy is "deepen_strength": challenge the candidate with a higher-difficulty architectural trade-off or implementation detail.
- If strategy is "progression" or "topic_balance": advance the conversation naturally to cover ${context.topic}.
- Ask exactly ONE clear question. Do NOT ask multiple sub-questions in a single turn.
- Do NOT repeat or duplicate any previously asked questions listed above.
- Do NOT reveal the answer, give away solutions, or mention internal scoring/metrics.
- Sound like a natural, professional human technical interviewer.

Respond ONLY with a JSON object matching this schema:
{
  "question": <string: exact single technical question string ending with a question mark>,
  "topic": "${context.topic}",
  "difficulty": "${context.targetDifficulty}",
  "focus": <string: 1-sentence description of the technical concept targeted>,
  "reason": <string: 1-sentence justification of why this question is appropriate given the candidate's history>
}`;
}
