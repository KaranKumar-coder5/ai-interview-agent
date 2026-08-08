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
    if (!inputVal.trim() || isLoading) return;
    onLogin(inputVal.trim());
  };

  return (
    <div style={{ maxWidth: "420px", margin: "4rem auto 0 auto", padding: "0 1rem" }}>
      <Card style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#fff",
              margin: "0 auto 0.85rem auto",
              boxShadow: "0 0 15px var(--accent-glow)",
            }}
          >
            AI
          </div>
          <h2 className="h2" style={{ letterSpacing: "0.05em" }}>
            AI INTERVIEW AGENT
          </h2>
          <span className="caption" style={{ marginTop: "0.25rem", display: "block" }}>
            Enter your Candidate ID to access evaluation workspace
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {errorMsg && (
            <div className="alert-banner alert-error" style={{ marginBottom: 0, fontSize: "0.85rem" }}>
              {errorMsg}
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
              placeholder="e.g. priya-dev"
              disabled={isLoading}
              autoFocus
            />
            <span className="caption" style={{ display: "block", marginTop: "0.35rem" }}>
              Your Candidate ID was provided by the cohort.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputVal.trim() || isLoading}
            style={{ padding: "0.75rem", fontSize: "0.95rem", letterSpacing: "0.03em" }}
          >
            {isLoading ? "Verifying ID..." : "CONTINUE →"}
          </button>
        </form>
      </Card>
    </div>
  );
}
