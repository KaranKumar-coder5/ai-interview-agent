import type { TopicFeedback } from "../../api/types.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface TopicBreakdownProps {
  topics: TopicFeedback[];
}

export function TopicBreakdown({ topics }: TopicBreakdownProps) {
  return (
    <Card style={{ marginBottom: "1.5rem" }}>
      <h3 className="h3" style={{ marginBottom: "1rem" }}>
        Curriculum Module Score Breakdown
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {topics.map((t, index) => {
          const variant = t.status === "strong" ? "success" : t.status === "developing" ? "warning" : "error";
          return (
            <div key={index}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "0.5rem" }}>
                    DAY {t.day}
                  </span>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{t.title}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t.score}%</span>
                  <Badge variant={variant}>
                    {t.status === "strong" ? "Strong" : t.status === "developing" ? "Developing" : "Needs Work"}
                  </Badge>
                </div>
              </div>

              <div
                style={{
                  height: "6px",
                  width: "100%",
                  backgroundColor: "var(--bg-app)",
                  borderRadius: "var(--radius-full)",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${t.score}%`,
                    backgroundColor: `var(--${variant})`,
                    borderRadius: "var(--radius-full)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
