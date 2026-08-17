"use client";

import { MotionConfig } from "motion/react";

/**
 * Wraps the app once, near the root. `reducedMotion="user"` makes every
 * motion.* component and animation hook in the tree automatically respect
 * `prefers-reduced-motion: reduce` — transform/opacity animations that exist
 * purely for decoration collapse to instant, while animations that convey
 * real state (e.g. a loading spinner) keep working. This is the one place
 * that policy is set; nothing downstream needs its own reduced-motion check.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
