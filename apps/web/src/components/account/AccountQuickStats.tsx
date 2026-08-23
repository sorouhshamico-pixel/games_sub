"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Wallet } from "lucide-react";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/CartProvider";
import { useDisplayCurrency } from "@/components/CurrencyProvider";
import { convertMinorUnits, currencyLabels } from "@/lib/currency";
import { duration, easing } from "@/lib/motion/tokens";

/** Two real, live stats — the actual cart state and the actual display
 * currency preference — instead of fabricated account metrics. */
export function AccountQuickStats({ locale }: { locale: Locale }) {
  const { items } = useCart();
  const { currency } = useDisplayCurrency();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + convertMinorUnits(item.unitPriceMinorUnits * item.quantity, item.currency, currency),
        0,
      ),
    [items, currency],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link href="/cart">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.normal, ease: easing }}
          whileHover={{ y: -2 }}
          className="flex h-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-brand-primary/50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
            <ShoppingCart className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-text-muted)]">
              {locale === "ar" ? "سلتك الحالية" : "Your current cart"}
            </p>
            <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">
              {itemCount > 0
                ? locale === "ar"
                  ? `${itemCount} عنصر — ${formatMoney(subtotal, currency, locale)}`
                  : `${itemCount} item${itemCount > 1 ? "s" : ""} — ${formatMoney(subtotal, currency, locale)}`
                : locale === "ar"
                  ? "السلة فارغة"
                  : "Cart is empty"}
            </p>
          </div>
        </motion.div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.normal, ease: easing, delay: 0.05 }}
        className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/15 text-brand-secondary">
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "عملة العرض" : "Display currency"}</p>
          <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">{currencyLabels[currency][locale]}</p>
        </div>
      </motion.div>
    </div>
  );
}
