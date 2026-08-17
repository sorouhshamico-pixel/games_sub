import { useId } from "react";
import { cn } from "./cn";

/**
 * Shahnoo's icon mark, as real SVG vector shapes rather than a flattened
 * raster export — this is the fix for the PNG logo assets the user
 * supplied, which turned out to have no real alpha channel (the
 * "transparent" checkerboard was baked-in solid pixels, confirmed by
 * reading the PNG header directly). A creative re-interpretation of the
 * same motifs (gradient badge, bolt, three dots, orange flag), not a
 * pixel-exact trace: three violet dots, a purple-to-cyan badge, a bolt cut
 * through it, and the orange flag accent. Native SVG transparency means it
 * composites correctly on any background, at any size, in either theme.
 */
export function ShahnooIcon({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 44 44" className={cn("shrink-0", className)} role="img" aria-label="Shahnoo">
      <defs>
        <linearGradient id={gradientId} x1="6" y1="12" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="7" r="2.6" fill="#7c3aed" />
      <circle cx="22" cy="6" r="2.6" fill="#8354ef" />
      <circle cx="29" cy="7" r="2.6" fill="#8b5cf6" />
      <rect x="6" y="12" width="30" height="30" rx="9" fill={`url(#${gradientId})`} />
      <polygon points="24,16 14,28 19,28 16,38 28,24 22,24" fill="#f8fafc" />
      <polygon points="1,44 9,36 9,44" fill="#f5b942" transform="rotate(-6 5 40)" />
    </svg>
  );
}
