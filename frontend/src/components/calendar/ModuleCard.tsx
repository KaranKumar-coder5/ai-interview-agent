import type { CandidateRecord } from "../../api/types.js";
import type { CurriculumModule } from "../../data/curriculum.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface ModuleCardProps {
  module: CurriculumModule;
  candidate: CandidateRecord;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Card style={{ marginBottom: "1.25rem" }}>
      <div style={{ marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Badge variant="accent">Module {module.moduleNumber}</Badge>
          <h3 className="h3" style={{ margin: 0 }}>{module.title}</h3>
        </div>
        <p style={{ margin: "0.3rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          {module.description}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {module.days.map((d) => (
          <div
            key={d.day}
            style={{
              background: "var(--bg-app)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700 }}>
                DAY {d.day < 10 ? `0${d.day}` : d.day}
              </span>
              <Badge variant="success">Authoritative Dataset</Badge>
            </div>

            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              {d.title}
            </div>

            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
              {d.topics.map((t, i) => (
                <Badge key={i} variant="neutral">{t}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
