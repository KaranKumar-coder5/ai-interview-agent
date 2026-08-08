import type { CurrentPosition as CurrentPosType } from "../../api/types.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface CurrentPositionProps {
  currentPosition: CurrentPosType | null;
  completed: boolean;
}

export function CurrentPosition({ currentPosition, completed }: CurrentPositionProps) {
  if (completed || !currentPosition) {
    return (
      <Card style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <Badge variant="success" style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
          ✓ Session Complete — Final Feedback Ready
        </Badge>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", fontSize: "0.9rem" }}>
          No active question pending. All evaluation milestones have been fulfilled.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: "0.75rem" }}>
        <span className="caption">ACTIVE EVALUATION POSITION</span>
        <h3 className="h3" style={{ marginTop: "0.2rem" }}>
          Day {currentPosition.day}: {currentPosition.dayTitle}
        </h3>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem" }}>
        <Badge variant="accent">Topic: {currentPosition.topic}</Badge>
        <Badge variant="neutral">Question #{currentPosition.questionIndex + 1}</Badge>
      </div>

      <div style={{ background: "var(--bg-app)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
        <span className="caption" style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Currently Awaiting Response
        </span>
        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
          {currentPosition.question}
        </div>
      </div>
    </Card>
  );
}
