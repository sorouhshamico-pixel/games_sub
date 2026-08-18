"use client";

import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { ShahnooIcon, cn } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { spring } from "@/lib/motion/tokens";

const sizes = {
  header: { icon: "h-11 w-11 sm:h-12 sm:w-12", name: "text-xl sm:text-2xl", sub: "text-[10px] tracking-[0.25em]", glow: "-inset-2" },
  footer: { icon: "h-9 w-9", name: "text-lg", sub: "text-[9px] tracking-[0.2em]", glow: "-inset-1.5" },
} as const;

/**
 * Shared brand lockup for the header and footer — a single source of truth
 * so both places present the mark identically instead of drifting (the
 * header previously ran a larger version, the footer a smaller ad-hoc one).
 * The icon shape itself (ShahnooIcon) is untouched; this only elevates how
 * it's *presented*: bigger, a soft breathing glow halo behind it, a
 * playful spring wiggle on hover, and a gradient-filled wordmark.
 */
export function BrandLockup({ variant = "header" }: { variant?: "header" | "footer" }) {
  const locale = useLocale();
  const size = sizes[variant];

  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <span className="relative inline-flex items-center justify-center">
        <motion.span
          aria-hidden
          className={cn("absolute rounded-2xl bg-gradient-to-br from-brand-primary/50 to-brand-secondary/50 blur-lg", size.glow)}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          whileHover={{ rotate: -8, scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", ...spring }}
          className="relative"
        >
          <ShahnooIcon className={size.icon} />
        </motion.span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-extrabold tracking-tight bg-gradient-to-br from-[var(--color-text-primary)] to-brand-secondary bg-clip-text text-transparent",
            size.name,
          )}
        >
          {locale === "ar" ? "شحنو" : "Shahnoo"}
        </span>
        {locale === "ar" ? (
          <span className={cn("font-semibold text-brand-secondary", size.sub)}>SHAHNOO</span>
        ) : null}
      </span>
    </Link>
  );
}
