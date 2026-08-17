"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Scroll-linked reading progress bar, pinned under the sticky header. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="sticky top-0 z-30 h-1 w-full origin-left bg-brand-primary"
      style={{ scaleX: progress }}
    />
  );
}
