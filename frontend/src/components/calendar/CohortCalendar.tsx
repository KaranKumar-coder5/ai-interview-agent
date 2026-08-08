import type { CandidateRecord } from "../../api/types.js";
import { COHORT_CURRICULUM } from "../../data/curriculum.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";
import { ModuleCard } from "./ModuleCard.js";

interface CohortCalendarProps {
  candidate: CandidateRecord;
}

export function CohortCalendar({ candidate }: CohortCalendarProps) {
  const totalDays = 31;
  const maxCompletedMissionDay =
    candidate.missions && candidate.missions.length > 0
      ? Math.max(...candidate.missions.map((m) => m.day))
      : 1;

  return (
    <div>
      <Card style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, var(--bg-surface) 0%, #0d1a33 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="caption" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
              ENTERPRISE AI COHORT ROADMAP
            </span>
            <h2 className="h2" style={{ marginTop: "0.25rem" }}>
              Cohort Curriculum Roadmap
            </h2>
            <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Authoritative curriculum dataset loaded from <code>backend/data/curriculum.json</code> (31 cohort days across 8 modules).
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", background: "var(--bg-app)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="caption">Candidate Journey</span>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                Day {maxCompletedMissionDay} / {totalDays}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1.25rem" }}>
              <span className="caption">Authoritative Days</span>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>
                31 Cohort Days
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
            <Badge variant="neutral">Authoritative Roadmap Notice</Badge>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.4rem 0 0 0" }}>
              The 31-day cohort roadmap represents the candidate's complete 8-module AI engineering curriculum. The live interview engine evaluates candidate proficiency across 4 core technical evaluation domains (8 questions).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
