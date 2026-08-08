import type { CandidateData } from "../../data/candidates.js";
import { COHORT_CURRICULUM } from "../../data/curriculum.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";
import { ModuleCard } from "./ModuleCard.js";

interface CohortCalendarProps {
  candidate: CandidateData;
}

export function CohortCalendar({ candidate }: CohortCalendarProps) {
  const totalDays = 31;
  const currentDay = candidate.cohortDay;

  return (
    <div>
      <Card style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--bg-surface) 0%, #0d1a33 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="caption" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
              ENTERPRISE AI COHORT ROADMAP
            </span>
            <h2 className="h2" style={{ marginTop: "0.25rem" }}>
              Interview Curriculum Roadmap
            </h2>
            <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Authoritative curriculum data loaded from <code>backend/data/curriculum.json</code> (Days 1–4 evaluation topics).
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", background: "var(--bg-app)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="caption">Candidate Position</span>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                Day {currentDay} / {totalDays}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1.25rem" }}>
              <span className="caption">Authoritative Days</span>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>
                4 Days (8 Questions)
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div>
        {COHORT_CURRICULUM.map((mod) => (
          <ModuleCard key={mod.id} module={mod} candidate={candidate} />
        ))}
      </div>

      <Card style={{ marginTop: "1rem", borderStyle: "dashed" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <Badge variant="neutral">Days 5–31 Dataset Notice</Badge>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.4rem 0 0 0" }}>
              Days 5–31 curriculum data is not provided in the current repository dataset (<code>backend/data/curriculum.json</code> contains Days 1–4). The application strictly avoids fabricating missing dataset entries.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
