import { DeterministicInterviewProvider } from "./llm/provider.js";
import type { LLMProvider } from "./llm/provider.js";
import type { Feedback, Session } from "./types.js";

const defaultProvider: LLMProvider = new DeterministicInterviewProvider();

export function buildFeedback(
  session: Session,
  provider: LLMProvider = defaultProvider,
): Feedback {
  return provider.generateFeedback(session) as Feedback;
}
