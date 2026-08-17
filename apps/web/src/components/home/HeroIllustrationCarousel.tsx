"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { Locale } from "@gcc-store/i18n";
import { duration, easing } from "@/lib/motion/tokens";

const slides: Array<{ src: string; ar: string; en: string }> = [
  { src: "/images/hero/game-top-up-illustration.png", ar: "شحن الألعاب فوريًا", en: "Instant game top-ups" },
  { src: "/images/hero/digital-subscriptions-illustration.png", ar: "الاشتراكات الرقمية", en: "Digital subscriptions" },
  { src: "/images/hero/gift-cards-illustration.png", ar: "بطاقات الهدايا", en: "Gift cards" },
];
const SLIDE_DURATION_MS = 4200;

/** Cycles the hero's illustration between the three real catalog categories
 * (game top-ups / subscriptions / gift cards) instead of a single static
 * image. All three stay mounted and crossfade via opacity — rather than
 * mounting/unmounting per slide — so switching never shows a blank/loading
 * flash once the images have loaded. Auto-advance is skipped entirely for
 * prefers-reduced-motion users; they get the first slide, static. */
export function HeroIllustrationCarousel({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setIndex((prev) => (prev + 1) % slides.length), SLIDE_DURATION_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className={className}>
      <div className="relative aspect-[1373/1146] overflow-hidden rounded-2xl">
        {slides.map((slide, slideIndex) => (
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: slideIndex === index ? 1 : 0 }}
            transition={{ duration: duration.medium, ease: easing }}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.src}
              alt={locale === "ar" ? slide.ar : slide.en}
              fill
              sizes="(min-width: 1024px) 480px, 384px"
              className="object-cover"
              priority={slideIndex === 0}
            />
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-hidden="true">
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
