import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={cn("animate-pulse rounded-lg bg-[var(--color-surface-elevated)]", className)}
    />
  );
}
