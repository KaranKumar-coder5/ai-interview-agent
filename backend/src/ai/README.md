# src/ai — Interview Engine (PLANNED, not implemented)

This directory will hold the interview engine as small, independently
swappable modules so individual components can be modified quickly during
the Live Steer Challenge.

## Planned modules

| Module                | Responsibility                                                     |
| --------------------- | ------------------------------------------------------------------ |
| `context.ts`          | Maintain conversation state keyed by `sessionId` (question history, candidate profile). |
| `questions.ts`        | Select the next question from the curriculum, spanning >= 4 days, >= 8 questions. |
| `followUps.ts`        | Generate intelligent follow-up questions from the latest answer.    |
| `feedback.ts`         | Produce structured final feedback at the end of the interview.      |
| `index.ts`            | Orchestrate one turn of the interview (input answer -> next response). |

## Planned data flow (one turn)

```
POST /api/interview
  -> context.ts   (resolve/load session, append answer)
  -> followUps.ts (detect if the current question needs a follow-up)
  -> questions.ts (else pick the next question from curriculum)
  -> feedback.ts  (or end the interview and return final feedback)
  -> 200 response
```

No LLM provider is wired in yet. The engine will call a model through a
thin adapter so the provider can be swapped without touching the engine.
