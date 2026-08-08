import type { CandidateData } from "../../data/candidates.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface CandidateOverviewProps {
  candidate: CandidateData;
}

export function CandidateOverview({ candidate }: CandidateOverviewProps) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h2 className="h2">{candidate.name}</h2>
          <span style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
            {candidate.role}
          </span>
        </div>
        <Badge variant="accent">Cohort Participant</Badge>
      </div>

      <div style={{ background: "var(--bg-app)", padding: "0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", border: "1px solid var(--border-subtle)" }}>
        <span className="caption">Current Cohort Progress</span>
        <div style={{ fontWeight: 600, marginTop: "0.2rem", fontSize: "1.1rem" }}>
          Day {candidate.cohortDay}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
        <span className="caption">Instructor / Profile Notes</span>
        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          {candidate.notes}
        </p>
      </div>
    </Card>
  );
}
