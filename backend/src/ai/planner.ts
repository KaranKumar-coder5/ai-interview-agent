import { getCandidateById } from "./data.js";
import { getPersonalizedQuestionAt, derivePersonalizationSignals } from "./personalization.js";
import { totalQuestions } from "./questions.js";
import { DecisionStrategy } from "./strategy.js";
import type { LLMProvider } from "./llm/provider.js";
import type { AnswerAnalysis, InterviewTurn, Session } from "./types.js";

export class InterviewPlanner {
  private strategy = new DecisionStrategy();

  constructor(private provider: LLMProvider) {}

  async planNextTurn(
    session: Session,
    lastAnalysis?: AnswerAnalysis,
  ): Promise<{
    done: boolean;
    reply: string;
    turn?: InterviewTurn;
  }> {
    const candidateId = session.candidateId || session.candidate.id;
    const candidateRecord = candidateId ? getCandidateById(candidateId) : undefined;

    const currentQuestionIndex = session.nextQuestionIndex;
    const currentQuestion = getPersonalizedQuestionAt(currentQuestionIndex, candidateRecord);

    // Check if we should generate a follow-up on the current question
    if (
      currentQuestion &&
      lastAnalysis &&
      this.strategy.shouldFollowUp(lastAnalysis, session)
    ) {
      const candidateLastAnswer = session.answers[session.answers.length - 1] || "";
      const followUpText = await this.provider.generateFollowUp(
        currentQuestion,
        candidateLastAnswer,
        lastAnalysis,
        session,
      );

      session.followUpsOnCurrentQuestion += 1;

      const turn: InterviewTurn = {
        questionId: `${currentQuestion.id}_fu`,
        questionText: followUpText,
        day: currentQuestion.day,
        dayTitle: currentQuestion.dayTitle,
        topic: currentQuestion.topic,
        isFollowUp: true,
      };

      return {
        done: false,
        reply: `[Follow-up] ${followUpText}`,
        turn,
      };
    }

    // Determine next question index
    const isFirstQuestion = session.turns.length === 0;
    const nextIndex = isFirstQuestion ? 0 : currentQuestionIndex + 1;

    const nextQuestion = getPersonalizedQuestionAt(nextIndex, candidateRecord);

    if (!nextQuestion || nextIndex >= totalQuestions()) {
      session.done = true;
      session.nextQuestionIndex = nextIndex;
      return {
        done: true,
        reply: "Interview complete!",
      };
    }

    session.nextQuestionIndex = nextIndex;
    session.followUpsOnCurrentQuestion = 0;

    const turn: InterviewTurn = {
      questionId: nextQuestion.id,
      questionText: nextQuestion.question,
      day: nextQuestion.day,
      dayTitle: nextQuestion.dayTitle,
      topic: nextQuestion.topic,
      isFollowUp: false,
    };

    let prefix = `Day ${nextQuestion.day} — ${nextQuestion.dayTitle}: `;

    if (isFirstQuestion) {
      const signals = derivePersonalizationSignals(candidateRecord);
      const topDomain = signals.sort((a, b) => b.riskScore - a.riskScore)[0];
      const hasFocusArea = topDomain && topDomain.riskScore > 0;

      prefix = hasFocusArea
        ? `Hi ${session.candidate.name}! Welcome to your technical interview. Based on your cohort journey, let's begin with Day ${nextQuestion.day} — ${nextQuestion.dayTitle}. `
        : `Hi ${session.candidate.name}! Welcome to your technical interview. Let's begin with Day ${nextQuestion.day} — ${nextQuestion.dayTitle}. `;
    }

    return {
      done: false,
      reply: `${prefix}${nextQuestion.question}`,
      turn,
    };
  }
}
