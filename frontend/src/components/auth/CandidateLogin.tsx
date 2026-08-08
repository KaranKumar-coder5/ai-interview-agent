import { useState } from "react";
import { Card } from "../common/Card.js";

interface CandidateLoginProps {
  onLogin: (candidateId: string) => Promise<void>;
  isLoading: boolean;
  errorMsg: string | null;
}

export function CandidateLogin({ onLogin, isLoading, errorMsg }: CandidateLoginProps) {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || isLoading) return;
    onLogin(trimmed);
  };

  return (
    <div style={{ maxWidth: "440px", margin: "4rem auto 0 auto", padding: "0 1rem" }}>
      <Card style={{ padding: "2.25rem", border: "1px solid var(--border-medium)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary)",
              border: "1px solid var(--gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.35rem",
              color: "var(--text-inverse)",
              margin: "0 auto 0.85rem auto",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            AI
          </div>
          <h2 className="h2" style={{ letterSpacing: "0.04em", fontSize: "1.25rem" }}>
            ROYAL AI INTERVIEWER
          </h2>
          <span className="caption" style={{ marginTop: "0.35rem", display: "block" }}>
            Enter your assigned Candidate ID to open your cohort evaluation portal
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {errorMsg && (
            <div className="alert-banner alert-error" style={{ marginBottom: 0, fontSize: "0.85rem" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Candidate ID
            </label>
            <input
              className="input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. CAND-001"
              disabled={isLoading}
              autoFocus
            />
            <span className="caption" style={{ display: "block", marginTop: "0.4rem" }}>
              Enter your assigned Candidate ID (e.g. CAND-001 through CAND-020).
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputVal.trim() || isLoading}
            style={{ padding: "0.8rem", fontSize: "0.95rem", letterSpacing: "0.03em" }}
          >
            {isLoading ? "Verifying Candidate ID..." : "CONTINUE TO DASHBOARD →"}
          </button>
        </form>
      </Card>
    </div>
  );
}
