"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/CartProvider";
import { cartTotal } from "@/lib/cart";

export default function CartPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { items, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-lg font-medium text-[var(--color-text-primary)]">
          {locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
        </p>
        <Link href="/games" className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white">
          {t("home.heroCta")}
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "SAR";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t("nav.cart")}</h1>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                {locale === "ar" ? item.nameAr : item.nameEn} — {locale === "ar" ? item.variantNameAr : item.variantNameEn}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatMoney(item.unitPriceMinorUnits, item.currency, locale)} × {item.quantity}
              </p>
              {Object.keys(item.inputValues).length > 0 ? (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {Object.entries(item.inputValues)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => setQuantity(item.key, Number(event.target.value) || 1)}
                className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-sm text-[var(--color-text-primary)]"
                aria-label={locale === "ar" ? "الكمية" : "Quantity"}
              />
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="text-sm text-danger hover:underline"
              >
                {locale === "ar" ? "إزالة" : "Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
        <span className="text-lg font-bold text-brand-accent">{formatMoney(total, currency, locale)}</span>
      </div>

      <Link
        href="/checkout"
        className="flex h-12 items-center justify-center rounded-xl bg-brand-primary text-base font-semibold text-white hover:brightness-110"
      >
        {locale === "ar" ? "متابعة الدفع" : "Proceed to checkout"}
      </Link>
    </div>
  );
}
