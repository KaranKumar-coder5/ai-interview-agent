import { Router } from "express";
import { interviewRouter } from "./interview.js";

export const apiRouter = Router();

apiRouter.use("/interview", interviewRouter);
