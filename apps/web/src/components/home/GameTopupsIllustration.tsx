"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Coin, Sparkle, pulseLoop } from "./illustrationMotion";

/**
 * Original SVG illustration (angled controller + glowing diagonal bolt +
 * floating coins + sparkles) — nothing here is a stock photo or copy of any
 * real asset, so it's fully ownable. All loops are gentle, low-amplitude,
 * and automatically paused for everyone under MotionConfig
 * reducedMotion="user".
 */
export function GameTopupsIllustration({ className }: { className?: string }) {
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

        <Sparkle x={60} y={70} size={7} delay={0} />
        <Sparkle x={340} y={160} size={5} delay={0.7} />
        <Sparkle x={300} y={40} size={6} delay={1.4} />
        <Sparkle x={40} y={310} size={5} delay={1.0} />

        <Coin cx={70} cy={230} r={28} uid={uid} delay={0.4} distance={12} />
        <Coin cx={330} cy={90} r={19} uid={uid} delay={1.2} distance={8} />
        <Coin cx={336} cy={250} r={15} uid={uid} delay={0.8} distance={9} />

        {/* Controller, angled for dynamism */}
        <g transform="rotate(-15 195 190)">
          <ellipse cx="195" cy="270" rx="120" ry="18" fill="#000" opacity="0.3" filter={`url(#${uid}-blur)`} />
          <path
            d="M120 150c0-22 18-38 42-38h76c24 0 42 16 42 38v10c26 4 44 26 44 54 0 28-20 50-44 50-14 0-22-8-30-20l-6-10a20 20 0 0 0-17-9h-54a20 20 0 0 0-17 9l-6 10c-8 12-16 20-30 20-24 0-44-22-44-50 0-28 18-50 44-54v-10Z"
            fill={`url(#${uid}-pad)`}
          />
          <path
            d="M124 158c2-20 18-34 38-34h76"
            fill="none"
            stroke="var(--color-brand-secondary)"
            strokeOpacity="0.7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="150" cy="196" r="15" fill="#140a30" />
          <circle cx="150" cy="196" r="10" fill={`url(#${uid}-stick)`} />
          <circle cx="150" cy="196" r="10" fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="203" cy="210" r="13" fill="#140a30" />
          <circle cx="203" cy="210" r="8" fill={`url(#${uid}-stick)`} />
          <circle cx="258" cy="182" r="8" fill="var(--color-brand-accent)" />
          <circle cx="280" cy="200" r="8" fill="#fff" fillOpacity="0.4" />
          <circle cx="258" cy="218" r="8" fill="#fff" fillOpacity="0.25" />
          <circle cx="236" cy="200" r="8" fill="#fff" fillOpacity="0.25" />
          <rect x="125" y="140" width="10" height="26" rx="2" fill="#fff" fillOpacity="0.85" />
          <rect x="114" y="151" width="32" height="10" rx="2" fill="#fff" fillOpacity="0.85" />
        </g>

        <motion.path
          d="M255 30 165 150h48l-24 92 96-124h-52l16-38Z"
          fill="var(--color-brand-secondary)"
          filter={`url(#${uid}-blur)`}
          {...pulseLoop(0, 0.5, 0.8)}
        />
        <motion.path
          d="M255 30 165 150h48l-24 92 96-124h-52l16-38Z"
          fill={`url(#${uid}-bolt)`}
          {...pulseLoop(0, 0.9, 1)}
        />
      </svg>
    </div>
  );
}
