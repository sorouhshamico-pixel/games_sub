"use client";

import { motion } from "motion/react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { easing, spring } from "@/lib/motion/tokens";
import { GamepadIcon, WalletIcon, ShieldIcon, BoltIcon } from "./icons";
import type { Locale } from "@gcc-store/i18n";

const steps: Array<{ Icon: typeof GamepadIcon; ar: string; en: string }> = [
  { Icon: GamepadIcon, ar: "اختر المنتج أو الفئة", en: "Pick a product or category" },
  { Icon: WalletIcon, ar: "أدخل بيانات حسابك", en: "Enter your account details" },
  { Icon: ShieldIcon, ar: "ادفع بأمان", en: "Pay securely" },
  { Icon: BoltIcon, ar: "استلم رصيدك فورًا", en: "Get your top-up instantly" },
];

export function ProcessSteps({ locale }: { locale: Locale }) {
  return (
    <Reveal>
      <section
        aria-label={locale === "ar" ? "كيف تشحن" : "How it works"}
        className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-6 sm:p-10"
      >
        <h2 className="mb-10 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
          {locale === "ar" ? "كيف تشحن في 4 خطوات بسيطة" : "How to top up in 4 simple steps"}
        </h2>

        <div className="relative">
          {/* Connecting flow line across the row — only meaningful once
              the 4 steps actually sit in one row (sm+). Transform-only
              scaleX draw-in, no layout properties involved. */}
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1, ease: easing }}
            className="absolute top-8 start-[12.5%] end-[12.5%] hidden h-0.5 origin-left bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent sm:block"
          />

          <StaggerContainer className="relative grid gap-8 sm:grid-cols-4">
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-md shadow-brand-primary/40">
                    {index + 1}
                  </span>

                  <motion.span
                    whileHover={{ scale: 1.12, rotate: -6 }}
                    transition={{ type: "spring", ...spring }}
                    className="relative flex h-16 w-16 items-center justify-center"
                  >
                    {/* Cascading pulse ring — a wave of energy that visits
                        each step in sequence, forever. Opacity/scale only. */}
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 1.18, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.45 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/40 to-brand-secondary/40 blur-md"
                    />
                    <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 text-brand-primary">
                      <step.Icon className="h-7 w-7" />
                    </span>
                  </motion.span>

                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? step.ar : step.en}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </Reveal>
  );
}
