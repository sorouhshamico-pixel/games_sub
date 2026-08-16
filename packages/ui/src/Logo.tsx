import { useId } from "react";
import { cn } from "./cn";

/**
 * Charjo's icon mark: a bolt (charge/energy) in the brand gradient. Used
 * standalone (favicon) and paired with the wordmark (header/footer). useId
 * keeps the gradient id collision-free when the mark renders more than once
 * on the same page (header + footer), and is safe in Server Components.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} role="img" aria-label="Charjo">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <polygon points="17.3,6 9.3,17 13.3,17 11.3,26 20.3,14.3 15.3,14.3" fill="#f8fafc" />
    </svg>
  );
}
