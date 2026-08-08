import type { Feedback } from "../../api/types.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface ScoreOverviewProps {
  feedback: Feedback;
}

export function ScoreOverview({ feedback }: ScoreOverviewProps) {
  const score = feedback.overallScore;
  const scoreVariant = score >= 80 ? "success" : score >= 60 ? "warning" : "error";

  return (
    <Card style={{ background: "linear-gradient(135deg, var(--bg-surface) 0%, #101c36 100%)", border: "1px solid var(--border-medium)", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="caption" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            FINAL EVALUATION REPORT
          </span>
          <h2 className="h2" style={{ marginTop: "0.25rem" }}>
            Candidate: {feedback.candidateName}
          </h2>
          <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "600px" }}>
            {feedback.summary}
          </p>
        </div>

        <div style={{ textAlign: "center", minWidth: "120px" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: `var(--${scoreVariant})`, lineHeight: 1 }}>
            {score}%
          </div>
          <Badge variant={scoreVariant} style={{ marginTop: "0.4rem" }}>
            {score >= 80 ? "Strong Mastery" : score >= 60 ? "Developing" : "Needs Review"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
