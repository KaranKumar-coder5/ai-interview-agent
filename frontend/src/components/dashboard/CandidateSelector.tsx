import type { CandidateData } from "../../data/candidates.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface CandidateSelectorProps {
  candidates: CandidateData[];
  selectedId: string;
  onSelectCandidate: (candidate: CandidateData) => void;
}

export function CandidateSelector({
  candidates,
  selectedId,
  onSelectCandidate,
}: CandidateSelectorProps) {
  return (
    <Card>
      <div style={{ marginBottom: "1rem" }}>
        <h2 className="h3">Select Candidate Profile</h2>
        <span className="caption">Authoritative profiles loaded from backend/data/candidate-profiles.json</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {candidates.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <div
              key={c.id}
              onClick={() => onSelectCandidate(c)}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? "1px solid var(--accent-primary)"
                  : "1px solid var(--border-subtle)",
                backgroundColor: isSelected
                  ? "var(--bg-surface-active)"
                  : "var(--bg-app)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {c.name}
                  </strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                    • {c.role}
                  </span>
                </div>
                <Badge variant="accent">
                  Day {c.cohortDay}
                </Badge>
              </div>
              <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {c.notes}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
