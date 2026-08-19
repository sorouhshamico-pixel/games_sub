"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import { validateProductInputValues, type ProductDetail } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { useDisplayCurrency } from "./CurrencyProvider";
import { convertMinorUnits } from "@/lib/currency";
import { AnimatedPrice, SuccessCheck } from "./motion";
import { duration, easing, spring } from "@/lib/motion/tokens";
import { cartItemKey } from "@/lib/cart";

type SubmitState = "idle" | "adding" | "added";

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const { addItem } = useCart();
  const { currency: displayCurrency } = useDisplayCurrency();

  const activeVariants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState(activeVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === variantId) ?? null,
    [activeVariants, variantId],
  );

  // Heuristic "ready" state for the button's energy-pulse cue — a variant
  // picked and every required field has *something* in it. Real validation
  // (regex, length) still only runs on submit; this is just a visual nudge,
  // not a second validation pass.
  const looksReady =
    Boolean(selectedVariant) && product.inputSchema.every((field) => !field.required || (inputValues[field.key] ?? "").trim().length > 0);

  const errorMessages: Record<string, string> = {
    required: locale === "ar" ? "هذا الحقل مطلوب" : "This field is required",
    invalid_format: locale === "ar" ? "الصيغة غير صحيحة" : "Invalid format",
    too_short: locale === "ar" ? "القيمة قصيرة جدًا" : "Value is too short",
    too_long: locale === "ar" ? "القيمة طويلة جدًا" : "Value is too long",
  };

  function handleSubmit() {
    if (!selectedVariant || submitState === "adding") return;

    const result = validateProductInputValues(product.inputSchema, inputValues);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitState("adding");

    // Deliberate short delay before the real (synchronous, instant) cart
    // update — without it the "adding" state would never be visible at all,
    // and the spec asks for a perceivable loading -> success sequence.
    window.setTimeout(() => {
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
      setSubmitState("added");
      window.setTimeout(() => setSubmitState("idle"), 1800);
    }, 260);
  }

  if (activeVariants.length === 0) {
    return (
      <p className="rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
        {locale === "ar" ? "هذا المنتج غير متاح حاليًا" : "This product is currently unavailable"}
      </p>
    );
  }

  const totalMinorUnits = selectedVariant ? selectedVariant.listPriceMinorUnits * quantity : 0;

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
              <motion.button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={isSelected}
                animate={{ borderColor: isSelected ? "var(--color-brand-primary)" : "var(--color-border)" }}
                transition={{ duration: duration.fast, ease: easing }}
                className={`relative rounded-xl border px-3 py-2 text-start text-sm ${
                  isSelected ? "bg-brand-primary/10 text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)] hover:border-brand-primary/50"
                }`}
              >
                <AnimatePresence>
                  {isSelected ? (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", ...spring }}
                      className="absolute -top-1.5 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-white"
                    >
                      <svg aria-hidden viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                      </svg>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <span className="block font-medium">{locale === "ar" ? variant.nameAr : variant.nameEn}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={displayCurrency}
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }}
                    transition={{ duration: duration.fast, ease: easing }}
                    className="block text-brand-accent"
                  >
                    {formatMoney(convertMinorUnits(variant.listPriceMinorUnits, variant.currency, displayCurrency), displayCurrency, locale)}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
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
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
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
        <div className="relative flex-1">
          {looksReady && submitState === "idle" ? (
            <motion.span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-xl bg-brand-primary/40 blur-lg"
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={submitState === "adding"}
            whileHover={submitState === "idle" ? { y: -2 } : undefined}
            whileTap={submitState === "idle" ? { scale: 0.985, y: 0 } : undefined}
            transition={{ type: "spring", ...spring }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-base font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitState === "adding" ? (
                <motion.span
                  key="adding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {locale === "ar" ? "جارٍ الإضافة..." : "Adding..."}
                </motion.span>
              ) : submitState === "added" ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <SuccessCheck size={20} />
                  {locale === "ar" ? "تمت الإضافة" : "Added"}
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  {selectedVariant ? (
                    <AnimatedPrice
                      amountMinorUnits={convertMinorUnits(totalMinorUnits, selectedVariant.currency, displayCurrency)}
                      currency={displayCurrency}
                      locale={locale}
                    />
                  ) : (
                    ""
                  )}
                  {" — "}
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        {submitState === "added" ? (
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="h-12 rounded-xl border border-brand-primary px-5 text-sm font-medium text-brand-primary"
          >
            {t("nav.cart")} →
          </button>
        ) : null}
      </div>
      <p role="status" className="sr-only">
        {submitState === "added" ? (locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart") : ""}
      </p>
    </div>
  );
}
