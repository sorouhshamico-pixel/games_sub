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
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 3h2l2.2 12.1a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
          {locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
        </p>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          {locale === "ar" ? "تصفح الألعاب والاشتراكات وابدأ الشحن الآن" : "Browse games and subscriptions to get started"}
        </p>
        <Link
          href="/games"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          {t("home.heroCta")}
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "SAR";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("nav.cart")}</h1>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const name = locale === "ar" ? item.nameAr : item.nameEn;
          return (
            <li
              key={item.key}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-sm font-bold text-brand-primary">
                  {name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {name} — {locale === "ar" ? item.variantNameAr : item.variantNameEn}
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
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, Math.max(1, item.quantity - 1))}
                    aria-label={locale === "ar" ? "إنقاص الكمية" : "Decrease quantity"}
                    className="flex h-8 w-8 items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-[var(--color-text-primary)]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}
                    className="flex h-8 w-8 items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-sm text-danger hover:underline"
                >
                  {locale === "ar" ? "إزالة" : "Remove"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
        <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
        <span className="text-xl font-bold text-brand-accent">{formatMoney(total, currency, locale)}</span>
      </div>

      <Link
        href="/checkout"
        className="flex h-12 items-center justify-center rounded-xl bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
      >
        {locale === "ar" ? "متابعة الدفع" : "Proceed to checkout"}
      </Link>
    </div>
  );
}
