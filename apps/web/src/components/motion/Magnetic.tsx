"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motion/tokens";

/**
 * Wraps interactive content (usually a button) so it subtly pulls toward
 * the cursor within a capped radius, spring-releasing back to center on
 * mouse leave. Pointer-driven only — touch devices never fire mousemove,
 * so this is inert (not broken) there, and motion/react's global
 * reducedMotion="user" config makes the spring resolve instantly rather
 * than animate for anyone who prefers reduced motion.
 */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOffset({
      x: (event.clientX - rect.left - rect.width / 2) * strength,
      y: (event.clientY - rect.top - rect.height / 2) * strength,
    });
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", ...spring }}
      className={className ?? "inline-block"}
    >
      {children}
    </motion.div>
  );
}
