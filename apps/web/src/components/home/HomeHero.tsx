"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";
import { Zap, Tag, ShieldCheck, Headset } from "lucide-react";
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses, cn } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "@/components/motion";
import { duration, easing, spring, staggerGap } from "@/lib/motion/tokens";
import { HeroIllustrationCarousel } from "./HeroIllustrationCarousel";

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
  title,
  titleHighlight,
  subtitle,
  ctaLabel,
}: {
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaLabel: string;
}) {
  const locale = useLocale();
  const words = title.split(" ").filter(Boolean);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Capped well within the 10-16px parallax ceiling from spec.
  const blobOneY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const blobTwoY = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const blobThreeY = useTransform(scrollYProgress, [0, 1], [0, 10]);

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
                  className="inline-block"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985, y: 0 }}
                  transition={{ type: "spring", ...spring }}
                >
                  <Link
                    href="/games"
                    className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.lg, "shadow-lg shadow-brand-primary/30")}
                  >
                    {ctaLabel}
                  </Link>
                </motion.span>
              </Magnetic>
            </div>

            <motion.span
              className="inline-block"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985, y: 0 }}
              transition={{ type: "spring", ...spring }}
            >
              <Link
                href="/#limited-offers"
                className={cn(buttonBaseClasses, buttonSizeClasses.lg, "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-brand-primary/50")}
              >
                {locale === "ar" ? "استكشف العروض" : "Explore offers"}
              </Link>
            </motion.span>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-center">
            {featureStrip.map(({ Icon, colorClass, ar, en }, index) => {
              const copy = locale === "ar" ? ar : en;
              return (
                <div key={index} className="flex items-center gap-2.5">
                  <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-[var(--color-text-primary)]">{copy.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{copy.sub}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: duration.hero, ease: easing, delay: 0.2 } }}
          className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none"
        >
          <HeroIllustrationCarousel className="mx-auto w-full max-w-sm" />
        </motion.div>
      </div>
    </section>
  );
}
