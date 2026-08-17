"use client";

import { motion } from "motion/react";
import { duration, easing } from "@/lib/motion/tokens";

/** Circle + checkmark draw in via animated `pathLength`, not a raster/icon swap. */
export function SuccessCheck({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <motion.svg viewBox="0 0 52 52" width={size} height={size} className={className} initial="hidden" animate="visible">
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="3"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: duration.medium, ease: easing }}
      />
      <motion.path
        d="M14 27l7 7 17-17"
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
        transition={{ duration: duration.normal, ease: easing, delay: duration.medium - 0.05 }}
      />
    </motion.svg>
  );
}
