import { Router } from "express";
import { candidateRouter } from "./candidates.js";
import { devRouter } from "./dev.js";
import { interviewRouter } from "./interview.js";

export const apiRouter = Router();

apiRouter.use("/interview", interviewRouter);
apiRouter.use("/candidates", candidateRouter);
apiRouter.use("/dev", devRouter);
