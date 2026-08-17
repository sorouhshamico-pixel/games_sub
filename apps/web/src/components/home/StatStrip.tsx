"use client";

import { Shield, Smile, Gamepad2, Gauge, Headset } from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

const stats: Array<{
  Icon: typeof Shield;
  colorClass: string;
  value: number;
  formatter: (n: number) => string;
  ar: string;
  en: string;
}> = [
  {
    Icon: Shield,
    colorClass: "bg-brand-primary/15 text-brand-primary",
    value: 3_000_000,
    formatter: (n) => `+${Math.round(n / 1_000_000)}M`,
    ar: "عملية شحن ناجحة",
    en: "Successful top-ups",
  },
  {
    Icon: Smile,
    colorClass: "bg-brand-secondary/15 text-brand-secondary",
    value: 1_000_000,
    formatter: (n) => `+${Math.round(n / 1_000_000)}M`,
    ar: "عميل سعيد",
    en: "Happy customers",
  },
  {
    Icon: Gamepad2,
    colorClass: "bg-brand-primary/15 text-brand-primary",
    value: 200,
    formatter: (n) => `+${n}`,
    ar: "لعبة وخدمة",
    en: "Games & services",
  },
  {
    Icon: Gauge,
    colorClass: "bg-brand-secondary/15 text-brand-secondary",
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
      <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-8">
        <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span aria-hidden className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.colorClass}`}>
                  <stat.Icon className="h-5 w-5" />
                </span>
                <AnimatedCounter value={stat.value} formatter={stat.formatter} className="text-2xl font-extrabold text-[var(--color-text-primary)]" />
                <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? stat.ar : stat.en}</p>
              </div>
            </StaggerItem>
          ))}
          <StaggerItem>
            <div className="flex flex-col items-center gap-2 text-center">
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                <Headset className="h-5 w-5" />
              </span>
              <p className="text-2xl font-extrabold text-[var(--color-text-primary)]">24/7</p>
              <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "دعم فني متواصل" : "Continuous support"}</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? "بيانات تجريبية لأغراض العرض فقط وليست أسعارًا فعلية" : "Demo data for display purposes only, not real prices"}
        </p>
      </section>
    </Reveal>
  );
}
