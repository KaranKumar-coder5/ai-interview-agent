import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface QuestionCardProps {
  day?: number;
  dayTitle?: string;
  topic?: string;
  questionText: string;
  isFollowUp?: boolean;
  isCompleted?: boolean;
}

export function QuestionCard({
  day,
  dayTitle,
  topic,
  questionText,
  isFollowUp,
  isCompleted,
}: QuestionCardProps) {
  return (
    <Card
      style={{
        border: isFollowUp ? "1px solid var(--probing-border)" : "1px solid var(--border-medium)",
        backgroundColor: isFollowUp ? "var(--probing-bg)" : "var(--bg-surface)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {day && <Badge variant="accent">Day {day}</Badge>}
          {topic && <Badge variant="neutral">{topic}</Badge>}
        </div>

        <div>
          {isCompleted ? (
            <Badge variant="success">Interview Completed</Badge>
          ) : isFollowUp ? (
            <Badge variant="gold">⚡ Adaptive Follow-up Probe</Badge>
          ) : (
            <Badge variant="info">Curriculum Evaluation Question</Badge>
          )}
        </div>
      </div>

      {dayTitle && (
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Module Context: {dayTitle}
        </div>
      )}

      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
        {questionText}
      </div>
    </Card>
  );
}
