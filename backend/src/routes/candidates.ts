import { Router } from "express";
import type { Request, Response } from "express";
import { getCandidateById } from "../ai/index.js";

export const candidateRouter = Router();

/**
 * GET /api/candidates/:candidateId
 *
 * Returns authoritative candidate data ({ member, missions, signals }) when candidateId is valid,
 * or HTTP 404 when candidate ID is not found.
 */
candidateRouter.get("/:candidateId", (req: Request, res: Response) => {
  const candidateId = req.params.candidateId?.trim();
  if (!candidateId) {
    res.status(400).json({
      error: "invalid_request",
      message: "candidateId is required.",
    });
    return;
  }

  const candidateRecord = getCandidateById(candidateId);
  if (!candidateRecord) {
    res.status(404).json({
      error: "candidate_not_found",
      message: `No candidate found for candidateId "${candidateId}".`,
    });
    return;
  }

  res.json(candidateRecord);
});
