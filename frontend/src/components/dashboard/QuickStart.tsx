import type { CandidateData } from "../../data/candidates.js";
import { Card } from "../common/Card.js";

interface QuickStartProps {
  candidate: CandidateData;
  onStartInterview: () => void;
  isStarting: boolean;
  hasActiveSession: boolean;
  onResumeInterview: () => void;
}

export function QuickStart({
  candidate,
  onStartInterview,
  isStarting,
  hasActiveSession,
  onResumeInterview,
}: QuickStartProps) {
  return (
    <Card style={{ background: "linear-gradient(135deg, var(--bg-surface) 0%, #111a2f 100%)", border: "1px solid var(--border-medium)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div>
          <span className="caption" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            READY FOR EVALUATION
          </span>
          <h2 className="h2" style={{ marginTop: "0.2rem" }}>
            Start Technical Interview
          </h2>
          <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Launch a realistic multi-turn technical evaluation tailored to {candidate.name}'s learning journey across enterprise AI fundamentals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={onStartInterview}
            disabled={isStarting}
          >
            {isStarting ? "Initializing Session..." : `▶ Start Interview (${candidate.name})`}
          </button>

          {hasActiveSession && (
            <button
              className="btn btn-secondary"
              onClick={onResumeInterview}
            >
              Resume Active Interview →
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
