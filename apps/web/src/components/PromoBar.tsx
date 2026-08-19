"use client";

import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { spring } from "@/lib/motion/tokens";
import { BoltIcon } from "./home/icons";

/**
 * Investor-demo top announcement strip — same "-X%" illustrative framing as
 * the homepage's LimitedOffers section, which carries the actual demo-data
 * disclaimer. Links there instead of repeating the disclaimer in this thin
 * bar, so it stays functional rather than a dead visual element.
 *
 * Deliberately borderless and gradient-only (no bottom rule) so it reads as
 * the top edge of one continuous panel with SiteHeader below it, rather than
 * a separate boxed bar sitting on top of another. The "15%" figure is its
 * own pulsing badge — the one thing in the bar meant to catch the eye first.
 */
export function PromoBar() {
  const locale = useLocale();

  const prefix = locale === "ar" ? "عرض خاص" : "Special offer";
  const badge = locale === "ar" ? "خصم 15%" : "15% OFF";
  const suffix = locale === "ar" ? "على جميع عمليات الشحن لفترة محدودة" : "all top-ups, for a limited time";

  return (
    <Link
      href="/#limited-offers"
      className="group relative flex flex-wrap items-center justify-center gap-2 overflow-hidden px-4 py-2.5 text-center text-xs font-medium text-[var(--color-text-primary)] sm:text-sm"
    >
      {/* Background lives on its own layer, masked to dissolve at the
          bottom instead of cutting hard into the header — the text/badge
          content above stays fully crisp regardless of the fade. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-primary/12 via-brand-secondary/9 to-brand-primary/12 transition-colors duration-300 group-hover:from-brand-primary/18 group-hover:to-brand-primary/18 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
      />

      {/* Slow diagonal shimmer sweep — a single soft highlight drifting
          across the bar, auto-disabled with the rest of motion under
          prefers-reduced-motion via the global MotionConfig. */}
      <motion.span
        aria-hidden
        initial={{ x: "-30%" }}
        animate={{ x: "130%" }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <motion.span
        aria-hidden
        animate={{ rotate: [0, -12, 0, 12, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative shrink-0 text-brand-accent"
      >
        <BoltIcon className="h-3.5 w-3.5" />
      </motion.span>

      <span className="relative text-[var(--color-text-muted)]">{prefix}:</span>

      {/* The headline figure — its own breathing, glowing pill so it reads
          as the one thing worth stopping for in the bar. */}
      <motion.span
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative inline-flex items-center rounded-full bg-gradient-to-r from-brand-accent to-brand-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-[#070B14] shadow-[0_0_16px_rgba(5,199,242,0.5)] sm:text-xs"
      >
        {badge}
      </motion.span>

      <span className="relative">{suffix}</span>

      <motion.span
        aria-hidden
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative hidden items-center gap-1 text-[var(--color-text-muted)] sm:inline-flex"
      >
        <Clock className="h-3 w-3" aria-hidden />
      </motion.span>

      <motion.span
        aria-hidden
        initial={{ x: 0 }}
        whileHover={{ x: locale === "ar" ? -3 : 3 }}
        transition={{ type: "spring", ...spring }}
        className="relative hidden text-brand-secondary sm:inline"
      >
        {locale === "ar" ? "←" : "→"}
      </motion.span>
    </Link>
  );
}
