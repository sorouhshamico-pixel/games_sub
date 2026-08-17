"use client";

import { useId } from "react";
import { motion } from "motion/react";

const coinFloat = (delay: number) => ({
  animate: { y: [0, -10, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay },
});

/**
 * Original SVG illustration (controller + floating coins + bolt) standing
 * in for the reference screenshot's 3D render — nothing here is a stock
 * photo or a copy of any real asset, so it's fully ownable. The gentle
 * float loops are capped, low-amplitude, and automatically paused for
 * everyone under MotionConfig reducedMotion="user" (see MotionProvider).
 */
export function HeroIllustration({ className }: { className?: string }) {
  const gradientId = useId();
  const glowId = useId();

  return (
    <div className={className}>
      <svg viewBox="0 0 400 360" className="h-full w-full" role="img" aria-label="">
        <defs>
          <linearGradient id={`${gradientId}-pad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" />
          </linearGradient>
          <linearGradient id={`${gradientId}-coin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="170" r="170" fill={`url(#${glowId})`} />

        <motion.g {...coinFloat(0.4)}>
          <circle cx="70" cy="230" r="26" fill={`url(#${gradientId}-coin)`} />
          <circle cx="70" cy="230" r="26" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
          <path d="M70 218v24m-8-18 16 12m0-12-16 12" stroke="#7a4a00" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        <motion.g {...coinFloat(1.2)}>
          <circle cx="330" cy="90" r="18" fill={`url(#${gradientId}-coin)`} />
          <circle cx="330" cy="90" r="18" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
        </motion.g>
        <motion.g {...coinFloat(0.8)}>
          <circle cx="335" cy="250" r="14" fill={`url(#${gradientId}-coin)`} />
        </motion.g>

        {/* Controller body */}
        <g>
          <path
            d="M120 150c0-22 18-38 42-38h76c24 0 42 16 42 38v10c26 4 44 26 44 54 0 28-20 50-44 50-14 0-22-8-30-20l-6-10a20 20 0 0 0-17-9h-54a20 20 0 0 0-17 9l-6 10c-8 12-16 20-30 20-24 0-44-22-44-50 0-28 18-50 44-54v-10Z"
            fill={`url(#${gradientId}-pad)`}
          />
          <circle cx="150" cy="196" r="7" fill="#fff" fillOpacity="0.9" />
          <circle cx="176" cy="196" r="7" fill="#fff" fillOpacity="0.55" />
          <circle cx="250" cy="188" r="8" fill="var(--color-brand-accent)" />
          <circle cx="272" cy="206" r="8" fill="#fff" fillOpacity="0.35" />
          {/* d-pad */}
          <rect x="140" y="150" width="10" height="26" rx="2" fill="#fff" fillOpacity="0.85" />
          <rect x="129" y="161" width="32" height="10" rx="2" fill="#fff" fillOpacity="0.85" />
        </g>

        {/* Bolt accent */}
        <motion.path
          d="M215 60 175 118h30l-10 46 46-62h-30l10-42Z"
          fill="var(--color-brand-accent)"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
