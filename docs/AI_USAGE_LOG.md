# AI Usage Log — AI Interview Agent

This log maintains a truthful, chronological record of AI-assisted development for the **ABTalks AI Cohort Hackathon** authenticity review.

All entries correspond to real implementation milestones, human reviews, automated test executions, and verified Git commits.

---

## Milestone 1: Project Foundation

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Foundation
- **Goal**: Initialize project foundation and monorepo structure for the AI Interview Agent application.
- **Prompt Summary**: Requested initial monorepo setup containing root npm workspace configuration, Express backend setup with TypeScript, Vite + React frontend setup with TypeScript, and basic application routes.
- **Work Performed**:
  - Initialized npm workspace monorepo structure (`backend` and `frontend`).
  - Configured root workspace package scripts (`dev`, `build`, `typecheck`, `start`).
  - Setup Express backend foundation with TypeScript and `tsx`.
  - Setup React + Vite frontend foundation with TypeScript.
  - Added repository `.gitignore` and `README.md`.
- **Files or Areas Affected**:
  - `package.json`
  - `README.md`
  - `.gitignore`
  - `backend/`
  - `frontend/`
- **Human Review Performed**:
  - Reviewed directory structure, package workspace configurations, TypeScript configurations (`tsconfig.json`), and script commands.
- **Testing Performed**:
  - Ran workspace initialization commands and verified workspace builds and typechecking.
- **Git Commit**: `9dc55b4` — `chore: initialize project foundation`
- **Notes / Limitations**: Initial foundation setup with basic boilerplate routes; no interview logic implemented in this commit.

---

## Milestone 2: Interview Session Flow (Backend Milestone 1)

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Backend Milestone 1 — Interview Session Flow
- **Goal**: Build an initial end-to-end backend vertical slice allowing candidates to start an interview session, record answers, iterate through curriculum-driven questions, receive basic feedback upon completion, and validate API requests.
- **Prompt Summary**: Requested implementation of the session-based interview flow using express and node-native testing, creating data loaders for curriculum and candidate profiles, in-memory session context management, linear question progression, completion feedback generation, and error handling for invalid/missing sessions.
- **Work Performed**:
  - Created organizer curriculum dataset (`backend/data/curriculum.json`) covering 4 curriculum days and candidate profiles dataset (`backend/data/candidate-profiles.json`).
  - Defined TypeScript interfaces for `Candidate`, `Curriculum`, `Question`, `Session`, `Feedback`, and `InterviewResponse` (`backend/src/ai/types.ts`).
  - Added synchronous JSON data loaders (`backend/src/ai/data.ts`).
  - Created in-memory session store (`backend/src/ai/context.ts`).
  - Implemented curriculum question flattening helper (`backend/src/ai/questions.ts`).
  - Added turn summary feedback generator (`backend/src/ai/feedback.ts`).
  - Built interview orchestrator (`backend/src/ai/index.ts`) handling `startInterview` and `continueInterview`.
  - Exposed HTTP endpoint `POST /api/interview` (`backend/src/routes/interview.ts`) with request validation and error handling.
  - Wrote automated test suite (`backend/test/interview.test.ts`).
- **Files or Areas Affected**:
  - `backend/data/curriculum.json`
  - `backend/data/candidate-profiles.json`
  - `backend/src/ai/types.ts`
  - `backend/src/ai/data.ts`
  - `backend/src/ai/context.ts`
  - `backend/src/ai/questions.ts`
  - `backend/src/ai/feedback.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/routes/interview.ts`
  - `backend/test/interview.test.ts`
- **Human Review Performed**:
  - Reviewed type definitions, error status codes (`400`, `404`), API payload design, and session state mutability.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces.
  - Ran backend test suite (`npm test -w backend`), verifying session creation, question progression, interview completion feedback, and unknown session error rejection (3/3 passing).
- **Git Commit**: `4b89cca` — `feat: implement interview session flow`
- **Notes / Limitations**: Intentionally deterministic baseline implementation; questions advanced linearly ($i \to i+1$) without dynamic answer evaluation or adaptive follow-up probing.

---

## Milestone 3: Interview Intelligence Architecture (Backend Milestone 2)

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Backend Milestone 2 — Interview Intelligence Architecture
- **Goal**: Evolve the backend architecture into a modular interview intelligence system featuring candidate answer evaluation, adaptive follow-up branching, curriculum coverage enforcement, structured feedback generation, and an extensible LLM provider adapter.
- **Prompt Summary**: Requested architectural design and implementation of clean domain abstractions (`LLMProvider`, `DeterministicInterviewProvider`, `AnswerAnalyzer`, `InterviewPlanner`, `DecisionStrategy`) to support adaptive follow-up probing, 8+ question / 4+ day curriculum guarantees, session history tracking, structured feedback synthesis, and HTTP smoke tests without introducing external LLM dependencies, API keys, or breaking the `POST /api/interview` contract.
- **Work Performed**:
  - Created `LLMProvider` interface and `DeterministicInterviewProvider` class (`backend/src/ai/llm/provider.ts`) establishing heuristic signal processing (response length, known domain terminology, keyword matching) without claiming true semantic AI reasoning.
  - Implemented `AnswerAnalyzer` (`backend/src/ai/analyzer.ts`) to evaluate candidate response depth (`superficial`, `adequate`, `deep`) and missing technical keywords.
  - Implemented `DecisionStrategy` (`backend/src/ai/strategy.ts`) and `InterviewPlanner` (`backend/src/ai/planner.ts`) to decide dynamically between follow-up probing for brief/weak responses and curriculum progression across 4 days / 8+ questions.
  - Upgraded structured feedback engine (`backend/src/ai/feedback.ts`) to generate topic-level evaluation breakdown, strengths, areas for improvement, and overall percentage scores.
  - Updated session state (`backend/src/ai/types.ts`, `backend/src/ai/context.ts`) to persist full turn history (`questionId`, `questionText`, `candidateAnswer`, `topic`, `analysis`, `isFollowUp`).
  - Updated orchestrator (`backend/src/ai/index.ts`) and route handler (`backend/src/routes/interview.ts`) with async/await support and `setLLMProvider` helper for provider interchangeability.
  - Added unit test suite (`backend/test/intelligence.test.ts`) and end-to-end HTTP API smoke test suite (`backend/test/http-smoke.test.ts`).
- **Files or Areas Affected**:
  - `backend/src/ai/llm/provider.ts` [NEW]
  - `backend/src/ai/analyzer.ts` [NEW]
  - `backend/src/ai/strategy.ts` [NEW]
  - `backend/src/ai/planner.ts` [NEW]
  - `backend/test/intelligence.test.ts` [NEW]
  - `backend/test/http-smoke.test.ts` [NEW]
  - `backend/src/ai/types.ts`
  - `backend/src/ai/context.ts`
  - `backend/src/ai/feedback.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/routes/interview.ts`
  - `backend/package.json`
  - `backend/test/interview.test.ts`
- **Human Review Performed**:
  - Conducted verification review ensuring zero breaking changes to `POST /api/interview`, honest heuristic provider naming (`DeterministicInterviewProvider`), zero external LLM API key / secret dependencies, and explicit assertion checks for hackathon requirements.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 12/12 tests across 3 suites (`HTTP API Smoke Test`, `Interview Intelligence Architecture`, `interview flow`).
- **Git Commit**: `9c8e07e` — `feat: add interview intelligence architecture`
- **Notes / Limitations**: Default provider uses heuristic signal processing for offline deterministic operation. Architecture is fully prepared to accept real LLM adapters (e.g., `GeminiProvider`) in future milestones.

---

## Milestone 4: Gemini LLM Provider + Resilient Fallback (Backend Milestone 3)

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Backend Milestone 3 — Gemini LLM Provider + Resilient Fallback
- **Goal**: Integrate a real Google Gemini LLM provider (`GeminiProvider`) behind the `LLMProvider` abstraction, backed by a resilient fallback provider (`FallbackInterviewProvider`) to provide graceful degradation to the deterministic provider when Gemini is unavailable or fails.
- **Prompt Summary**: Requested implementation of environment configuration (`config.ts`), prompt builders (`prompts.ts`), structured output JSON validators (`validator.ts`), Gemini API client (`gemini.ts`), resilient fallback provider (`fallback.ts`), provider auto-factory (`factory.ts`), and unit/integration tests (`gemini-provider.test.ts`) while preserving API compatibility, server-side key security, and orchestrator constraints.
- **Work Performed**:
  - Implemented environment configuration loader (`backend/src/ai/llm/config.ts`) supporting `GEMINI_API_KEY`, `GEMINI_MODEL`, `LLM_PROVIDER`, and `LLM_TIMEOUT_MS`.
  - Created isolated prompt builder module (`backend/src/ai/llm/prompts.ts`) formatting candidate profile, current curriculum day, topic, turn history, and evaluation persona.
  - Built JSON schema parsers and validators (`backend/src/ai/llm/validator.ts`) for structured model outputs (`AnswerAnalysis`, `followUpQuestion`, `Feedback`).
  - Created `GeminiProvider` (`backend/src/ai/llm/gemini.ts`) using official `@google/genai` SDK with `responseMimeType: "application/json"` and timeout guards.
  - Implemented `FallbackInterviewProvider` (`backend/src/ai/llm/fallback.ts`) catching missing keys, network errors, timeouts, rate limits (429), and malformed JSON, degrading automatically to `DeterministicInterviewProvider`.
  - Added provider auto-factory (`backend/src/ai/llm/factory.ts`) and updated orchestrator default provider in `backend/src/ai/index.ts`.
  - Added `backend/.env.example` containing server-side configuration placeholders.
  - Added comprehensive test suite (`backend/test/gemini-provider.test.ts`).
- **Files or Areas Affected**:
  - `backend/src/ai/llm/config.ts` [NEW]
  - `backend/src/ai/llm/prompts.ts` [NEW]
  - `backend/src/ai/llm/validator.ts` [NEW]
  - `backend/src/ai/llm/gemini.ts` [NEW]
  - `backend/src/ai/llm/fallback.ts` [NEW]
  - `backend/src/ai/llm/factory.ts` [NEW]
  - `backend/test/gemini-provider.test.ts` [NEW]
  - `backend/.env.example` [NEW]
  - `backend/src/ai/index.ts`
  - `backend/package.json`
  - `package-lock.json`
- **Human Review Performed**:
  - Verified server-side API key protection (no hardcoded keys, `.env` in `.gitignore`, placeholder `.env.example`), 100% backward compatibility of `POST /api/interview`, strict orchestrator control over minimum 8 questions and 4 curriculum days, and complete fallback path validation.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 20/20 tests across 4 suites (`Gemini Provider, Validator & Resilient Fallback Tests`, `HTTP API Smoke Test`, `Interview Intelligence Architecture`, `interview flow`).
  - Verified structured output validation, deterministic fallback triggers, timeout handling, missing key handling, 8+ question minimum enforcement, 4+ day minimum enforcement, and HTTP API compatibility.
- **Git Commit**: `f239ae8` — `feat: integrate Gemini interview provider`
- **Notes / Limitations**: The application is configured to use Gemini when `GEMINI_API_KEY` is present in the server environment. The normal automated test suite does not require a live Gemini API call and uses deterministic/mocked behavior where applicable.

---

## Milestone 5: Session Progress & Summary Layer

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Session Progress & Summary Layer
- **Goal**: Expose live interview session metrics and post-interview performance summaries via dedicated API routes (`GET /api/interview/:sessionId/progress` and `GET /api/interview/:sessionId/summary`), refactoring circular dependencies and ensuring accurate current position tracking.
- **Prompt Summary**: Requested implementation of session progress and summary layer endpoints, circular dependency refactoring by extracting `InterviewError` into `backend/src/ai/errors.ts`, calculating live candidate progress metrics (`daysCovered`, `topicsCovered`, `currentPosition`), enforcing summary restrictions on active sessions (`interview_not_completed`), and creating test suites.
- **Work Performed**:
  - Refactored `InterviewError` into independent module `backend/src/ai/errors.ts`, eliminating circular dependency between `progress.ts` and `index.ts`.
  - Created `backend/src/ai/progress.ts` with `buildSessionProgress`, `getSessionProgress`, `buildSessionSummary`, and `getSessionSummary`.
  - Defined TypeScript interfaces `SessionProgress`, `SessionSummary`, `CurrentPosition` in `backend/src/ai/types.ts`.
  - Exposed HTTP routes `GET /api/interview/:sessionId/progress` and `GET /api/interview/:sessionId/summary` in `backend/src/routes/interview.ts`.
  - Fixed `currentPosition` tracking to accurately reflect current question domain vs follow-up questions vs completed state (`null`).
  - Added unit test suite `backend/test/progress.test.ts` (6 tests) and extended `backend/test/http-smoke.test.ts`.
- **Files or Areas Affected**:
  - `backend/src/ai/errors.ts` [NEW]
  - `backend/src/ai/progress.ts` [NEW]
  - `backend/test/progress.test.ts` [NEW]
  - `backend/src/ai/types.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/routes/interview.ts`
  - `backend/test/http-smoke.test.ts`
  - `backend/package.json`
- **Human Review Performed**:
  - Verified removal of circular dependencies, verified `InterviewError` re-exports for external API compatibility, verified HTTP 400 error handling for summary requests on active interviews, and reviewed current position state calculation logic.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 30/30 tests across 5 test suites.
  - Executed `npm run build` and `git diff --check`.
- **Git Commit**: `da9b34e` — `feat: add interview progress and summary layer`
- **Notes / Limitations**: Progress and summary layer operates in-memory alongside existing session context without requiring external databases.

---

## Milestone 5A: Authoritative Cohort Dataset Migration

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Authoritative Cohort Dataset Migration
- **Goal**: Migrate the authoritative 31-day cohort curriculum (`curriculum.json`) and complete 20-candidate dataset (`candidates.json`) into `backend/data/` to replace legacy stub data while preserving active interview engine evaluation compatibility.
- **Prompt Summary**: Requested migration of full 31-day curriculum dataset and authoritative candidate records (`CAND-001` through `CAND-020`) from supplied hackathon resources into backend repository, extending TypeScript data types, building synchronous loader helpers (`loadCurriculum`, `loadCandidates`, `getCandidateById`), preserving legacy test profile compatibility (`priya-dev`, `marcus-ml`), and writing verification test suite without modifying frontend or engine behavior.
- **Work Performed**:
  - Copied authoritative 31-day curriculum (`curriculum.json`) to `backend/data/curriculum.json` (31 days, 8 modules).
  - Copied authoritative candidate dataset (`candidates.json`) to `backend/data/candidates.json` (20 candidate records containing `member`, `missions`, `signals`).
  - Defined TypeScript interfaces (`CohortCurriculum`, `CohortModule`, `CohortDay`, `CandidateRecord`, `CandidateMember`, `CandidateMission`, `CandidateSignals`) in `backend/src/ai/types.ts`.
  - Extended data loading layer in `backend/src/ai/data.ts` with `loadCurriculum()`, `loadCandidates()`, `getCandidateById()`, and `candidateRecordToCandidate()`.
  - Updated `backend/src/ai/questions.ts` to preserve the 4-day / 8-question evaluation domain questions (`d1q1`..`d4q2`) for active interview sessions.
  - Added unit test suite `backend/test/data-migration.test.ts` (10 tests) and fixed test isolation hooks (`afterEach`) across provider test suites.
- **Files or Areas Affected**:
  - `backend/data/candidates.json` [NEW]
  - `backend/test/data-migration.test.ts` [NEW]
  - `backend/data/curriculum.json`
  - `backend/src/ai/types.ts`
  - `backend/src/ai/data.ts`
  - `backend/src/ai/questions.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/routes/candidates.ts`
  - `backend/test/gemini-provider.test.ts`
  - `backend/test/intelligence.test.ts`
  - `backend/package.json`
- **Human Review Performed**:
  - Verified 31-day curriculum loading, 20-candidate record integrity, unique ID mapping (`CAND-001`..`CAND-020`), strict distinction between 31-day cohort roadmap and 4-day evaluation curriculum, and backward compatibility for existing test suite IDs.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 44/44 tests across 6 test suites.
  - Verified `npm run build` and `git diff --check`.
- **Git Commit**: `8373b8b` — `feat: migrate authoritative cohort datasets`
- **Notes / Limitations**: Dataset migration updated underlying data representations without changing candidate personalization logic or interview engine question selection yet.

---

## Milestone 5B: Candidate ID API

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Candidate ID API
- **Goal**: Expose a read-only backend API endpoint `GET /api/candidates/:candidateId` to serve candidate profiles based on candidate ID lookup, enforcing data isolation without passwords or external authentication dependencies.
- **Prompt Summary**: Requested implementation of candidate lookup route `GET /api/candidates/:candidateId` returning full authoritative `CandidateRecord` (`{ member, missions, signals }`), trimming whitespace, handling case insensitivity, returning HTTP 404 with `candidate_not_found` for invalid IDs, prohibiting bulk candidate listing endpoints (`GET /api/candidates`), and writing HTTP smoke tests.
- **Work Performed**:
  - Updated `backend/src/routes/candidates.ts` to return full authoritative `CandidateRecord` directly on `GET /api/candidates/:candidateId`.
  - Integrated whitespace trimming and case-insensitive lookup via `getCandidateById`.
  - Added structured HTTP 404 error handler (`{ error: "candidate_not_found", message: "..." }`).
  - Enforced strict candidate isolation (requests for `CAND-001` return only `CAND-001` data; no bulk list route exposed).
  - Updated `backend/test/http-smoke.test.ts` with dedicated Candidate ID API tests (lookup for `CAND-001` and `CAND-020`, schema assertions, isolation checks, 404 response assertions).
- **Files or Areas Affected**:
  - `backend/src/routes/candidates.ts`
  - `backend/test/http-smoke.test.ts`
- **Human Review Performed**:
  - Verified exact output shape (`{ member, missions, signals }`), verified HTTP 404 error format, verified zero bulk endpoints exposed, and confirmed zero authentication/JWT/password dependencies.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 47/47 tests across 6 test suites.
  - Executed `npm run build` and `git diff --check`.
- **Git Commit**: `51a4e60` — `feat: add candidate ID lookup API`
- **Notes / Limitations**: Candidate ID serves as the lookup credential for the hackathon application. Password and JWT authentication are intentionally omitted per specification.

---

## Milestone 5C: Personalized Interview Engine

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Personalized Interview Engine
- **Goal**: Make the interview engine personalize question selection using candidate learning history (`CandidateRecord`), prioritizing weak/failed/skipped/multi-attempt mission areas while maintaining 8+ question / 4+ day curriculum guarantees and follow-up probing.
- **Prompt Summary**: Requested design and implementation of deterministic candidate personalization signal algorithm (`personalization.ts`), calculating domain risk scores based on candidate mission status (`passed`, `skipped`, `attempts`), reordering evaluation domain questions, associating `candidateId` with interview sessions, supporting both `{ sessionId, candidateId }` and legacy `{ sessionId, candidate }` payloads in `POST /api/interview`, and writing comprehensive tests.
- **Work Performed**:
  - Created `backend/src/ai/personalization.ts` with `derivePersonalizationSignals()`, `getPersonalizedQuestions()`, and `getPersonalizedQuestionAt()`.
  - Implemented deterministic risk-scoring logic:
    - Failed missions (`passed: false`): +10 risk score (HIGH priority)
    - Skipped missions (`skipped: true`): +8 risk score (HIGH priority)
    - Multi-attempt missions (`attempts > 1`): +(attempts - 1) * 3 risk score
  - Updated `InterviewPlanner` (`backend/src/ai/planner.ts`) to fetch candidate learning signals and prioritize high-risk domain questions first.
  - Updated `Session` type in `backend/src/ai/types.ts`, `context.ts`, and `progress.ts` to store and output `candidateId`.
  - Updated `startInterview` (`backend/src/ai/index.ts`) to support `candidateId` string payload while maintaining backward compatibility for legacy `candidate` object payloads.
  - Ensured minimum guarantees remain enforced (8+ questions, 4+ curriculum days, adaptive follow-up probing via `DecisionStrategy`).
  - Added dedicated test suite `backend/test/personalization.test.ts` (12 tests) and updated `backend/package.json`.
- **Files or Areas Affected**:
  - `backend/src/ai/personalization.ts` [NEW]
  - `backend/test/personalization.test.ts` [NEW]
  - `backend/src/ai/types.ts`
  - `backend/src/ai/context.ts`
  - `backend/src/ai/planner.ts`
  - `backend/src/ai/progress.ts`
  - `backend/src/ai/index.ts`
  - `backend/package.json`
- **Human Review Performed**:
  - Verified deterministic algorithm (explainable from mission history, zero hardcoded candidate ID conditionals), verified minimum 8 questions and 4 days coverage, verified candidate session isolation, and verified backward compatibility.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 59/59 tests across 7 test suites.
  - Executed `npm run build` and `git diff --check`.
- **Git Commit**: `b6a6d61` — `feat: add personalized interview engine`
- **Notes / Limitations**: Question selection is personalized based on candidate cohort learning history. Evaluation domain questions remain structured across core curriculum modules.

---

## Milestone 6: Frontend Foundation & Interview Workspace

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Frontend & Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Frontend Foundation & Interview Workspace
- **Goal**: Implement the frontend web application for the AI Interview Agent using React 19, TypeScript, Vite, and Vanilla CSS design system, featuring typed API client, candidate selection, interview chat interface, real-time progress indicators, completed summary dashboards, and backend health monitoring.
- **Prompt Summary**: Requested implementation of React + Vite frontend workspace using clean modern UI/UX principles, glassmorphism CSS components, typed API client (`api.ts`), interactive interview chat workspace with live turns and follow-up badges, candidate profile selector, progress indicators (`SessionProgress`), completion feedback breakdown, cohort calendar visualization, and backend connection status indicator without adding external component libraries.
- **Work Performed**:
  - Built custom dark-mode glassmorphism design system in `frontend/src/index.css` featuring CSS variables, smooth transitions, badges, and responsive card layouts.
  - Implemented strongly-typed backend API client `frontend/src/services/api.ts` connecting to `/api/interview`, `/api/interview/:sessionId/progress`, `/api/interview/:sessionId/summary`, `/api/candidates/:candidateId`, and `/health`.
  - Created interactive interview workspace component with turn history, active question card, superficial answer follow-up indicator, typing status, and candidate response form.
  - Added session progress header bar displaying completed days, questions asked, follow-up count, and active position.
  - Added structured evaluation summary modal presenting score gauge, topic breakdown, strengths, and areas for improvement.
  - Added backend status indicator badge (`ONLINE` / `DISCONNECTED`) linked to `/health`.
- **Files or Areas Affected**:
  - `frontend/src/App.tsx`
  - `frontend/src/index.css`
  - `frontend/src/services/api.ts` [NEW]
  - `frontend/src/components/` [NEW]
- **Human Review Performed**:
  - Reviewed React state management, error state boundaries, responsiveness, typed API payload validation, and visual styling quality.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed full application build (`npm run build`), producing optimized production Vite bundle (`dist/`).
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Operates seamlessly against local backend API server. Uses Vanilla CSS and standard Web APIs with zero external UI framework dependencies.

---

## Milestone 7: Frontend Data Integrity Cleanup & Authoritative Alignment

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Frontend & Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Frontend Data Integrity Cleanup & Authoritative Alignment
- **Goal**: Perform repository-wide data integrity cleanup on the frontend, removing fabricated candidate profile fields, synthetic mission histories, and non-authoritative 31-day data structures to align the UI strictly with authoritative backend datasets (`curriculum.json` and `candidates.json`).
- **Prompt Summary**: Requested audit and cleanup of frontend candidate/curriculum datasets, removing invented candidate records, synthetic mission histories, and fabricated Days 5–31 data, aligning frontend curriculum and candidate representations with the authoritative backend datasets (`backend/data/curriculum.json` and `backend/data/candidates.json`), while candidate-specific profile data is retrieved through `GET /api/candidates/:candidateId`.
- **Work Performed**:
  - Audited frontend data definitions in `frontend/src/data/` and components.
  - Removed synthetic candidate profile fields, hardcoded mission attempt mocks, and invented candidate IDs.
  - Updated candidate selection and profile presentation components to fetch authoritative candidate records (`{ member, missions, signals }`) via `GET /api/candidates/:candidateId`.
  - Updated cohort calendar and curriculum view components to represent the authoritative 31-day cohort roadmap (`curriculum.json`).
  - Added explicit UI labels clarifying the relationship between the 31-day cohort learning journey and the 4-day interview evaluation domains.
  - Preserved the distinction between the 31-day cohort roadmap used to represent the learner's overall AI engineering journey and the 4-day / 8-question interview evaluation curriculum currently used by the interview engine.
- **Files or Areas Affected**:
  - `frontend/src/data/candidates.ts`
  - `frontend/src/data/curriculum.ts`
  - `frontend/src/components/calendar/CohortCalendar.tsx`
  - `frontend/src/components/dashboard/CandidateProfileCard.tsx`
  - `frontend/src/App.tsx`
- **Human Review Performed**:
  - Verified complete removal of fabricated candidate data, verified exact alignment with backend authoritative JSON files, and verified clear UI messaging regarding curriculum scope.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed `npm run build` (clean production build).
  - Verified zero data discrepancies between frontend display and backend API responses.
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Ensures complete compliance with hackathon authenticity directives. All candidate metrics displayed in UI originate strictly from `backend/data/candidates.json`.

---

## Milestone 8: Candidate ID Access & Dashboard Isolation Flow

- **Date**: August 8, 2026
- **Developer / Team Member**: Karan (Frontend & Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Candidate ID Access & Dashboard Isolation Flow
- **Goal**: Implement Candidate ID based candidate access and dashboard isolation on the frontend, allowing candidates to enter their assigned Candidate ID (`CAND-001` through `CAND-020`) to access the dashboard and personalized interview experience with strict data isolation.
- **Prompt Summary**: Requested implementation of candidate ID entry/lookup access flow on frontend, fetching candidate profile via `GET /api/candidates/:candidateId`, storing candidate context in app state, displaying candidate-specific dashboard/missions, launching personalized interview sessions with `candidateId`, and handling invalid ID errors gracefully without passwords or JWT libraries.
- **Work Performed**:
  - Created Candidate ID entry access card component featuring input validation, loading states, and error handling for unknown IDs (`candidate_not_found`).
  - Integrated candidate lookup API (`GET /api/candidates/:candidateId`) to validate candidate IDs against backend dataset.
  - Enforced single-candidate dashboard isolation in React state (once selected with `CAND-001`, the application renders only `CAND-001` profile, missions, learning signals, and interview sessions).
  - Updated session initialization to pass `candidateId` to `POST /api/interview`.
  - Added candidate session reset / switch capability.
- **Files or Areas Affected**:
  - `frontend/src/components/auth/CandidateAccessCard.tsx` [NEW]
  - `frontend/src/App.tsx`
  - `frontend/src/services/api.ts`
- **Human Review Performed**:
  - Verified candidate access flow with valid IDs (`CAND-001`..`CAND-020`), verified clear error message for invalid IDs (`CAND-999`), verified candidate-specific dashboard and interview session isolation, and confirmed zero password/auth library dependencies.
- **Testing Performed**:
  - Executed `npm run typecheck` (0 errors).
  - Executed full build (`npm run build`).
  - Verified end-to-end integration between frontend candidate access flow and backend personalized interview engine.
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Provides hackathon-appropriate candidate access based on authoritative candidate IDs.

---

## Milestone 12 — Live Groq LLM Integration

- **Date**: August 9, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Live Groq LLM Integration
- **Goal**: Document the integration of Groq as the active live LLM provider for the AI interview system, while preserving the existing provider abstraction and deterministic fallback architecture.
- **Development History**:
  - Cerebras was initially integrated and tested as a potential live provider.
  - The technical integration successfully established HTTP connections to the Cerebras API.
  - The initial model `llama-3.3-70b` returned HTTP 404 Not Found because the model ID was unavailable to the API account.
  - Available Cerebras models were inspected via `GET /v1/models`, identifying `gpt-oss-120b` as available.
  - A subsequent live request using `gpt-oss-120b` returned HTTP 402 Payment Required because inference access required billing/credits on the Cerebras account.
  - *Technical Classification*: The Cerebras technical integration succeeded and the API endpoint was reached, but inference execution was blocked by account billing/credit requirements. The `CerebrasProvider` remains preserved in the codebase as an optional provider adapter.
- **Groq Integration**:
  - Implemented `GroqProvider` (`backend/src/ai/llm/groq.ts`) connecting to the OpenAI-compatible Groq Chat Completions API.
  - **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
  - **Provider ID**: `groq`
  - **Model**: `openai/gpt-oss-120b`
  - **Authentication**: `GROQ_API_KEY` loaded strictly by the backend from local environment configuration (`backend/.env`).
  - **Secret Security**: The API key is never placed in frontend code, Vite variables, source files, logs, error tracebacks, test files, or committed files.
  - **Structured Outputs**: Requested via `response_format: { type: "json_object" }` and validated by existing backend JSON validators (`parseJsonContent`, `validateAnswerAnalysis`, `validateFollowUp`, `validateFeedback`).
  - **Resilience**: Bounded by `AbortController` timeout protection (`LLM_TIMEOUT_MS`).
  - **Reuse**: Reused existing prompt builders (`prompts.ts`), domain interfaces (`LLMProvider`), and validation schemas (`validator.ts`).
- **Configuration**:
  - `LLM_PROVIDER=groq`
  - `GROQ_API_KEY=<secret stored locally and never committed>`
  - `GROQ_MODEL=openai/gpt-oss-120b`
  - `LLM_TIMEOUT_MS=10000`
- **Provider Architecture**:
  - **Live Execution Path**:
    Frontend → Backend interview API (`POST /api/interview`) → LLM provider factory (`createProviderFromEnv`) → `GroqProvider` → Groq API → structured response validation → interview evaluation
  - **Fallback Path**:
    `GroqProvider` → `FallbackInterviewProvider` → `DeterministicInterviewProvider`
  - **Provider Observability**:
    - Successful live Groq request: `{ provider: "groq", fallback: false }`
    - Runtime failure: `{ provider: "groq", fallback: true, fallbackReason: "<reason>" }`
- **Live Verification**:
  - Verified live execution against Groq Chat Completions API.
  - The development observability status endpoint (`GET /api/dev/llm-status`) returned:
    ```json
    {
      "provider": "groq",
      "fallback": false
    }
    ```
- **Files or Areas Affected**:
  - `docs/AI_USAGE_LOG.md`
  - `backend/src/ai/llm/groq.ts`
  - `backend/src/ai/llm/config.ts`
  - `backend/src/ai/llm/factory.ts`
  - `backend/src/ai/llm/fallback.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/routes/dev.ts`
  - `backend/test/groq-provider.test.ts`
  - `backend/package.json`
- **Human Review Performed**:
  - Verified live LLM response evaluation, verified zero secret leakage in logs/APIs/frontend, verified deterministic fallback preservation, and verified exact provider observability reporting (`{ provider: "groq", fallback: false }`).
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 112/112 tests across 10 test suites.
  - Executed `npm run build` (clean backend and frontend production builds).
  - Verified `git diff --check` (0 formatting/whitespace errors).
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Groq is configured as the active primary live LLM provider using `openai/gpt-oss-120b`. Gemini, Grok/xAI, and Cerebras adapters remain preserved in the codebase for multi-provider flexibility.

---

## Milestone 13 — Adaptive Interview Intelligence

- **Date**: August 9, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Adaptive Interview Intelligence
- **Goal**: Transform the interview engine from a mostly fixed question sequence into an adaptive interview system that dynamically evaluates candidate answers, probes weaknesses, deepens strengths, and selects next questions from an approved controlled question bank without allowing LLM question hallucinations.
- **Architecture & Design**:
  - Implemented `AdaptiveQuestionSelector` (`backend/src/ai/adaptive.ts`) coordinating LLM-recommended and rule-based deterministic adaptive question selection.
  - **Controlled Question Bank Guardrail**: The LLM is strictly restricted to recommending question IDs from the approved question bank (`backend/src/ai/questions.ts`). The backend validates that every recommended `questionId` exists in the approved bank and has NOT already been asked in the session.
  - **Adaptive Decision Strategies**:
    - `probe_weakness`: Triggered when candidate demonstrates superficial depth or low score (<5), selecting a targeted question in the weak domain.
    - `deepen_strength`: Triggered when candidate demonstrates deep mastery (score >= 8), selecting an advanced/higher-difficulty concept in the domain.
    - `topic_balance` / `progression`: Maintains balanced curriculum coverage across all 4 evaluation domains (Days 1, 2, 3, 4) in an 8-question session.
  - **Deterministic Rule-Based Fallback**: If LLM adaptive selection fails, times out, returns malformed JSON, or selects an invalid/used question ID, `AdaptiveQuestionSelector` falls back to deterministic rule-based selection, ensuring the interview engine never crashes and never gets stuck.
  - **Repetition Prevention**: Guarantees a question ID is never asked twice in the same interview session.
- **Files or Areas Affected**:
  - `backend/src/ai/adaptive.ts` [NEW]
  - `backend/test/adaptive.test.ts` [NEW]
  - `backend/src/ai/questions.ts`
  - `backend/src/ai/types.ts`
  - `backend/src/ai/planner.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/ai/llm/provider.ts`
  - `backend/src/ai/llm/groq.ts`
  - `backend/src/ai/llm/fallback.ts`
  - `backend/src/ai/llm/prompts.ts`
  - `backend/src/ai/llm/validator.ts`
  - `backend/test/progress.test.ts`
  - `backend/package.json`
  - `docs/AI_USAGE_LOG.md`
- **Human Review Performed**:
  - Verified anti-hallucination guardrails (LLM cannot invent custom question text), verified repetition prevention, verified 4-day curriculum coverage across 8 main questions, verified deterministic fallback execution, and verified zero secret leakage.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed backend test suite (`npm test -w backend`), passing 124/124 tests across 11 test suites (up from 112/112).
  - Executed `npm run build` (clean backend and frontend builds).
  - Verified `git diff --check` (0 formatting/whitespace errors).
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Adaptive question selection operates within the controlled 16-question bank, ensuring curriculum safety while providing dynamic, AI-driven interview adaptability.

---

## Milestone 14 — Dynamic LLM Question Generator & Adaptive Curriculum Scope

- **Date**: August 9, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Dynamic LLM Question Generator & Adaptive Curriculum Scope
- **Goal**: Transition the AI technical interviewer from selecting predefined questions out of a static question bank to dynamically generating tailored, context-aware, technically rigorous interview questions using Groq while maintaining strict curriculum topic scope, semantic repetition prevention, and resilient fallback execution.
- **Architecture & Design**:
  - Implemented `QuestionGenerator` (`backend/src/ai/generator.ts`) coordinating dynamic LLM question generation, semantic repetition detection, regeneration bounds, and deterministic question bank fallbacks.
  - **Structured LLM Schema**: Standardized question generation requests via `buildQuestionGenerationPrompt` returning JSON:
    ```json
    {
      "question": "...",
      "topic": "...",
      "difficulty": "basic | intermediate | advanced",
      "focus": "...",
      "reason": "..."
    }
    ```
  - **Validation & Anti-Repetition Guardrails**: Created `validateGeneratedQuestion` and `isDuplicateQuestionText` in `validator.ts`. The validation layer enforces question formatting, non-emptiness, length boundaries (15-500 chars), absence of internal evaluation leak terms, and normalized Jaccard word-overlap similarity (<0.5) against all previously asked questions in the session.
  - **Difficulty & Knowledge-Gap Adaptation**:
    - `probe_weakness`: Triggered on superficial/weak answers (`score < 5`), generating a basic/diagnostic question targeting specific identified gaps.
    - `deepen_strength`: Triggered on deep/mastery answers (`score >= 8`), generating an advanced architectural trade-off question.
    - `progression`: Advances curriculum coverage across all 4 evaluation modules (Days 1, 2, 3, 4).
  - **Regeneration Limits & Resilient Fallback**: Enforces a strict max regeneration attempt limit (3 attempts). If LLM returns malformed JSON, empty output, or duplicate question text, or if Groq times out/fails, `QuestionGenerator` seamlessly falls back to rule-based predefined question selection without crashing.
  - **Observability**: Updated `FallbackObservabilityState` to report `{ provider: "groq", fallback: false, questionGeneration: true, strategy: "...", difficulty: "..." }` and detailed dev-only logs.
- **Files or Areas Affected**:
  - `backend/src/ai/generator.ts` [NEW]
  - `backend/test/generator.test.ts` [NEW]
  - `backend/src/ai/planner.ts`
  - `backend/src/ai/types.ts`
  - `backend/src/ai/index.ts`
  - `backend/src/ai/llm/provider.ts`
  - `backend/src/ai/llm/groq.ts`
  - `backend/src/ai/llm/fallback.ts`
  - `backend/src/ai/llm/prompts.ts`
  - `backend/src/ai/llm/validator.ts`
  - `backend/package.json`
  - `package.json`
  - `docs/AI_USAGE_LOG.md`
- **Human Review Performed**:
  - Verified dynamic question generation flow, verified semantic duplicate prevention, verified target difficulty adaptation, verified max regeneration bounds (3 attempts), verified zero API secret leakage, and verified clean deterministic fallback execution.
- **Testing Performed**:
  - Executed `npm run typecheck` across workspaces (0 errors).
  - Executed test suite (`npm test`), passing 144/144 tests across 13 test suites (up from 127/127).
  - Executed `npm run build` (clean backend and frontend production builds).
  - Verified `git diff --check` (0 formatting/whitespace errors).
- **Git Commit**: `[Pending commit]`
- **Notes / Limitations**: Groq dynamically generates interview questions scoped by curriculum objectives. Static question bank is retained strictly for offline tests and failure fallbacks.

---

## Milestone 15 — Final Render Production Deployment & Deployment Debugging

- **Date**: August 9, 2026
- **Developer / Team Member**: Karan (Backend lead)
- **AI Tool Used**: Antigravity AI Coding Assistant
- **Development Milestone**: Final Render Production Deployment & Deployment Debugging
- **Goal**: Document the AI-assisted work used to make the AI Technical Interviewer application production-ready and successfully deploy it to Render as a separate Static Site frontend and Web Service backend.
- **Development / AI Assistance Summary**:
  - Diagnosed the difference between Vercel single-project serverless deployment and Render dual-service (Static Site + Web Service) deployment architecture.
  - Diagnosed the backend "Application exited early" process failure on Render. Identified that `backend/src/index.ts` had been conditionally preventing `app.listen()` when `NODE_ENV=production`, causing the process to exit immediately upon import.
  - Updated `backend/src/index.ts` so the Express server unconditionally starts and listens on Render's provided `process.env.PORT` (or default fallback port `3000`), binding strictly to `0.0.0.0:${PORT}` for external accessibility.
  - Configured the frontend and backend as separate Render deployment services: React + Vite frontend as a Render Static Site, and Express + TypeScript backend as a Render Web Service (`https://ai-interview-agent-4ai9.onrender.com`).
  - Configured the frontend to communicate with the backend using a centralized environment-based `VITE_API_BASE_URL` helper (`frontend/src/api/client.ts`) rather than hardcoding production URLs, while preserving relative path fallbacks (`""`) for local dev proxying.
  - Configured resilient CORS headers in `backend/src/app.ts` to support cross-origin frontend requests from `FRONTEND_URL` and `.onrender.com` origins while permitting local development origins.
  - Verified exact Express API route contracts:
    - `GET /health` -> `{ status: "ok", service: "ai-interview-agent" }`
    - `GET /` -> `{ status: "ok", service: "AI Technical Interviewer API Server", ... }`
    - `GET /api/candidates/:candidateId`
    - `POST /api/interview`
    - `GET /api/interview/:sessionId/progress`
    - `GET /api/interview/:sessionId/summary`
  - Diagnosed production 404 responses by comparing local routing, deployed branch (`main`), Render root directory settings, and frontend `VITE_API_BASE_URL` targeting.
  - Configured required production environment variables (`LLM_PROVIDER=groq`, `GROQ_API_KEY`, `GROQ_MODEL=openai/gpt-oss-120b`, `NODE_ENV=production`, `VITE_API_BASE_URL`) without committing secrets or API keys.
  - Confirmed that no MongoDB, Redis, or external databases were required for deployment, preserving the existing candidate and session data structures.
  - Preserved existing Vercel deployment files (`api/index.ts` and `vercel.json`) as harmless and independent adapters.
- **Deployment Architecture**:
  - **Frontend**: React 19 + Vite + TypeScript deployed as a Render Static Site (`frontend` directory, `dist` publish directory, SPA rewrite rule `/*` -> `/index.html`).
  - **Backend**: Node.js + Express + TypeScript deployed as a Render Web Service (`backend` directory, `0.0.0.0:${PORT}`).
  - **Communication**: Frontend (`https://ai-interview-agent-1-c0b6.onrender.com`) → `VITE_API_BASE_URL` → Express backend (`https://ai-interview-agent-4ai9.onrender.com`) → `/api/*` routes → Groq LLM provider.
- **Production Requirements**:
  - Backend listens on `process.env.PORT`
  - Backend binds to `0.0.0.0`
  - Frontend uses `VITE_API_BASE_URL`
  - Backend uses `FRONTEND_URL` / `Origin` headers for CORS
  - LLM secrets remain strictly server-side
  - No database introduced
- **AI / Business Logic Integrity**:
  - The following core application and AI modules were **NOT** changed as part of the deployment work:
    - `QuestionGenerator`
    - `InterviewPlanner`
    - `AnswerAnalyzer`
    - `AdaptiveQuestionSelector`
    - `LLMProvider` / `GroqProvider` evaluation logic
    - Scoring algorithms
    - Session progression logic
    - Curriculum logic
    - Adaptive questioning behavior
- **Verification Results**:
  - **TypeScript Typecheck**: **0 errors** (`npm run typecheck` across workspaces).
  - **Production Build**: **Successful** (`npm run build` compiling backend TS and frontend Vite bundle).
  - **Test Suite**: **144 / 144 tests passing** across 13 test suites (`npm test`).
  - **`git diff --check`**: **Clean** (0 formatting/whitespace errors).
  - **Live Endpoints Verified**:
    - `GET /health` -> `200 OK` (`{"status":"ok","service":"ai-interview-agent"}`)
    - `GET /api/candidates/CAND-001` -> `200 OK` (`{"member":{"id":"CAND-001","name":"Sarah Johnson",...}}`)
    - `GET /api/candidates/cand-003` -> `200 OK` (`{"member":{"id":"CAND-003","name":"Emily Chen",...}}`)
- **Git Information**:
  - **Branch**: `main`
  - **Commit**: `eb678d739ae242a2c481187aee1ab5275a3428c3` — `feat: create CandidateLogin component for candidate ID authentication flow`
  - **Status**: Final production deployment changes committed and pushed to `origin/main`.
- **AI Usage / Prompt**:
  - The user prompt instructed the AI coding assistant to:
    1. Inspect the existing monorepo architecture and diagnose the Render backend startup failure ("Application exited early").
    2. Fix Express server production startup behavior in `backend/src/index.ts` so `app.listen()` executes unconditionally on `0.0.0.0:${PORT}`.
    3. Configure separate Render frontend (Static Site) and backend (Web Service) deployment architecture.
    4. Implement environment-based API base URL handling in `frontend/src/api/client.ts` (`VITE_API_BASE_URL`).
    5. Configure resilient CORS headers in `backend/src/app.ts`.
    6. Verify all API route contracts (`/health`, `/api/candidates/:candidateId`, `/api/interview/*`).
    7. Preserve all AI/interview business logic, question generation, and test suites.
    8. Execute workspace typecheck, build, test suite, and `git diff --check`.
    9. Commit and push the verified production state to `main`.
- **Lessons / Notes**:
  - Serverless deployments (Vercel) and Web Service deployments (Render) have fundamental server lifecycle differences: serverless handlers export the app function, while Web Services require a long-running HTTP server.
  - Render Web Services require `app.listen()` to run unconditionally and bind to `0.0.0.0:${PORT}`.
  - Decoupled frontend/backend deployments require an environment-based API base URL (`VITE_API_BASE_URL`). Relative `/api/*` paths only work automatically when frontend and backend share the same origin or use a development proxy.
  - Deployment configuration fixes should be strictly decoupled from core application and AI logic.
  - Application data requirements should govern database selection; no database should be introduced solely for deployment purposes.
