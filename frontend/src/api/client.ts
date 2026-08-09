import type {
  CandidatePayload,
  CandidateRecord,
  HealthResponse,
  InterviewResponse,
  SessionProgress,
  SessionSummary,
} from "./types.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function buildUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}

class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body
  }

  if (!response.ok) {
    const errorMsg =
      body && typeof body.message === "string"
        ? body.message
        : `HTTP request failed with status ${response.status}`;
    const errorCode = body && typeof body.error === "string" ? body.error : "http_error";

    throw new ApiClientError(response.status, errorCode, errorMsg);
  }

  return body as T;
}

export async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(buildUrl("/health"));
    return await handleResponse<HealthResponse>(res);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(0, "network_error", "Backend server is offline or unreachable.");
  }
}

export async function getCandidate(candidateId: string): Promise<CandidateRecord> {
  const trimmed = candidateId.trim();
  if (!trimmed) {
    throw new ApiClientError(400, "invalid_request", "Candidate ID cannot be empty.");
  }

  try {
    const res = await fetch(buildUrl(`/api/candidates/${encodeURIComponent(trimmed)}`));
    return await handleResponse<CandidateRecord>(res);
  } catch (err) {
    if (err instanceof ApiClientError) {
      if (err.status === 404 || err.code === "candidate_not_found") {
        throw new ApiClientError(
          404,
          "candidate_not_found",
          `No candidate found for candidateId "${trimmed}". Please check your ID and try again.`,
        );
      }
      throw err;
    }
    throw new ApiClientError(0, "network_error", "Failed to lookup candidate profile.");
  }
}

export async function startInterview(
  sessionId: string,
  candidateOrId: CandidatePayload | string,
): Promise<InterviewResponse> {
  try {
    const payload =
      typeof candidateOrId === "string"
        ? { sessionId, candidateId: candidateOrId.trim() }
        : { sessionId, candidate: candidateOrId };

    const res = await fetch(buildUrl("/api/interview"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse<InterviewResponse>(res);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(0, "network_error", "Failed to start interview session.");
  }
}

export async function continueInterview(
  sessionId: string,
  message: string,
): Promise<InterviewResponse> {
  try {
    const res = await fetch(buildUrl("/api/interview"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    });
    return await handleResponse<InterviewResponse>(res);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(0, "network_error", "Failed to submit interview response.");
  }
}

export async function getSessionProgress(sessionId: string): Promise<SessionProgress> {
  try {
    const res = await fetch(buildUrl(`/api/interview/${encodeURIComponent(sessionId)}/progress`));
    return await handleResponse<SessionProgress>(res);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(0, "network_error", "Failed to fetch session progress.");
  }
}

export async function getSessionSummary(sessionId: string): Promise<SessionSummary> {
  try {
    const res = await fetch(buildUrl(`/api/interview/${encodeURIComponent(sessionId)}/summary`));
    return await handleResponse<SessionSummary>(res);
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    throw new ApiClientError(0, "network_error", "Failed to fetch session summary.");
  }
}
