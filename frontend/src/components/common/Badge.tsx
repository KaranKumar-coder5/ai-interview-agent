import type { CSSProperties, ReactNode } from "react";

export type BadgeVariant = "neutral" | "accent" | "gold" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: CSSProperties;
}

export function Badge({ children, variant = "neutral", className = "", style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
}
