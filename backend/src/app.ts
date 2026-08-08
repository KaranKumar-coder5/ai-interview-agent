import express from "express";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-interview-agent" });
});

app.use("/api", apiRouter);
