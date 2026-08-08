import type { SessionProgress } from "../../api/types.js";
import { Badge } from "../common/Badge.js";
import { Card } from "../common/Card.js";

interface ProgressMetricsProps {
  progress: SessionProgress;
}

export function ProgressMetrics({ progress }: ProgressMetricsProps) {
  return (
    <div>
      <div className="grid-4" style={{ marginBottom: "1rem" }}>
        <Card>
          <span className="caption">Questions Presented</span>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--text-primary)" }}>
            {progress.questionsAsked}
          </div>
          <span className="caption">Total turns asked</span>
        </Card>

        <Card>
          <span className="caption">Answers Recorded</span>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--accent-primary)" }}>
            {progress.answersRecorded}
          </div>
          <span className="caption">Candidate responses</span>
        </Card>

        <Card>
          <span className="caption">Adaptive Follow-ups</span>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--gold-accent)" }}>
            {progress.followUpCount}
          </div>
          <span className="caption">Probing questions</span>
        </Card>

        <Card>
          <span className="caption">Curriculum Module Coverage</span>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--success)" }}>
            {progress.daysCovered} Days
          </div>
          <span className="caption">{progress.topicsCovered} Topics evaluated</span>
        </Card>
      </div>

      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="h3">Session Status</h3>
            <span className="caption">Session ID: {progress.sessionId}</span>
          </div>
          <Badge variant={progress.completed ? "success" : "accent"}>
            {progress.status === "completed" ? "Interview Completed" : "Interview Active"}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
