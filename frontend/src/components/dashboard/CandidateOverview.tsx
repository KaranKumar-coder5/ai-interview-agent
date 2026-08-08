import type { CandidateRecord } from "../../api/types.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface CandidateOverviewProps {
  candidate: CandidateRecord;
}

export function CandidateOverview({ candidate }: CandidateOverviewProps) {
  const { member, missions, signals } = candidate;

  return (
    <Card>
      {/* Header & Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 className="h2">{member.name}</h2>
            <span className="mono" style={{ fontSize: "0.8rem", color: "var(--accent-primary)", background: "var(--bg-app)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
              {member.id}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.9rem", margin: "0.2rem 0 0 0" }}>
            {member.jobRole} • {member.yearsExperience} yrs exp • {member.education}
          </p>
        </div>
        <Badge variant={member.status === "COMPLETED" ? "success" : "accent"}>
          {member.status}
        </Badge>
      </div>

      {/* Learning Signals Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.85rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "var(--bg-app)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <span className="caption">Commit Days</span>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--accent-primary)", marginTop: "0.15rem" }}>
            {signals.commitDays} Days
          </div>
        </div>

        <div style={{ background: "var(--bg-app)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <span className="caption">Missions Completed</span>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--success)", marginTop: "0.15rem" }}>
            {signals.missionsCompleted}
          </div>
        </div>

        <div style={{ background: "var(--bg-app)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <span className="caption">First-Try Success</span>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--accent-primary)", marginTop: "0.15rem" }}>
            {signals.missionsFirstTry}
          </div>
        </div>
      </div>

      {/* Authoritative Mission History */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h3 className="h3" style={{ margin: 0, fontSize: "1rem" }}>Candidate Mission History</h3>
          <span className="caption">Authoritative dataset records for {member.id}</span>
        </div>

        {missions && missions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.25rem" }}>
            {missions.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.85rem",
                  background: "var(--bg-app)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <span className="mono" style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "0.75rem" }}>
                    DAY {m.day < 10 ? `0${m.day}` : m.day}
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{m.title}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {m.skipped ? (
                    <Badge variant="neutral">Skipped</Badge>
                  ) : m.passed ? (
                    <Badge variant="success">Passed ({m.attempts || 1} {m.attempts === 1 ? "attempt" : "attempts"})</Badge>
                  ) : (
                    <Badge variant="error">Failed ({m.attempts || 1} {m.attempts === 1 ? "attempt" : "attempts"})</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            No mission history recorded for this candidate profile.
          </p>
        )}
      </div>
    </Card>
  );
}
