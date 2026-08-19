"use client";

import { motion } from "motion/react";
import { Shield, Smile, Gamepad2, Gauge, Headset } from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";
import type { Locale } from "@gcc-store/i18n";

const stats: Array<{
  Icon: typeof Shield;
  colorClass: string;
  glow: string;
  value: number;
  formatter: (n: number) => string;
  ar: string;
  en: string;
}> = [
  {
    Icon: Shield,
    colorClass: "bg-brand-primary/15 text-brand-primary",
    glow: "bg-brand-primary/40",
    value: 3_000_000,
    formatter: (n) => `+${Math.round(n / 1_000_000)}M`,
    ar: "عملية شحن ناجحة",
    en: "Successful top-ups",
  },
  {
    Icon: Smile,
    colorClass: "bg-brand-secondary/15 text-brand-secondary",
    glow: "bg-brand-secondary/40",
    value: 1_000_000,
    formatter: (n) => `+${Math.round(n / 1_000_000)}M`,
    ar: "عميل سعيد",
    en: "Happy customers",
  },
  {
    Icon: Gamepad2,
    colorClass: "bg-brand-accent/15 text-brand-accent",
    glow: "bg-brand-accent/40",
    value: 200,
    formatter: (n) => `+${n}`,
    ar: "لعبة وخدمة",
    en: "Games & services",
  },
  {
    Icon: Gauge,
    colorClass: "bg-brand-secondary/15 text-brand-secondary",
    glow: "bg-brand-secondary/40",
    value: 999,
    formatter: (n) => `${(n / 10).toFixed(1)}%`,
    ar: "وقت تشغيل الخدمة",
    en: "Service uptime",
  },
];

/**
 * Investor-demo trust-stats row — mirrors the reference's "+3M / +1M / +200
 * / 99.9% / 24/7" strip. None of this is backed by real usage data (this is
 * a pre-launch demo storefront), so it's clearly labeled illustrative,
 * matching every other fabricated-content section on this page.
 */
export function StatStrip({ locale }: { locale: Locale }) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-8">
        {/* Ambient glow, same drifting-aurora language as the rest of the
            page, contained so it never fights the numbers for attention. */}
        <motion.div
          aria-hidden
          animate={{ x: [0, 20, -14, 0], y: [0, -10, 8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 start-1/4 -z-10 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -18, 12, 0], y: [0, 12, -8, 0] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="pointer-events-none absolute -bottom-16 end-1/4 -z-10 h-56 w-56 rounded-full bg-brand-secondary/15 blur-3xl"
        />

        <StaggerContainer className="relative grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-5 sm:divide-x sm:divide-[var(--color-border)]/60">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", ...spring }}
                className="flex flex-col items-center gap-2.5 text-center sm:px-3"
              >
                <span aria-hidden className="relative flex h-12 w-12 items-center justify-center">
                  <motion.span
                    aria-hidden
                    animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                    className={`absolute inset-0 rounded-2xl blur-md ${stat.glow}`}
                  />
                  <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${stat.colorClass}`}>
                    <stat.Icon className="h-5 w-5" />
                  </span>
                </span>
                <AnimatedCounter
                  value={stat.value}
                  formatter={stat.formatter}
                  className="bg-gradient-to-br from-[var(--color-text-primary)] to-[var(--color-text-primary)]/70 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl"
                />
                <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? stat.ar : stat.en}</p>
              </motion.div>
            </StaggerItem>
          ))}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", ...spring }}
              className="flex flex-col items-center gap-2.5 text-center sm:px-3"
            >
              <span aria-hidden className="relative flex h-12 w-12 items-center justify-center">
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 4 * 0.3 }}
                  className="absolute inset-0 rounded-2xl bg-brand-primary/40 blur-md"
                />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                  <Headset className="h-5 w-5" />
                </span>
              </span>
              <p className="bg-gradient-to-br from-[var(--color-text-primary)] to-[var(--color-text-primary)]/70 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                24/7
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "دعم فني متواصل" : "Continuous support"}</p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        <p className="relative mt-6 text-center text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-elevated)]/60 px-3 py-1">
            {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط وليست أسعارًا فعلية" : "Demo data for display purposes only, not real prices"}
          </span>
        </p>
      </section>
    </Reveal>
  );
}
