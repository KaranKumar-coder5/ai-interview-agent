import { Router } from "express";
import type { Request, Response } from "express";
import {
  continueInterview,
  getSessionProgress,
  getSessionSummary,
  InterviewError,
  startInterview,
} from "../ai/index.js";

export const interviewRouter = Router();

/**
 * GET /api/interview/:sessionId/progress
 *
 * Returns derived session progress for an active or completed interview.
 */
interviewRouter.get("/:sessionId/progress", (req: Request, res: Response) => {
  const sessionId = req.params.sessionId?.trim();
  if (!sessionId) {
    res.status(400).json({
      error: "invalid_request",
      message: "sessionId is required.",
    });
    return;
  }

  try {
    const progress = getSessionProgress(sessionId);
    res.json(progress);
  } catch (err) {
    if (err instanceof InterviewError) {
      const status =
        err.code === "session_not_found" || err.code === "candidate_not_found"
          ? 404
          : 400;
      res.status(status).json({ error: err.code, message: err.message });
      return;
    }
    throw err;
  }
});

/**
 * GET /api/interview/:sessionId/summary
 *
 * Returns summary and feedback for a completed interview session.
 */
interviewRouter.get("/:sessionId/summary", (req: Request, res: Response) => {
  const sessionId = req.params.sessionId?.trim();
  if (!sessionId) {
    res.status(400).json({
      error: "invalid_request",
      message: "sessionId is required.",
    });
    return;
  }

  try {
    const summary = getSessionSummary(sessionId);
    res.json(summary);
  } catch (err) {
    if (err instanceof InterviewError) {
      const status =
        err.code === "session_not_found" || err.code === "candidate_not_found"
          ? 404
          : 400;
      res.status(status).json({ error: err.code, message: err.message });
      return;
    }
    throw err;
  }
});

/**
 * POST /api/interview
 *
 * Request shapes:
 *   - Start session (ID):     { sessionId, candidateId }
 *   - Start session (Object): { sessionId, candidate: { name, role? } }
 *   - Continue session:       { sessionId, message }
 *
 * Response:
 *   { sessionId, reply, done, feedback }
 */
interviewRouter.post("/", async (req: Request, res: Response) => {
  const body: Record<string, unknown> = req.body ?? {};

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    res.status(400).json({
      error: "invalid_request",
      message: "sessionId is required.",
    });
    return;
  }

  try {
    if (typeof body.candidateId === "string" && body.candidateId.trim() !== "") {
      res.json(await startInterview(sessionId, body.candidateId.trim()));
      return;
    }

    if (body.candidate) {
      const candidate = body.candidate as { name?: unknown };
      if (typeof candidate !== "object" || candidate === null) {
        res.status(400).json({
          error: "invalid_request",
          message: "candidate must be an object.",
        });
        return;
      }
      if (typeof candidate.name !== "string" || candidate.name.trim() === "") {
        res.status(400).json({
          error: "invalid_request",
          message: "candidate.name is required to start a session.",
        });
        return;
      }
      res.json(await startInterview(sessionId, candidate as never));
      return;
    }

    if (typeof body.message === "string" && body.message.trim() !== "") {
      res.json(await continueInterview(sessionId, body.message.trim()));
      return;
    }

    res.status(400).json({
      error: "invalid_request",
      message: "Provide candidateId or candidate object to start a session, or message to continue one.",
    });
  } catch (err) {
    if (err instanceof InterviewError) {
      const status =
        err.code === "session_not_found" || err.code === "candidate_not_found"
          ? 404
          : 400;
      res.status(status).json({ error: err.code, message: err.message });
      return;
    }
    throw err;
  }
});
