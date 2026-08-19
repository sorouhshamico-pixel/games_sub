"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Zap, Tag, ShieldCheck, Headset, Gamepad2, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses, cn } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "@/components/motion";
import { duration, easing, spring, staggerGap } from "@/lib/motion/tokens";
import { HeroIllustrationCarousel, heroCategories } from "./HeroIllustrationCarousel";

const CATEGORY_ROTATE_MS = 4200;

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: staggerGap, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.hero * 0.6, ease: easing } },
};

// Nested inside the h1 — words cascade in quickly on their own tighter
// stagger, still triggered by the same parent "visible" state via variant
// propagation (no separate initial/animate needed here).
const titleContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};
const titleWord = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.medium, ease: easing } },
};

const featureStrip = [
  { Icon: Headset, colorClass: "bg-brand-secondary/15 text-brand-secondary", ar: { title: "دعم 24/7", sub: "نحن هنا لمساعدتك" }, en: { title: "24/7 support", sub: "We're here to help" } },
  { Icon: Tag, colorClass: "bg-brand-primary/15 text-brand-primary", ar: { title: "أفضل الأسعار", sub: "عروض وخصومات حصرية" }, en: { title: "Best prices", sub: "Exclusive offers & discounts" } },
  { Icon: ShieldCheck, colorClass: "bg-brand-primary/15 text-brand-primary", ar: { title: "أمن وموثوق", sub: "تشفير وحماية كاملة" }, en: { title: "Safe & trusted", sub: "Full encryption & protection" } },
  { Icon: Zap, colorClass: "bg-brand-accent/15 text-brand-accent", ar: { title: "تسليم فوري", sub: "خلال ثوانٍ" }, en: { title: "Instant delivery", sub: "Within seconds" } },
];

export function HomeHero({
  titlePrefix,
  titleHighlight,
  subtitle,
  ctaLabel,
}: {
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  ctaLabel: string;
}) {
  const locale = useLocale();
  const words = titlePrefix.split(" ").filter(Boolean);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Capped well within the 10-16px parallax ceiling from spec.
  const blobOneY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const blobTwoY = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const blobThreeY = useTransform(scrollYProgress, [0, 1], [0, 10]);

  // Drives both the rotating word in the headline and the illustration
  // carousel from one shared index, so "your ___ in seconds" and the
  // pictured category always agree instead of running on two timers.
  const [categoryIndex, setCategoryIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setCategoryIndex((prev) => (prev + 1) % heroCategories.length), CATEGORY_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);
  const activeCategory = heroCategories[categoryIndex]!;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12 lg:p-16"
    >
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-brand-primary/10" />

      {/* Aurora background — three blurred blobs, each drifting slowly and
          continuously (idle motion) on top of the existing scroll parallax.
          Purely decorative transform/opacity work, capped subtle amplitude,
          automatically frozen for prefers-reduced-motion via MotionProvider's
          global reducedMotion="user" config. */}
      <motion.div
        aria-hidden
        style={{ y: blobOneY }}
        animate={{ x: [0, 24, -10, 0], scale: [1, 1.08, 0.97, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        // Physical left-1/2 (not logical start-1/2) — the translateX(-50%)
        // counter-shift that centers this is a physical operation, so
        // pairing it with a logical inset flips the math in RTL and pushes
        // the blob off-screen instead of centering it.
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-primary/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: blobTwoY }}
        animate={{ x: [0, -20, 14, 0], scale: [1, 0.95, 1.06, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -bottom-32 end-0 h-80 w-80 rounded-full bg-brand-secondary/20 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: blobThreeY }}
        animate={{ x: [0, 16, -16, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="pointer-events-none absolute top-1/3 start-0 h-40 w-40 rounded-full bg-brand-accent/20 blur-3xl"
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={heroContainer}>
          <motion.h1
            variants={titleContainer}
            className="max-w-2xl text-4xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-5xl"
          >
            {words.map((word, index) => (
              <motion.span key={index} variants={titleWord} className="inline-block">
                {word}
                {index < words.length - 1 ? " " : ""}
              </motion.span>
            ))}{" "}
            {/* The rotating word — synced to the illustration carousel via
                categoryIndex, so "your ___" always names whatever category
                is pictured beside it. AnimatePresence mode="wait" avoids an
                overlap glitch between differently-sized words. */}
            <motion.span variants={titleWord} className="relative inline-block align-baseline text-brand-primary">
              <AnimatePresence mode="wait">
                <motion.span
                  key={categoryIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: duration.medium, ease: easing }}
                  className="inline-block"
                >
                  {locale === "ar" ? activeCategory.wordAr : activeCategory.wordEn}
                </motion.span>
              </AnimatePresence>
            </motion.span>{" "}
            <motion.span variants={titleWord} className="inline-block text-brand-secondary">
              {titleHighlight}
            </motion.span>{" "}
            <motion.span variants={titleWord} className="inline-block">
              <Zap aria-hidden className="inline-block h-8 w-8 -translate-y-1 fill-brand-secondary text-brand-secondary sm:h-10 sm:w-10" />
            </motion.span>
          </motion.h1>
          <motion.p variants={heroItem} className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            {subtitle}
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
            {/* Primary CTA first in DOM order so it lands on the reading-start
                side (right, in RTL) to match the reference layout. */}
            <div className="relative inline-block">
              <motion.span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-xl bg-brand-primary/50 blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <Magnetic strength={0.3}>
                <motion.span
                  className="group/cta inline-block"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985, y: 0 }}
                  transition={{ type: "spring", ...spring }}
                >
                  <Link
                    href="/games"
                    className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.lg, "shadow-lg shadow-brand-primary/30")}
                  >
                    <Gamepad2 aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover/cta:-rotate-6 group-hover/cta:scale-110" />
                    {ctaLabel}
                    {locale === "ar" ? (
                      <ArrowLeft aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-x-1" />
                    ) : (
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                    )}
                  </Link>
                </motion.span>
              </Magnetic>
            </div>

            <motion.span
              className="group/cta2 inline-block"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985, y: 0 }}
              transition={{ type: "spring", ...spring }}
            >
              <Link
                href="/#limited-offers"
                className={cn(
                  buttonBaseClasses,
                  buttonSizeClasses.lg,
                  "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-brand-primary/50",
                )}
              >
                <Sparkles aria-hidden className="h-4 w-4 text-brand-accent transition-transform duration-300 group-hover/cta2:rotate-12 group-hover/cta2:scale-125" />
                {locale === "ar" ? "استكشف العروض" : "Explore offers"}
              </Link>
            </motion.span>
          </motion.div>

          {/* Always a fixed 2x2 grid — never left to flex-wrap's mercy,
              which used to leave the 4th badge dangling alone on its own
              row once 3 fit the available width. Each badge gets a faint
              glass card so the pairing reads as designed, not just text
              wrapping into two lines. */}
          <motion.div variants={heroItem} className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            {featureStrip.map(({ Icon, colorClass, ar, en }, index) => {
              const copy = locale === "ar" ? ar : en;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", ...spring }}
                  className="flex items-center gap-2.5 rounded-xl bg-[var(--color-surface-elevated)]/50 p-2.5 transition-colors hover:bg-[var(--color-surface-elevated)]/80"
                >
                  <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">{copy.title}</p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{copy.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0], transition: { opacity: { duration: duration.hero, ease: easing, delay: 0.2 }, scale: { duration: duration.hero, ease: easing, delay: 0.2 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: duration.hero } } }}
          className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none"
        >
          {/* Glowing frame sitting just behind the image, offset so it
              reads as a halo rather than a flat border. */}
          <div aria-hidden className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/30 via-brand-secondary/20 to-brand-accent/20 opacity-60 blur-2xl" />

          <HeroIllustrationCarousel activeIndex={categoryIndex} className="mx-auto w-full max-w-sm" />

          {/* Floating instant-delivery badge — idle bob independent of the
              parent's own float so the two never sync into something
              robotic. */}
          <motion.div
            aria-hidden
            animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -top-4 -end-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--color-surface)]/90 px-3 py-1.5 text-xs font-bold text-brand-accent shadow-xl shadow-black/30 backdrop-blur-md"
          >
            <Zap aria-hidden className="h-3.5 w-3.5 fill-brand-accent" />
            {locale === "ar" ? "فوري 100%" : "100% instant"}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
