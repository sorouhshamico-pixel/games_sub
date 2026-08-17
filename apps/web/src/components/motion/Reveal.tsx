"use client";

import { motion } from "motion/react";
import { duration, easing, reveal } from "@/lib/motion/tokens";

/**
 * Fades + rises + un-blurs an element into place the first time it scrolls
 * into view, then never re-triggers (`once: true`) — sections shouldn't
 * replay every time you scroll past them. `amount` is how much of the
 * element must be visible before it fires; kept generous (0.2) so content
 * doesn't feel like it's lagging behind the scroll.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Override the default 12px rise — e.g. a smaller value for already-small elements. */
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={y === undefined ? reveal.hidden : { ...reveal.hidden, y }}
      whileInView={reveal.visible}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: duration.medium, ease: easing, delay }}
    >
      {children}
    </motion.div>
  );
}
