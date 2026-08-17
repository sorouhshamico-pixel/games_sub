"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses, cn } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { duration, easing, spring, staggerGap } from "@/lib/motion/tokens";

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: staggerGap, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.hero * 0.6, ease: easing } },
};

export function HomeHero({
  title,
  subtitle,
  ctaLabel,
  trustItems,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  trustItems: Array<{ icon: React.ReactNode; label: string }>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Capped well within the 10-16px parallax ceiling from spec.
  const blobOneY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const blobTwoY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-16"
    >
      <img
        src="https://images.unsplash.com/photo-1756694938594-e760b4bd3bfb?q=75&w=1600&auto=format&fit=crop"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div aria-hidden className="absolute inset-0 bg-[var(--color-surface)]/70" />
      <motion.div
        aria-hidden
        style={{ y: blobOneY }}
        className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-primary/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: blobTwoY }}
        className="pointer-events-none absolute -bottom-32 end-0 h-80 w-80 rounded-full bg-brand-secondary/20 blur-3xl"
      />

      <motion.div className="relative" initial="hidden" animate="visible" variants={heroContainer}>
        <motion.h1 variants={heroItem} className="max-w-2xl text-4xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-5xl">
          {title}
        </motion.h1>
        <motion.p variants={heroItem} className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          {subtitle}
        </motion.p>

        <motion.div variants={heroItem} className="relative mt-8 inline-block">
          <motion.span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-xl bg-brand-primary/50 blur-xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* A motion.span wrapper (not a motion.button) drives the hover/press
              feel here — Link already renders an <a>, and nesting a <button>
              inside it would be invalid HTML. */}
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
        </motion.div>

        <motion.div variants={heroItem} className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="text-brand-accent">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
