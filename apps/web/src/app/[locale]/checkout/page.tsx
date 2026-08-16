"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/CartProvider";
import { cartTotal } from "@/lib/cart";

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { items } = useCart();

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        {locale === "ar" ? "الدفع" : "Checkout"}
      </h1>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">
          {locale === "ar" ? "ملخص الطلب" : "Order summary"}
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between text-[var(--color-text-muted)]">
              <span>
                {locale === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
              </span>
              <span>{formatMoney(item.unitPriceMinorUnits * item.quantity, item.currency, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <span className="font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "الإجمالي" : "Total"}</span>
          <span className="text-lg font-bold text-brand-accent">{formatMoney(total, currency, locale)}</span>
        </div>
      </section>

      <section
        role="status"
        className="rounded-2xl border border-brand-secondary/40 bg-brand-secondary/5 p-5 text-sm text-[var(--color-text-primary)]"
      >
        <p className="font-medium">
          {locale === "ar" ? "الدفع الإلكتروني قيد الإعداد" : "Online payment is being set up"}
        </p>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {locale === "ar"
            ? "هذا متجر عرض تجريبي (المرحلة 1). بوابة الدفع (Moyasar) وربط الشحن الفعلي سيُفعّلان في مرحلة لاحقة قبل الإطلاق الحقيقي."
            : "This is a demo storefront (Phase 1). The Moyasar payment gateway and live fulfillment will be wired up in a later phase before real launch."}
        </p>
      </section>

      <button
        type="button"
        disabled
        aria-disabled
        className="flex h-12 items-center justify-center rounded-xl bg-brand-primary/40 text-base font-semibold text-white/70"
      >
        {locale === "ar" ? "ادفع الآن — غير متاح بعد" : "Pay now — not available yet"}
      </button>
    </div>
  );
}
