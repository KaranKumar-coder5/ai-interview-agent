import type { Feedback } from "../../api/types.js";
import { Card } from "../common/Card.js";

interface FeedbackSectionsProps {
  feedback: Feedback;
}

export function FeedbackSections({ feedback }: FeedbackSectionsProps) {
  return (
    <div className="grid-2">
      <Card style={{ borderLeft: "4px solid var(--success)" }}>
        <h3 className="h3" style={{ color: "var(--success)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>✓</span> Key Strengths & Demonstrated Competencies
        </h3>

        <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {feedback.strengths.map((str, i) => (
            <li key={i}>{str}</li>
          ))}
        </ul>
      </Card>

      <Card style={{ borderLeft: "4px solid var(--warning)" }}>
        <h3 className="h3" style={{ color: "var(--warning)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>▲</span> Growth Areas & Recommendations
        </h3>

        <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {feedback.areasForImprovement.map((area, i) => (
            <li key={i}>{area}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
