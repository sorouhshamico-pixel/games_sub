"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Coin, Sparkle, floatLoop } from "./illustrationMotion";

function Card({
  x,
  y,
  rotate,
  uid,
  delay,
  children,
}: {
  x: number;
  y: number;
  rotate: number;
  uid: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.g transform={`translate(${x} ${y}) rotate(${rotate})`} {...floatLoop(delay, 8, 3.8)}>
      <rect x={-38} y={-52} width={76} height={104} rx={12} fill={`url(#${uid}-card)`} fillOpacity="0.55" />
      <rect x={-38} y={-52} width={76} height={104} rx={12} fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1.5" />
      {children}
    </motion.g>
  );
}

/** Original SVG illustration for the "gift cards" category — glowing cards
 * plus a ribboned gift box, standing in for the reference's photographic
 * gift-box render. */
export function GiftCardsIllustration({ className }: { className?: string }) {
  const uid = useId();

  return (
    <div className={className}>
      <svg viewBox="0 0 400 360" className="h-full w-full" role="img" aria-label="">
        <defs>
          <linearGradient id={`${uid}-card`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" />
            <stop offset="100%" stopColor="var(--color-brand-secondary)" />
          </linearGradient>
          <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a1a5e" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" />
          </linearGradient>
          <linearGradient id={`${uid}-coin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe1a3" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" />
          </linearGradient>
          <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffe1a3" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="42%" cy="48%" r="60%">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.4" />
            <stop offset="55%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="180" cy="190" r="190" fill={`url(#${uid}-glow)`} />

        <Sparkle x={330} y={80} size={6} delay={0.2} />
        <Sparkle x={60} y={90} size={5} delay={1.0} />
        <Sparkle x={330} y={280} size={6} delay={0.6} />

        <Coin cx={60} cy={230} r={16} uid={uid} delay={0.3} distance={9} />
        <Coin cx={320} cy={140} r={13} uid={uid} delay={1.1} distance={7} />
        <Coin cx={100} cy={300} r={11} uid={uid} delay={0.7} distance={8} />

        {/* Fanned cards */}
        <Card x={130} y={140} rotate={-16} uid={uid} delay={0.1}>
          <path d="M-14 -10c0-8 6-14 14-14s14 6 14 14v6H-14Z" fill="#fff" fillOpacity="0.9" />
          <rect x="-16" y="-2" width="32" height="18" rx="3" fill="var(--color-brand-accent)" />
          <path d="M-16 -2h32" stroke="#2a1a5e" strokeWidth="2" />
        </Card>
        <Card x={200} y={130} rotate={2} uid={uid} delay={0.6}>
          <rect x="-15" y="-14" width="30" height="22" rx="3" fill="none" stroke="#fff" strokeWidth="2.5" />
          <path d="M-15 -6h30" stroke="#fff" strokeWidth="2" />
          <rect x="-10" y="2" width="12" height="6" rx="1.5" fill="#fff" />
        </Card>
        <Card x={266} y={148} rotate={17} uid={uid} delay={1.0}>
          <path d="M0 -16 -9 4h7l-3 12 14-18h-7Z" fill="var(--color-brand-secondary)" />
        </Card>

        {/* Gift box */}
        <g transform="translate(198 250)">
          <rect x="-46" y="-6" width="92" height="70" rx="6" fill={`url(#${uid}-box)`} />
          <rect x="-46" y="-6" width="92" height="70" rx="6" fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1.5" />
          <rect x="-52" y="-22" width="104" height="20" rx="5" fill={`url(#${uid}-ribbon)`} />
          <rect x="-9" y="-22" width="18" height="86" fill={`url(#${uid}-ribbon)`} />
          <path
            d="M-9 -22c-14-4-24-16-16-26 6-8 20-4 16 8 4-12 18-16 24-8 8 10-2 22-16 26"
            fill="none"
            stroke="var(--color-brand-accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
