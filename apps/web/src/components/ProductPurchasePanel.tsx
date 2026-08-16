"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import { validateProductInputValues, type ProductDetail } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { cartItemKey } from "@/lib/cart";

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const { addItem } = useCart();

  const activeVariants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState(activeVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === variantId) ?? null,
    [activeVariants, variantId],
  );

  const errorMessages: Record<string, string> = {
    required: locale === "ar" ? "هذا الحقل مطلوب" : "This field is required",
    invalid_format: locale === "ar" ? "الصيغة غير صحيحة" : "Invalid format",
    too_short: locale === "ar" ? "القيمة قصيرة جدًا" : "Value is too short",
    too_long: locale === "ar" ? "القيمة طويلة جدًا" : "Value is too long",
  };

  function handleSubmit() {
    if (!selectedVariant) return;

    const result = validateProductInputValues(product.inputSchema, inputValues);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    addItem({
      key: cartItemKey(selectedVariant.id, inputValues),
      productSlug: product.slug,
      variantId: selectedVariant.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      variantNameAr: selectedVariant.nameAr,
      variantNameEn: selectedVariant.nameEn,
      unitPriceMinorUnits: selectedVariant.listPriceMinorUnits,
      currency: selectedVariant.currency,
      quantity,
      inputValues,
    });
    setAdded(true);
  }

  if (activeVariants.length === 0) {
    return (
      <p className="rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
        {locale === "ar" ? "هذا المنتج غير متاح حاليًا" : "This product is currently unavailable"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
          {locale === "ar" ? "اختر الفئة" : "Choose an option"}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {activeVariants.map((variant) => {
            const isSelected = variant.id === variantId;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={isSelected}
                className={`rounded-xl border px-3 py-2 text-start text-sm transition-colors ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/10 text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-brand-primary/50"
                }`}
              >
                <span className="block font-medium">{locale === "ar" ? variant.nameAr : variant.nameEn}</span>
                <span className="block text-brand-accent">{formatMoney(variant.listPriceMinorUnits, variant.currency, locale)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {product.inputSchema.length > 0 ? (
        <div className="flex flex-col gap-4">
          {product.inputSchema.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
                {locale === "ar" ? field.labelAr : field.labelEn}
                {field.required ? <span className="text-danger"> *</span> : null}
              </label>
              <input
                id={field.key}
                type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                value={inputValues[field.key] ?? ""}
                onChange={(event) =>
                  setInputValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                aria-invalid={Boolean(errors[field.key])}
                aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
              />
              {(locale === "ar" ? field.helpTextAr : field.helpTextEn) ? (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {locale === "ar" ? field.helpTextAr : field.helpTextEn}
                </p>
              ) : null}
              {errors[field.key] ? (
                <p id={`${field.key}-error`} role="alert" className="mt-1 text-xs text-danger">
                  {errorMessages[errors[field.key] as string] ?? errors[field.key]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium text-[var(--color-text-primary)]">
          {locale === "ar" ? "الكمية" : "Quantity"}
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={selectedVariant?.maxQuantityPerOrder ?? 10}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          className="w-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
        />
      </div>

      {!product.refundEligible ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-xs text-[var(--color-text-muted)]">
          {locale === "ar" ? product.refundPolicyAr : product.refundPolicyEn}
        </p>
      ) : null}

      <div className="sticky bottom-20 flex flex-col gap-2 sm:static sm:flex-row">
        <button
          type="button"
          onClick={handleSubmit}
          className="h-12 flex-1 rounded-xl bg-brand-primary text-base font-semibold text-white transition-colors hover:brightness-110"
        >
          {selectedVariant ? formatMoney(selectedVariant.listPriceMinorUnits * quantity, selectedVariant.currency, locale) : ""}{" — "}
          {locale === "ar" ? "أضف للسلة" : "Add to cart"}
        </button>
        {added ? (
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="h-12 rounded-xl border border-brand-primary px-5 text-sm font-medium text-brand-primary"
          >
            {t("nav.cart")} →
          </button>
        ) : null}
      </div>
      {added ? (
        <p role="status" className="text-sm text-success">
          {locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart"}
        </p>
      ) : null}
    </div>
  );
}
