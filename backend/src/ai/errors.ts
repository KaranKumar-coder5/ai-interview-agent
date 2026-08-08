export class InterviewError extends Error {
  constructor(
    public readonly code:
      | "session_not_found"
      | "candidate_not_found"
      | "interview_already_ended"
      | "interview_not_completed",
    message: string,
  ) {
    super(message);
    this.name = "InterviewError";
  }
}
