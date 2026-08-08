# AI Interview Agent

A personalized AI technical interviewer for a 31-day enterprise AI engineering
cohort. Built during a hackathon — foundation stage.

## Problem statement

Cohort participants need realistic, personalized practice for technical
interviews. This project builds an AI interviewer that:

- Understands a candidate's learning journey (curriculum progress + profile).
- Conducts a realistic multi-turn technical interview.
- Asks at least 8 questions across at least 4 curriculum days.
- Generates intelligent follow-up questions from the candidate's answers.
- Maintains conversation context via `sessionId`.
- Adapts difficulty and direction based on responses.
- Produces structured final feedback.
- Exposes `POST /api/interview` per the supplied technical specification.

## Current status

- [x] Project foundation (structure, tooling, docs)
- [ ] Curriculum & candidate profile data
- [ ] Interview engine (context, questions, follow-ups, feedback)
- [ ] LLM provider adapter
- [ ] `POST /api/interview` implementation
- [ ] Frontend interview UI
- [ ] Tests, deployment

**This milestone only establishes the foundation. No interview logic, LLM
calls, UI screens, or database logic exist yet.**

## Planned architecture

```
┌─────────────────────────────────────────────────────────┐
│                        frontend/                        │
│            React + TypeScript + Vite (SPA)              │
└──────────────────────────┬──────────────────────────────┘
                           │  /api/* (Vite dev proxy)
┌──────────────────────────▼──────────────────────────────┐
│                        backend/                         │
│            Node.js + Express + TypeScript (ESM)         │
│                                                         │
│   routes/          HTTP layer (e.g. interview router)   │
│   ai/              modular interview engine:            │
│                      context → follow-ups → questions   │
│                                 → feedback              │
│   data/            static curriculum + candidate data   │
└─────────────────────────────────────────────────────────┘
```

The AI engine lives in `backend/src/ai/` as small, independently swappable
modules (`context`, `questions`, `followUps`, `feedback`), so any single
component can be replaced or tuned quickly during the Live Steer Challenge.

## Technology stack (planned)

| Layer    | Choice                                   |
| -------- | ---------------------------------------- |
| Frontend | React, Vite, TypeScript                  |
| Backend  | Node.js, Express, TypeScript (ESM)       |
| AI       | LLM via a thin adapter (provider-agnostic) |
| Data     | Static JSON files (no database by design) |

## Hackathon requirements we intend to satisfy

- Multi-turn interview with intelligent follow-ups and adaptive difficulty.
- `sessionId`-based conversation context.
- Curriculum-driven question selection (≥ 8 questions across ≥ 4 days).
- Structured final feedback.
- `POST /api/interview` matching the technical specification.
- Modular AI components for the Live Steer Challenge.
- Authentic, incremental Git history.

## Development principles

- No fake functionality — every commit is real, working code.
- No unnecessary dependencies or infrastructure (no auth, accounts,
  microservices, or databases).
- Favor simplicity and modularity; each AI concern lives in its own module.
- Foundation first: implement one vertical slice at a time.

## Getting started

Requires Node.js >= 20 and npm.

```bash
npm install        # installs backend + frontend (npm workspaces)
npm run dev        # starts backend (:3000) and frontend (:5173)
npm run typecheck  # type-check both packages
npm run build      # production build for both packages
```

Smoke checks:

- `GET http://localhost:3000/health` → `{ "status": "ok", ... }`
- `POST http://localhost:3000/api/interview` → `501 Not Implemented` (stub)

## Repository layout

```
.
├── backend/            # Express API + interview engine (AI logic lives in src/ai)
│   ├── src/
│   │   ├── index.ts    # server bootstrap
│   │   ├── app.ts      # Express app + middleware
│   │   ├── routes/     # HTTP routes (interview stub)
│   │   └── ai/         # PLANNED modular interview engine
│   └── data/           # PLANNED static curriculum + candidate data
├── frontend/           # React + Vite SPA (UI placeholder)
├── package.json        # npm workspaces + shared scripts
└── README.md
```
