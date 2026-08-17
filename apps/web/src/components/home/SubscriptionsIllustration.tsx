"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Coin, Sparkle, floatLoop, pulseLoop } from "./illustrationMotion";

function Tile({
  x,
  y,
  size,
  uid,
  delay,
  children,
}: {
  x: number;
  y: number;
  size: number;
  uid: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.g {...floatLoop(delay, 6, 3.4)}>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.22} fill={`url(#${uid}-tile)`} fillOpacity="0.5" />
      <rect x={x} y={y} width={size} height={size} rx={size * 0.22} fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1.5" />
      <g transform={`translate(${x + size / 2} ${y + size / 2})`}>{children}</g>
    </motion.g>
  );
}

/** Original SVG illustration for the "subscriptions" category — a stylized
 * phone with glowing app tiles (play/audio/cloud/star/shield), standing in
 * for real streaming-service logos we can't reproduce. */
export function SubscriptionsIllustration({ className }: { className?: string }) {
  const uid = useId();

  return (
    <div className={className}>
      <svg viewBox="0 0 400 360" className="h-full w-full" role="img" aria-label="">
        <defs>
          <linearGradient id={`${uid}-phone`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#140a30" />
            <stop offset="100%" stopColor="#231156" />
          </linearGradient>
          <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" />
          </linearGradient>
          <linearGradient id={`${uid}-coin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe1a3" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="42%" cy="48%" r="60%">
            <stop offset="0%" stopColor="var(--color-brand-secondary)" stopOpacity="0.4" />
            <stop offset="55%" stopColor="var(--color-brand-secondary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="190" cy="180" r="190" fill={`url(#${uid}-glow)`} />

        <Sparkle x={330} y={70} size={6} delay={0.3} />
        <Sparkle x={60} y={100} size={5} delay={1.1} />
        <Sparkle x={70} y={300} size={6} delay={0.6} />

        <Coin cx={330} cy={280} r={20} uid={uid} delay={0.5} distance={10} />
        <Coin cx={60} cy={220} r={14} uid={uid} delay={1.3} distance={8} />

        {/* Phone */}
        <g transform="rotate(-8 150 190)">
          <rect x="90" y="70" width="120" height="230" rx="24" fill={`url(#${uid}-phone)`} />
          <rect x="90" y="70" width="120" height="230" rx="24" fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="2" />
          <rect x="104" y="88" width="92" height="150" rx="6" fill="#000" fillOpacity="0.4" />
          <motion.rect
            x="104"
            y="88"
            width="92"
            height="150"
            rx="6"
            fill="none"
            stroke="var(--color-brand-secondary)"
            strokeWidth="1"
            {...pulseLoop(0.2, 0.3, 0.7)}
          />
        </g>

        {/* App tiles */}
        <Tile x={210} y={70} size={70} uid={uid} delay={0}>
          <path d="M-8 -13 14 0 -8 13Z" fill="#fff" />
        </Tile>
        <Tile x={220} y={155} size={58} uid={uid} delay={0.6}>
          <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
            <path d="M-14 4v-8M-6 8v-16M2 2v-4M10 10v-20" />
          </g>
        </Tile>
        <Tile x={155} y={215} size={58} uid={uid} delay={1.1}>
          <path d="M-12 6c-5 0-8-4-8-8 0-5 4-8 8-8 1-5 6-9 12-9 7 0 12 5 13 11 5 1 8 5 8 9 0 5-4 9-9 9Z" fill="#fff" fillOpacity="0.85" />
        </Tile>
        <Tile x={90} y={175} size={58} uid={uid} delay={0.3}>
          <path
            d="m0 -13 3.8 8.2 9 1-6.6 6 1.8 8.8L0 6.6l-8 4.4 1.8-8.8-6.6-6 9-1Z"
            fill="var(--color-brand-accent)"
          />
        </Tile>
        <Tile x={70} y={100} size={54} uid={uid} delay={0.9}>
          <path d="M0-11c6 0 10 4 10 9v3c1 1 2 2 2 4 0 3-2 5-5 5H-7c-3 0-5-2-5-5 0-2 1-3 2-4v-3c0-5 4-9 10-9Z" fill="#fff" fillOpacity="0.9" />
          <path d="m-3 2 3 3 4-5" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Tile>
      </svg>
    </div>
  );
}
