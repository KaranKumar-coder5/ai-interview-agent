import { Router } from "express";
import type { Request, Response } from "express";

export const interviewRouter = Router();

/**
 * POST /api/interview
 *
 * Planned contract (per the technical specification):
 *   - Request:  { sessionId, day?, questionId?, answer?, ... }
 *   - Response: next question, follow-up question, or final feedback.
 *
 * NOT IMPLEMENTED YET. This stub exists only to establish the route shape;
 * the actual interview flow lives in src/ai/ and is intentionally deferred.
 */
interviewRouter.post("/", (_req: Request, res: Response) => {
  res.status(501).json({
    error: "Not Implemented",
    message:
      "POST /api/interview is part of the planned architecture and is not implemented yet.",
  });
});
