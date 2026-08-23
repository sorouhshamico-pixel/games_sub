"use client";

import { useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { createAdminVariant } from "@/lib/api";

const CURRENCIES = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR"] as const;

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--color-text-muted)]";

/** Closes the gap the create-product form's own copy points at ("add more
 * later") — the backend already supports POST products/:id/variants, this
 * was just missing a form. Same field set/unit conversion as the
 * create-product form's first variant, for one consistent mental model. */
export function AddVariantForm({ productId }: { productId: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("SAR");
  const [baseCostSar, setBaseCostSar] = useState("");
  const [marginPercent, setMarginPercent] = useState("15");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const baseCostMinorUnits = Math.round(Number.parseFloat(baseCostSar) * 100);
    if (!Number.isFinite(baseCostMinorUnits) || baseCostMinorUnits < 0) {
      setError(locale === "ar" ? "السعر غير صالح" : "Invalid price");
      return;
    }

    setLoading(true);
    try {
      await createAdminVariant(productId, {
        sku,
        nameAr,
        nameEn,
        currency,
        baseCostMinorUnits,
        marginBasisPoints: Math.round(Number.parseFloat(marginPercent || "0") * 100),
      });
      setSku("");
      setNameAr("");
      setNameEn("");
      setBaseCostSar("");
      setOpen(false);
      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذّر إضافة الفئة السعرية" : "Couldn't add the price tier");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-lg border border-dashed border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5"
      >
        {locale === "ar" ? "+ إضافة فئة سعرية" : "+ Add price tier"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-variant-sku" className={labelClass}>
            SKU
          </label>
          <input id="new-variant-sku" required value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="new-variant-cost" className={labelClass}>
              {locale === "ar" ? "تكلفة المورد" : "Provider cost"}
            </label>
            <input
              id="new-variant-cost"
              required
              type="number"
              min="0"
              step="0.01"
              value={baseCostSar}
              onChange={(e) => setBaseCostSar(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="new-variant-currency" className={labelClass}>
              {locale === "ar" ? "العملة" : "Currency"}
            </label>
            <select
              id="new-variant-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as (typeof CURRENCIES)[number])}
              className={inputClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="new-variant-name-ar" className={labelClass}>
            {locale === "ar" ? "الاسم بالعربية" : "Arabic name"}
          </label>
          <input id="new-variant-name-ar" required dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="new-variant-name-en" className={labelClass}>
            {locale === "ar" ? "الاسم بالإنجليزية" : "English name"}
          </label>
          <input id="new-variant-name-en" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="new-variant-margin" className={labelClass}>
            {locale === "ar" ? "هامش الربح %" : "Margin %"}
          </label>
          <input
            id="new-variant-margin"
            type="number"
            min="0"
            step="0.1"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60">
          {locale === "ar" ? "إضافة" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)]"
        >
          {locale === "ar" ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </form>
  );
}
