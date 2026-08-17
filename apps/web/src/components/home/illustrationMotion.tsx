"use client";

import { motion } from "motion/react";

/** Shared gentle-loop helpers for the hero illustration family — kept in one
 * place so every illustration animates with the same feel instead of each
 * one hand-rolling slightly different timings. */

export const floatLoop = (delay: number, distance = 10, duration = 4) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export const twinkleLoop = (delay: number) => ({
  initial: { opacity: 0.2, scale: 0.8 },
  animate: { opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] },
  transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export const pulseLoop = (delay: number, from = 0.85, to = 1) => ({
  initial: { opacity: from },
  animate: { opacity: [from, to, from] },
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y - size}L${x + size * 0.28} ${y - size * 0.28}L${x + size} ${y}L${x + size * 0.28} ${y + size * 0.28}L${x} ${y + size}L${x - size * 0.28} ${y + size * 0.28}L${x - size} ${y}L${x - size * 0.28} ${y - size * 0.28}Z`}
      fill="#fff"
      {...twinkleLoop(delay)}
    />
  );
}

export function Coin({
  cx,
  cy,
  r,
  uid,
  delay,
  distance,
}: {
  cx: number;
  cy: number;
  r: number;
  uid: string;
  delay: number;
  distance: number;
}) {
  return (
    <motion.g {...floatLoop(delay, distance)}>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-coin)`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth={r > 20 ? 2 : 1.5} />
      <path
        d={`M${cx - r * 0.25} ${cy - r * 0.6}c${r * 0.3}-${r * 0.5} ${r * 0.75}-${r * 0.3} ${r * 0.75} ${r * 0.15}`}
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth={r > 20 ? 3 : 2}
        strokeLinecap="round"
        fill="none"
      />
    </motion.g>
  );
}
