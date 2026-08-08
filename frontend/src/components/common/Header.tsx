import { Badge } from "./Badge.js";
import { ThemeSwitcher } from "./ThemeSwitcher.js";

interface HeaderProps {
  backendOnline: boolean | null;
  candidateName?: string;
  sessionId?: string | null;
  onLogout?: () => void;
}

export function Header({
  backendOnline,
  candidateName,
  sessionId,
  onLogout,
}: HeaderProps) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        padding: "0.9rem 1.5rem",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary)",
              border: "1px solid var(--gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.9rem",
              color: "var(--text-inverse)",
              letterSpacing: "0.06em",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            AI
          </div>
          <div>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              AI Technical Interviewer
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Enterprise Cohort Adaptive Intelligence Platform
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          <ThemeSwitcher />

          {candidateName && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Badge variant="gold">
                👤 {candidateName}
              </Badge>
              {onLogout && (
                <button
                  className="btn btn-outline"
                  onClick={onLogout}
                  style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                  title="Clear current candidate state and change Candidate ID"
                >
                  Change Candidate
                </button>
              )}
            </div>
          )}

          {sessionId && (
            <span
              className="mono"
              style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
            >
              Session: {sessionId.slice(0, 16)}...
            </span>
          )}

          {backendOnline === true ? (
            <Badge variant="success">● API Online</Badge>
          ) : backendOnline === false ? (
            <Badge variant="error">● API Offline</Badge>
          ) : (
            <Badge variant="neutral">● Checking API...</Badge>
          )}
        </div>
      </div>
    </header>
  );
}
