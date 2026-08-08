import type { InterviewTurn } from "../../api/types.js";
import { Badge } from "../common/Badge.js";

interface TurnHistoryProps {
  turns: InterviewTurn[];
}

export function TurnHistory({ turns }: TurnHistoryProps) {
  const answeredTurns = turns.filter((t) => t.candidateAnswer);

  if (answeredTurns.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3 className="h3" style={{ marginBottom: "0.75rem" }}>
        Interview Transcript ({answeredTurns.length} turns completed)
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {answeredTurns.map((turn, index) => (
          <div
            key={index}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Turn {index + 1}
                </span>
                <Badge variant={turn.isFollowUp ? "warning" : "neutral"}>
                  Day {turn.day}: {turn.topic}
                </Badge>
              </div>

              {turn.analysis && (
                <Badge variant={turn.analysis.score >= 8 ? "success" : turn.analysis.score < 6 ? "error" : "warning"}>
                  Score: {turn.analysis.score}/10 ({turn.analysis.depth})
                </Badge>
              )}
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <div className="caption" style={{ marginBottom: "0.2rem" }}>Question</div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{turn.questionText}</div>
            </div>

            <div style={{ background: "var(--bg-app)", padding: "0.75rem", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-primary)" }}>
              <div className="caption" style={{ marginBottom: "0.2rem" }}>Candidate Answer</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {turn.candidateAnswer}
              </div>
            </div>

            {turn.analysis?.feedbackSnippet && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                Evaluation Note: {turn.analysis.feedbackSnippet}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
