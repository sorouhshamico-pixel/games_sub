"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import { motion } from "motion/react";
import type { Locale } from "@gcc-store/i18n";
import { duration, easing } from "@/lib/motion/tokens";

// Shared by HeroIllustrationCarousel and the headline's rotating word in
// HomeHero — same three real catalog categories, one index driving both,
// so the image and the word in "Charge up your ___ in seconds" always
// agree with each other instead of running on two independent timers.
export const heroCategories: Array<{ src: string; ar: string; en: string; wordAr: string; wordEn: string }> = [
  { src: "/images/hero/game-top-up-illustration.png", ar: "شحن الألعاب فوريًا", en: "Instant game top-ups", wordAr: "ألعابك", wordEn: "games" },
  { src: "/images/hero/digital-subscriptions-illustration.png", ar: "الاشتراكات الرقمية", en: "Digital subscriptions", wordAr: "اشتراكاتك", wordEn: "subscriptions" },
  { src: "/images/hero/gift-cards-illustration.png", ar: "بطاقات الهدايا", en: "Gift cards", wordAr: "بطاقاتك", wordEn: "gift cards" },
];

/** Crossfades between the three real catalog categories, driven by the
 * `activeIndex` HomeHero owns (kept in sync with the headline's rotating
 * word). All slides stay mounted and crossfade via opacity — rather than
 * mounting/unmounting per slide — so switching never shows a blank/loading
 * flash once the images have loaded. */
export function HeroIllustrationCarousel({ activeIndex, className }: { activeIndex: number; className?: string }) {
  const locale = useLocale() as Locale;

  return (
    <div className={className}>
      <div className="relative aspect-[1373/1146] overflow-hidden rounded-2xl">
        {heroCategories.map((slide, slideIndex) => (
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: slideIndex === activeIndex ? 1 : 0, scale: slideIndex === activeIndex ? 1 : 1.04 }}
            transition={{ duration: duration.medium, ease: easing }}
            aria-hidden={slideIndex !== activeIndex}
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

        {/* Category label riding on the image itself — reinforces which
            of the three catalog categories is currently showing. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
          <motion.p
            key={activeIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.fast, ease: easing }}
            className="text-sm font-semibold text-white"
          >
            {locale === "ar" ? heroCategories[activeIndex]!.ar : heroCategories[activeIndex]!.en}
          </motion.p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-hidden="true">
        {heroCategories.map((_, dotIndex) => (
          <span
            key={dotIndex}
            className={`h-1.5 rounded-full transition-all ${dotIndex === activeIndex ? "w-5 bg-brand-secondary" : "w-1.5 bg-[var(--color-border)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
