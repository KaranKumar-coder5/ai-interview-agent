interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showFraction?: boolean;
}

export function ProgressBar({
  current,
  total,
  label,
  showFraction = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div style={{ width: "100%" }}>
      {(label || showFraction) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.35rem",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          {label && <span>{label}</span>}
          {showFraction && (
            <span className="mono">
              {current} / {total} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height: "8px",
          width: "100%",
          backgroundColor: "var(--bg-app)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: "var(--accent-primary)",
            borderRadius: "var(--radius-full)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
