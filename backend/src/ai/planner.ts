import { getCandidateById } from "./data.js";
import { QuestionGenerator } from "./generator.js";
import type { LLMProvider } from "./llm/provider.js";
import { derivePersonalizationSignals, getPersonalizedQuestions } from "./personalization.js";
import { getQuestions } from "./questions.js";
import { DecisionStrategy } from "./strategy.js";
import type {
  AdaptiveStrategy,
  AnswerAnalysis,
  InterviewTurn,
  Question,
  QuestionGenerationContext,
  Session,
} from "./types.js";

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

    // Check if we should generate a follow-up on the current question
    const lastTurn = session.turns.slice().reverse().find((t) => !t.isFollowUp);
    const lastQuestion: Question | undefined = lastTurn
      ? getQuestions().find((q) => q.id === lastTurn.questionId) || {
          id: lastTurn.questionId,
          day: lastTurn.day,
          dayTitle: lastTurn.dayTitle,
          topic: lastTurn.topic,
          question: lastTurn.questionText,
        }
      : undefined;

    if (
      lastQuestion &&
      lastAnalysis &&
      this.strategy.shouldFollowUp(lastAnalysis, session)
    ) {
      const candidateLastAnswer = session.answers[session.answers.length - 1] || "";
      const followUpText = await this.provider.generateFollowUp(
        lastQuestion,
        candidateLastAnswer,
        lastAnalysis,
        session,
      );

      session.followUpsOnCurrentQuestion += 1;

      const turn: InterviewTurn = {
        questionId: `${lastQuestion.id}_fu`,
        questionText: followUpText,
        day: lastQuestion.day,
        dayTitle: lastQuestion.dayTitle,
        topic: lastQuestion.topic,
        isFollowUp: true,
      };

      return {
        done: false,
        reply: `[Follow-up] ${followUpText}`,
        turn,
      };
    }

    // Determine next main question using QuestionGenerator
    const mainTurnsCount = session.turns.filter((t) => !t.isFollowUp).length;

    if (mainTurnsCount >= 8) {
      session.done = true;
      session.nextQuestionIndex = mainTurnsCount;
      return {
        done: true,
        reply: "Interview complete!",
      };
    }

    // Determine adaptive strategy & target difficulty
    let adaptiveStrategy: AdaptiveStrategy = "progression";
    let targetDifficulty: "basic" | "intermediate" | "advanced" = "intermediate";

    const lastScore = lastAnalysis?.score ?? lastTurn?.analysis?.score;
    const lastDepth = lastAnalysis?.depth ?? lastTurn?.analysis?.depth;

    if ((typeof lastScore === "number" && lastScore < 5) || lastDepth === "superficial") {
      adaptiveStrategy = "probe_weakness";
      targetDifficulty = "basic";
    } else if (typeof lastScore === "number" && lastScore >= 8 && lastDepth === "deep") {
      adaptiveStrategy = "deepen_strength";
      targetDifficulty = "advanced";
    } else {
      adaptiveStrategy = "progression";
      targetDifficulty = "intermediate";
    }

    // Determine target day and topic based on curriculum progression and personalization
    const personalizedBase = getPersonalizedQuestions(candidateRecord);
    const orderedDays: number[] = [];
    for (const q of personalizedBase) {
      if (!orderedDays.includes(q.day)) {
        orderedDays.push(q.day);
      }
    }
    for (let d = 1; d <= 4; d++) {
      if (!orderedDays.includes(d)) orderedDays.push(d);
    }

    const askedQuestionsPerDay: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const turn of session.turns) {
      if (!turn.isFollowUp) {
        askedQuestionsPerDay[turn.day] = (askedQuestionsPerDay[turn.day] || 0) + 1;
      }
    }

    const lastDay = lastTurn?.day || orderedDays[0] || 1;
    let targetDay = lastDay;
    if ((askedQuestionsPerDay[lastDay] || 0) >= 2) {
      const nextDay = orderedDays.find((d) => (askedQuestionsPerDay[d] || 0) < 2);
      if (nextDay !== undefined) {
        targetDay = nextDay;
      }
    }

    const targetQuestionRef =
      personalizedBase.find(
        (q) => q.day === targetDay && !session.askedQuestions?.includes(q.id),
      ) ||
      personalizedBase.find((q) => q.day === targetDay) ||
      getQuestions().find((q) => q.day === targetDay) ||
      getQuestions()[0];

    const targetTopic = targetQuestionRef.topic;
    const targetDayTitle = targetQuestionRef.dayTitle;

    const genContext: QuestionGenerationContext = {
      day: targetDay,
      dayTitle: targetDayTitle,
      topic: targetTopic,
      targetDifficulty,
      strategy: adaptiveStrategy,
      previousQuestion: lastTurn?.questionText,
      candidateAnswer: session.answers[session.answers.length - 1],
      lastAnalysis,
      askedQuestionTexts: session.turns.map((t) => t.questionText),
      candidateName: session.candidate.name,
      candidateRole: session.candidate.role,
      candidateRecord,
    };

    const generator = new QuestionGenerator(this.provider);
    const genResult = await generator.generateNextQuestion(genContext, session, candidateRecord);

    const nextQuestion = genResult.question;

    session.nextQuestionIndex = mainTurnsCount + 1;
    session.followUpsOnCurrentQuestion = 0;

    session.askedQuestions = session.askedQuestions || [];
    if (!session.askedQuestions.includes(nextQuestion.id)) {
      session.askedQuestions.push(nextQuestion.id);
    }

    session.adaptiveDecisions = session.adaptiveDecisions || [];
    session.adaptiveDecisions.push({
      questionId: nextQuestion.id,
      strategy: genResult.strategy,
      reason: genResult.reason,
      selectedQuestion: nextQuestion,
      selectedAt: Date.now(),
    });

    const isFirstQuestion = session.turns.length === 0;

    const turn: InterviewTurn = {
      questionId: nextQuestion.id,
      questionText: nextQuestion.question,
      day: nextQuestion.day,
      dayTitle: nextQuestion.dayTitle,
      topic: nextQuestion.topic,
      isFollowUp: false,
      adaptiveStrategy: genResult.strategy,
      adaptiveReason: genResult.reason,
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
