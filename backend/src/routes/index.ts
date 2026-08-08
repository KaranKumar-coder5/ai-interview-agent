import { Router } from "express";
import { candidateRouter } from "./candidates.js";
import { interviewRouter } from "./interview.js";

export const apiRouter = Router();

apiRouter.use("/interview", interviewRouter);
apiRouter.use("/candidates", candidateRouter);
