# Backend Milestone 2 — Interview Intelligence Architecture

Evolve the backend architecture from a simple index-based question stepper into a modular, intelligent interview orchestration system.

The architecture will establish clear abstractions for candidate context, interview planning, answer analysis, follow-up decisions, strategy selection, structured feedback, and an LLM provider interface. The deterministic provider will remain the clean default implementation, allowing future real LLM adapters (e.g., Gemini/OpenAI) to plug in seamlessly without touching HTTP routes or state management.

---

## User Review Required

> [!IMPORTANT]
> - **Zero Breaking Changes to API**: The existing `POST /api/interview` HTTP request/response contract remains 100% backward-compatible for the frontend.
> - **Deterministic Default**: The system will default to a robust deterministic strategy and mock provider, guaranteeing offline execution, predictable testing, and fast CI execution without API key requirements.

---

## Architecture Flow

```
HTTP API (POST /api/interview)
       │
       ▼
Interview Orchestrator (src/ai/index.ts)
       │
       ├──► Session & Candidate Context (src/ai/context.ts)
       │
       ├──► Answer Analyzer (src/ai/analyzer.ts)
       │       └── Analyzes response depth, technical accuracy & gaps
       │
       ├──► Interview Planner & Strategy (src/ai/planner.ts & strategy.ts)
       │       └── Decides: Probe / Follow-up vs. Next Curriculum Topic (4+ days, 8+ questions target)
       │
       ├──► LLM Provider Abstraction (src/ai/llm/provider.ts)
       │       └── Abstract interface (Mock/Deterministic Provider default, ready for Real LLM)
       │
       └──► Feedback Engine (src/ai/feedback.ts)
               └── Generates structured evaluation report with strengths & growth areas
```

---

## Proposed Changes

### Backend Core (`backend/src/ai/`)

#### [NEW] [provider.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/llm/provider.ts)
- Define `LLMProvider` interface with methods: `analyzeAnswer`, `decideNextStep`, `generateQuestion`, `generateFeedback`.
- Implement `DeterministicLLMProvider` implementing intelligent heuristic logic to simulate AI decisions.

#### [NEW] [analyzer.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/analyzer.ts)
- Inspect candidate answers for technical depth, key terminology, response length, and topic comprehension.
- Categorize response quality (e.g., `detailed`, `superficial`, `confused`, `off-topic`).

#### [NEW] [planner.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/planner.ts)
- Maintain target progression across 4 curriculum days and 8+ questions.
- Track session state: active topic, questions asked per topic, pending follow-ups, concept mastery ratings.
- Decide next turn action: `FOLLOW_UP`, `NEXT_CURRICULUM_TOPIC`, or `COMPLETE`.

#### [NEW] [strategy.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/strategy.ts)
- Formulate follow-up questions tailored to previous candidate answers (e.g., asking for code examples, edge cases, or trade-off comparisons when answer is brief/vague).

#### [MODIFY] [types.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/types.ts)
- Extend `Session` model with `history` (turn-by-turn question, answer, analysis, topic), `currentTopicIndex`, `followUpCount`, and `topicScores`.
- Extend `Feedback` interface to include topic breakdown, strengths, areas for improvement, and practice recommendations.

#### [MODIFY] [feedback.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/feedback.ts)
- Upgrade `buildFeedback` to synthesize detailed domain-aware feedback based on session history and topic performance.

#### [MODIFY] [index.ts](file:///c:/Users/karan/ai-interview-agent/backend/src/ai/index.ts)
- Wire `startInterview` and `continueInterview` to delegate work to the Planner, Analyzer, Strategy, and Provider modules while preserving response schemas.

---

## Verification Plan

### Automated Tests
- Run `npm test -w backend` (or `npx tsx --test backend/test/*.test.ts`).
- Add test suites in `backend/test/intelligence.test.ts` verifying:
  1. Follow-up question generation when answer requires elaboration.
  2. Curriculum day coverage tracking (ensuring 4 days covered across 8 questions).
  3. Structured feedback enrichment with topic scores and improvement recommendations.
  4. LLM provider abstraction interchangeability.

### Manual Verification
- Execute typecheck across workspaces: `npm run typecheck`.
- Execute test suite: `npm test -w backend`.
