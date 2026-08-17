"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BoltIcon } from "./home/icons";

/**
 * Investor-demo top announcement strip — same "-X%" illustrative framing as
 * the homepage's LimitedOffers section, which carries the actual demo-data
 * disclaimer. Links there instead of repeating the disclaimer in this thin
 * bar, so it stays functional rather than a dead visual element.
 */
export function PromoBar() {
  const locale = useLocale();

  return (
    <Link
      href="/#limited-offers"
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary/25 via-brand-secondary/20 to-brand-primary/25 px-4 py-2 text-center text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:from-brand-primary/35 hover:to-brand-primary/35 sm:text-sm"
    >
      <BoltIcon className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
      {locale === "ar"
        ? "عرض خاص: خصم 15% على جميع عمليات الشحن لفترة محدودة"
        : "Special offer: 15% off all top-ups for a limited time"}
    </Link>
  );
}
