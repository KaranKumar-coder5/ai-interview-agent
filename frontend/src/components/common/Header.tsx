import { Badge } from "./Badge.js";

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
        padding: "0.85rem 1.5rem",
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "0.9rem",
              color: "#fff",
              boxShadow: "0 0 10px var(--accent-glow)",
            }}
          >
            AI
          </div>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              AI Interview Agent
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Enterprise AI Engineering Cohort Evaluation
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {candidateName && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Badge variant="accent">
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
