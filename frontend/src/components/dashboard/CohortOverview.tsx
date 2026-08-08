import type { CandidateData } from "../../data/candidates.js";
import { AUTHORITATIVE_CURRICULUM_DAYS } from "../../data/curriculum.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface CohortOverviewProps {
  candidate: CandidateData;
}

export function CohortOverview({ candidate }: CohortOverviewProps) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 className="h3">Authoritative Interview Evaluation Topics</h2>
          <span className="caption">Evaluation topics for candidate {candidate.name} loaded from backend/data/curriculum.json</span>
        </div>
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {AUTHORITATIVE_CURRICULUM_DAYS.length} Days / 8 Questions
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {AUTHORITATIVE_CURRICULUM_DAYS.map((day) => (
          <div
            key={day.day}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: "var(--bg-app)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="mono" style={{ color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 700 }}>
                DAY {day.day}
              </span>
              <strong style={{ color: "var(--text-primary)" }}>{day.title}</strong>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {day.topics.map((t, i) => (
                <Badge key={i} variant="neutral">{t}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
