"use client";

import { useId } from "react";
import { motion } from "motion/react";

const coinFloat = (delay: number, distance = 10) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay },
});

const sparkleTwinkle = (delay: number) => ({
  initial: { opacity: 0.2, scale: 0.8 },
  animate: { opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] },
  transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const, delay },
});

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y - size}L${x + size * 0.28} ${y - size * 0.28}L${x + size} ${y}L${x + size * 0.28} ${y + size * 0.28}L${x} ${y + size}L${x - size * 0.28} ${y + size * 0.28}L${x - size} ${y}L${x - size * 0.28} ${y - size * 0.28}Z`}
      fill="#fff"
      {...sparkleTwinkle(delay)}
    />
  );
}

/**
 * Original SVG illustration (angled controller + glowing diagonal bolt +
 * floating coins + sparkles) standing in for the reference screenshot's 3D
 * render — nothing here is a stock photo or copy of any real asset, so
 * it's fully ownable. All loops are gentle, low-amplitude, and automatically
 * paused for everyone under MotionConfig reducedMotion="user".
 */
export function HeroIllustration({ className }: { className?: string }) {
  const uid = useId();

  return (
    <div className={className}>
      <svg viewBox="0 0 400 360" className="h-full w-full" role="img" aria-label="">
        <defs>
          <linearGradient id={`${uid}-pad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a1a5e" />
            <stop offset="55%" stopColor="var(--color-brand-primary)" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" />
          </linearGradient>
          <linearGradient id={`${uid}-coin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe1a3" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" />
          </linearGradient>
          <linearGradient id={`${uid}-bolt`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="42%" cy="48%" r="60%">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.45" />
            <stop offset="55%" stopColor="var(--color-brand-primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-stick`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-blur`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <circle cx="180" cy="180" r="190" fill={`url(#${uid}-glow)`} />

        {/* Sparkle particles */}
        <Sparkle x={60} y={70} size={7} delay={0} />
        <Sparkle x={340} y={160} size={5} delay={0.7} />
        <Sparkle x={300} y={40} size={6} delay={1.4} />
        <Sparkle x={40} y={310} size={5} delay={1.0} />

        {/* Coins */}
        <motion.g {...coinFloat(0.4, 12)}>
          <ellipse cx="72" cy="234" rx="30" ry="29" fill="#000" opacity="0.25" transform="translate(4 8)" />
          <circle cx="70" cy="230" r="28" fill={`url(#${uid}-coin)`} />
          <circle cx="70" cy="230" r="28" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
          <path d="M63 213c8-14 22-8 22 4" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M70 217v26m-9-19 18 13m0-13-18 13" stroke="#7a4a00" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        <motion.g {...coinFloat(1.2, 8)}>
          <circle cx="330" cy="90" r="19" fill={`url(#${uid}-coin)`} />
          <circle cx="330" cy="90" r="19" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M323 82c5-8 13-5 13 2" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />
        </motion.g>
        <motion.g {...coinFloat(0.8, 9)}>
          <circle cx="336" cy="250" r="15" fill={`url(#${uid}-coin)`} />
          <circle cx="336" cy="250" r="15" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
        </motion.g>

        {/* Controller, angled for dynamism */}
        <g transform="rotate(-15 195 190)">
          <ellipse cx="195" cy="270" rx="120" ry="18" fill="#000" opacity="0.3" filter={`url(#${uid}-blur)`} />
          <path
            d="M120 150c0-22 18-38 42-38h76c24 0 42 16 42 38v10c26 4 44 26 44 54 0 28-20 50-44 50-14 0-22-8-30-20l-6-10a20 20 0 0 0-17-9h-54a20 20 0 0 0-17 9l-6 10c-8 12-16 20-30 20-24 0-44-22-44-50 0-28 18-50 44-54v-10Z"
            fill={`url(#${uid}-pad)`}
          />
          {/* rim light along the top-left edge */}
          <path
            d="M124 158c2-20 18-34 38-34h76"
            fill="none"
            stroke="var(--color-brand-secondary)"
            strokeOpacity="0.7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* joysticks */}
          <circle cx="150" cy="196" r="15" fill="#140a30" />
          <circle cx="150" cy="196" r="10" fill={`url(#${uid}-stick)`} />
          <circle cx="150" cy="196" r="10" fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="203" cy="210" r="13" fill="#140a30" />
          <circle cx="203" cy="210" r="8" fill={`url(#${uid}-stick)`} />
          {/* face buttons */}
          <circle cx="258" cy="182" r="8" fill="var(--color-brand-accent)" />
          <circle cx="280" cy="200" r="8" fill="#fff" fillOpacity="0.4" />
          <circle cx="258" cy="218" r="8" fill="#fff" fillOpacity="0.25" />
          <circle cx="236" cy="200" r="8" fill="#fff" fillOpacity="0.25" />
          {/* d-pad */}
          <rect x="125" y="140" width="10" height="26" rx="2" fill="#fff" fillOpacity="0.85" />
          <rect x="114" y="151" width="32" height="10" rx="2" fill="#fff" fillOpacity="0.85" />
        </g>

        {/* Diagonal glowing bolt cutting across the controller */}
        <motion.path
          d="M255 30 165 150h48l-24 92 96-124h-52l16-38Z"
          fill="var(--color-brand-secondary)"
          filter={`url(#${uid}-blur)`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M255 30 165 150h48l-24 92 96-124h-52l16-38Z"
          fill={`url(#${uid}-bolt)`}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
