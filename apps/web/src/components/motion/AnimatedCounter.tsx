"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { duration, easing } from "@/lib/motion/tokens";

/**
 * Counts up from 0 to `value` once, the first time it scrolls into view.
 * Server and first client render both show 0 (no hydration mismatch risk);
 * the count-up (or, under reduced motion, an instant jump to the final
 * value) only happens client-side after mount.
 */
export function AnimatedCounter({
  value,
  className,
  formatter,
}: {
  value: number;
  className?: string;
  formatter?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: duration.slow,
      ease: easing,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {formatter ? formatter(display) : display}
    </span>
  );
}
