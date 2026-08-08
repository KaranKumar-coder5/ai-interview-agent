import { useState } from "react";
import { Card } from "../common/Card.js";

interface AnswerEditorProps {
  onSubmitAnswer: (message: string) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function AnswerEditor({
  onSubmitAnswer,
  isSubmitting,
  disabled = false,
}: AnswerEditorProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || disabled) return;
    onSubmitAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Your Answer / Explanation
          </label>
          <span className="caption">Markdown and code descriptions supported</span>
        </div>

        <textarea
          className="textarea"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Provide a detailed technical explanation detailing concepts, trade-offs, architecture, or code..."
          rows={5}
          disabled={isSubmitting || disabled}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="caption">
            {answer.trim().split(/\s+/).filter(Boolean).length} words
          </span>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!answer.trim() || isSubmitting || disabled}
          >
            {isSubmitting ? "Submitting & Analyzing..." : "Submit Answer →"}
          </button>
        </div>
      </form>
    </Card>
  );
}
