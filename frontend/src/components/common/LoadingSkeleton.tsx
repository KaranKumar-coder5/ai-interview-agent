interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  height = "20px",
  width = "100%",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          style={{ height, width }}
        />
      ))}
    </div>
  );
}
