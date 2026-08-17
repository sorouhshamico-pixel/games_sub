"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useCart } from "@/components/CartProvider";
import { CartContents } from "@/components/CartContents";
import { MotionDrawer } from "@/components/motion";

/**
 * Quick-access cart, opened from the header's cart icon. Physical side is
 * "left" per spec — this store is RTL-first (Arabic), so the cart icon
 * sits at the visual start of the header and the drawer opens toward the
 * same side. The full `/cart` page still exists unchanged; this is an
 * additive fast path, not a replacement.
 */
export function CartDrawer() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { isDrawerOpen, closeDrawer } = useCart();
  const titleId = useId();

  return (
    <MotionDrawer open={isDrawerOpen} onClose={closeDrawer} side="left" labelledBy={titleId}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
        <h2 id={titleId} className="text-lg font-bold text-[var(--color-text-primary)]">
          {t("nav.cart")}
        </h2>
        <button
          type="button"
          onClick={closeDrawer}
          aria-label={locale === "ar" ? "إغلاق" : "Close"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <CartContents onNavigate={closeDrawer} />
      </div>
    </MotionDrawer>
  );
}
