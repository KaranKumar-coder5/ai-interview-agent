import { Badge } from "../common/Badge.js";

export function FollowUpBanner() {
  return (
    <div
      className="alert-banner alert-probing"
      style={{
        backgroundColor: "var(--probing-bg)",
        borderColor: "var(--probing-border)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ fontSize: "1.25rem", color: "var(--gold-accent)", marginTop: "0.1rem" }}>⚡</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Adaptive Intelligence Probe
          </strong>
          <Badge variant="gold" style={{ fontSize: "0.65rem", padding: "0.1rem 0.45rem" }}>
            AI Adaptive Follow-Up
          </Badge>
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          The AI interviewer has identified a technical knowledge opportunity in your previous response. Please expand with specific architectural trade-offs, concepts, or code details.
        </span>
      </div>
    </div>
  );
}
