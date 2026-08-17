"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, easing } from "@/lib/motion/tokens";
import { GameTopupsIllustration } from "./GameTopupsIllustration";
import { SubscriptionsIllustration } from "./SubscriptionsIllustration";
import { GiftCardsIllustration } from "./GiftCardsIllustration";

const slides = [GameTopupsIllustration, SubscriptionsIllustration, GiftCardsIllustration];
const SLIDE_DURATION_MS = 4200;

/** Cycles the hero's illustration between the three real catalog categories
 * (game top-ups / subscriptions / gift cards) instead of a single static
 * image. Auto-advance is skipped entirely for prefers-reduced-motion users —
 * they get the first slide, static, rather than content that keeps changing
 * on its own. */
export function HeroIllustrationCarousel({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setIndex((prev) => (prev + 1) % slides.length), SLIDE_DURATION_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const Slide = slides[index]!;

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: duration.medium, ease: easing }}
        >
          <Slide />
        </motion.div>
      </AnimatePresence>
      <div className="mt-2 flex items-center justify-center gap-1.5" role="tablist" aria-hidden="true">
        {slides.map((_, dotIndex) => (
          <span
            key={dotIndex}
            className={`h-1.5 rounded-full transition-all ${dotIndex === index ? "w-5 bg-brand-secondary" : "w-1.5 bg-[var(--color-border)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
