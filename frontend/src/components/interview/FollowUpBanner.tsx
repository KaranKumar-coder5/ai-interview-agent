export function FollowUpBanner() {
  return (
    <div className="alert-banner alert-warning">
      <div style={{ fontSize: "1.2rem" }}>⚡</div>
      <div>
        <strong style={{ display: "block", marginBottom: "0.15rem" }}>
          Adaptive Probing Triggered
        </strong>
        <span>
          The interviewer detected an opportunity to probe deeper into your previous response. Please expand with specific technical details.
        </span>
      </div>
    </div>
  );
}
