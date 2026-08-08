# src/ai — Interview Engine

The interview engine lives here as small, independently swappable modules so
individual components can be modified quickly during the Live Steer Challenge.

## Modules

| Module                | Status    | Responsibility                                                     |
| --------------------- | --------- | ------------------------------------------------------------------ |
| `types.ts`            | Implemented | Shared types (Candidate, Session, Question, InterviewResponse, Feedback). |
| `data.ts`             | Implemented | Loads `data/curriculum.json` and `data/candidate-profiles.json`.    |
| `context.ts`          | Implemented | In-memory session state keyed by `sessionId` (question history, answers). |
| `questions.ts`        | Implemented | Flattens the curriculum and selects the next question deterministically. |
| `feedback.ts`         | Implemented | Builds minimal structured feedback from a finished session.         |
| `index.ts`            | Implemented | Orchestrates one turn: `startInterview` / `continueInterview`.      |
| `followUps.ts`        | Planned    | Generate intelligent follow-up questions from the latest answer.    |

## Data flow (one turn)

```
POST /api/interview
  -> index.ts        (dispatch to start or continue)
  -> context.ts      (load session, append answer)
  -> questions.ts    (pick the next question from curriculum)
  -> feedback.ts     (or end the interview and return final feedback)
  -> 200 response    { sessionId, reply, done, feedback }
```

The flow is deterministic and LLM-free for now. A thin model adapter will be
added later so question generation, follow-ups, and feedback can be upgraded
without touching the surrounding structure.
