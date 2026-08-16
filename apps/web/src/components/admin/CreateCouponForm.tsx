"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, createAdminCoupon } from "@/lib/api";

export function CreateCouponForm() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [maxRedemptionsPerCustomer, setMaxRedemptionsPerCustomer] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const value = Number(discountValue);
      await createAdminCoupon({
        code,
        discountType,
        // percentage input is a plain percent (e.g. 15); convert to basis points.
        discountValue: discountType === "percentage" ? Math.round(value * 100) : Math.round(value * 100),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        maxRedemptionsPerCustomer: maxRedemptionsPerCustomer ? Number(maxRedemptionsPerCustomer) : undefined,
        minOrderAmountMinorUnits: minOrderAmount ? Math.round(Number(minOrderAmount) * 100) : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      });
      setCode("");
      setDiscountValue("");
      setMaxRedemptions("");
      setMaxRedemptionsPerCustomer("");
      setMinOrderAmount("");
      setEndsAt("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? locale === "ar"
            ? "الكود مستخدم بالفعل"
            : "That code is already in use"
          : err instanceof ApiError
            ? err.message
            : locale === "ar"
              ? "حدث خطأ غير متوقع"
              : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="coupon-code" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الكود" : "Code"}
          </label>
          <input
            id="coupon-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SUMMER25"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm uppercase text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="coupon-type" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "نوع الخصم" : "Discount type"}
          </label>
          <select
            id="coupon-type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          >
            <option value="percentage">{locale === "ar" ? "نسبة مئوية" : "Percentage"}</option>
            <option value="fixed">{locale === "ar" ? "مبلغ ثابت" : "Fixed amount"}</option>
          </select>
        </div>
        <div>
          <label htmlFor="coupon-value" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {discountType === "percentage" ? (locale === "ar" ? "النسبة %" : "Percent %") : locale === "ar" ? "المبلغ (ر.س)" : "Amount (SAR)"}
          </label>
          <input
            id="coupon-value"
            required
            type="number"
            min="0"
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="coupon-max" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الحد الأقصى للاستخدام (اختياري)" : "Max redemptions (optional)"}
          </label>
          <input
            id="coupon-max"
            type="number"
            min="1"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="coupon-max-customer" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الحد لكل عميل (اختياري)" : "Max per customer (optional)"}
          </label>
          <input
            id="coupon-max-customer"
            type="number"
            min="1"
            value={maxRedemptionsPerCustomer}
            onChange={(e) => setMaxRedemptionsPerCustomer(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="coupon-min-order" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الحد الأدنى للطلب ر.س (اختياري)" : "Min order SAR (optional)"}
          </label>
          <input
            id="coupon-min-order"
            type="number"
            min="0"
            step="0.01"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="coupon-ends" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "تاريخ الانتهاء (اختياري)" : "Expires (optional)"}
          </label>
          <input
            id="coupon-ends"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {locale === "ar" ? "إضافة الكود" : "Add coupon"}
      </button>
    </form>
  );
}
