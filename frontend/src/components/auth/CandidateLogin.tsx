import { useState } from "react";

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
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* LEFT PANEL: Burgundy & Rose Visual Brand Panel with Diagonal Geometry */}
        <div className="login-brand-panel">
          <div className="login-geo-ribbon" />

          {/* Protruding Tab Accent on Boundary */}
          <div className="login-brand-tab"></div>

          <div className="login-brand-content">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#FFFFFF",
                marginBottom: "1.25rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              AI
            </div>

            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                lineHeight: 1.25,
                margin: "0 0 0.75rem 0",
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              AI Technical Interviewer
            </h1>

            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.5,
                margin: 0,
                color: "rgba(255, 255, 255, 0.88)",
                maxWidth: "280px",
              }}
            >
              Adaptive technical assessment powered by intelligent interviewing.
            </p>
          </div>

          <div className="login-brand-footer">
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.65)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Enterprise Cohort Evaluation
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Warm Ivory Content Surface */}
        <div className="login-form-panel">
          <div className="login-user-avatar">
            👤
          </div>

          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                margin: "0 0 0.35rem 0",
                color: "var(--login-text-heading)",
                letterSpacing: "0.04em",
              }}
            >
              AI INTERVIEWER
            </h2>
            <span
              style={{
                fontSize: "0.825rem",
                color: "var(--login-text-body)",
                display: "block",
              }}
            >
              Enter your Candidate ID to access your evaluation portal
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
                  fontWeight: 700,
                  color: "var(--login-text-heading)",
                  marginBottom: "0.45rem",
                }}
              >
                Candidate ID
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.95rem",
                    color: "var(--login-text-body)",
                    pointerEvents: "none",
                  }}
                >
                  👤
                </span>
                <input
                  className="login-input-field"
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. CAND-001"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--login-text-body)",
                  display: "block",
                  marginTop: "0.45rem",
                }}
              >
                Enter your assigned Candidate ID (e.g. CAND-001 through CAND-020).
              </span>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={!inputVal.trim() || isLoading}
            >
              {isLoading ? "Verifying Candidate ID..." : "CONTINUE TO DASHBOARD →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
