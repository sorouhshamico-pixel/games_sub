"use client";

import { motion } from "motion/react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring } from "@/lib/motion/tokens";
import { GamepadIcon, WalletIcon, ShieldIcon, BoltIcon } from "./icons";
import type { Locale } from "@gcc-store/i18n";

const steps: Array<{ Icon: typeof GamepadIcon; ar: string; en: string; color: string; glow: string }> = [
  { Icon: GamepadIcon, ar: "اختر المنتج أو الفئة", en: "Pick a product or category", color: "text-brand-primary", glow: "from-brand-primary/70 to-brand-primary/10" },
  { Icon: WalletIcon, ar: "أدخل بيانات حسابك", en: "Enter your account details", color: "text-brand-secondary", glow: "from-brand-secondary/70 to-brand-secondary/10" },
  { Icon: ShieldIcon, ar: "ادفع بأمان", en: "Pay securely", color: "text-brand-accent", glow: "from-brand-accent/70 to-brand-accent/10" },
  { Icon: BoltIcon, ar: "استلم رصيدك فورًا", en: "Get your top-up instantly", color: "text-brand-primary", glow: "from-brand-secondary/70 via-brand-primary/40 to-brand-accent/70" },
];

// Hexagonal badge instead of a plain rounded square — distinctive enough
// to not read as "just another rounded icon tile" grid.
const hexClip = "[clip-path:polygon(25%_2%,75%_2%,100%_50%,75%_98%,25%_98%,0%_50%)]";

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

        <StaggerContainer className="relative grid gap-10 sm:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <div className="relative flex flex-col items-center gap-4 text-center">
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", ...spring }}
                  className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center"
                >
                  {/* Slowly orbiting gradient ring — a halo rather than a
                      static outline, continuous and independent per step. */}
                  <motion.span
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "linear" }}
                    className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${step.glow} opacity-70 blur-[3px]`}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[var(--color-surface)]"
                  />

                  {/* The hexagon itself, with a step-colored fill and a
                      glassy inner highlight. */}
                  <span className={`relative flex h-14 w-14 items-center justify-center bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)] ${hexClip}`}>
                    <span aria-hidden className={`absolute inset-0 bg-gradient-to-br opacity-20 ${step.glow} ${hexClip}`} />
                    <step.Icon className={`relative h-6 w-6 ${step.color}`} />
                  </span>

                  {/* Step number as an integrated corner tag instead of a
                      loosely-overlapping circle. */}
                  <span
                    aria-hidden
                    className={`absolute -top-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-md ${step.glow}`}
                  >
                    {index + 1}
                  </span>
                </motion.span>

                <p className="text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? step.ar : step.en}</p>

                {/* A short directional cue instead of one long connecting
                    line across the whole row — only between steps, and
                    only where there's a next step to point to. */}
                {index < steps.length - 1 ? (
                  <motion.span
                    aria-hidden
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                    className="absolute -end-6 top-8 hidden text-brand-secondary rtl:-scale-x-100 sm:block"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                    </svg>
                  </motion.span>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </Reveal>
  );
}
