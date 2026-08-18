"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";
import { spring } from "@/lib/motion/tokens";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Site-wide floating back-to-top button — fixed bottom-left (physical,
 * matching explicit direction, not the RTL-logical "start" side), with a
 * circular progress ring tracing real scroll position rather than a
 * decorative spinner. Appears only once there's meaningfully something to
 * scroll back up from. Sits above BottomNav on mobile (bottom-20 clears
 * its ~64px height; bottom-6 once BottomNav is hidden at md+).
 */
export function FloatingBackToTop() {
  const locale = useLocale();
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => setVisible(value > 0.08));
  const dashOffset = useTransform(scrollYProgress, [0, 1], [CIRCUMFERENCE, 0]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", ...spring }}
          aria-label={locale === "ar" ? "العودة للأعلى" : "Back to top"}
          className="fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 shadow-lg shadow-black/20 backdrop-blur-lg md:bottom-6 md:left-6"
        >
          <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              stroke="url(#back-to-top-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
            <defs>
              <linearGradient id="back-to-top-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-primary)" />
                <stop offset="100%" stopColor="var(--color-brand-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowUp className="relative h-5 w-5 text-brand-primary" aria-hidden />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
