"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { updateAdminCoupon, type AdminCoupon } from "@/lib/api";
import { DeactivateCouponButton } from "./DeactivateCouponButton";

export function EditCouponRow({ coupon, locale: typedLocale }: { coupon: AdminCoupon; locale: Locale }) {
  const locale = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState(coupon.maxRedemptions?.toString() ?? "");
  const [maxPerCustomer, setMaxPerCustomer] = useState(coupon.maxRedemptionsPerCustomer?.toString() ?? "");
  const [minOrder, setMinOrder] = useState(coupon.minOrderAmountMinorUnits ? (coupon.minOrderAmountMinorUnits / 100).toString() : "");
  const [endsAt, setEndsAt] = useState(coupon.endsAt ? coupon.endsAt.slice(0, 10) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await updateAdminCoupon(coupon.id, {
        maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : undefined,
        maxRedemptionsPerCustomer: maxPerCustomer.trim() ? Number(maxPerCustomer) : undefined,
        minOrderAmountMinorUnits: minOrder.trim() ? Math.round(Number(minOrder) * 100) : undefined,
        endsAt: endsAt.trim() ? new Date(endsAt).toISOString() : undefined,
      });
      setEditing(false);
      router.refresh();
    } catch {
      setError(locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMaxRedemptions(coupon.maxRedemptions?.toString() ?? "");
    setMaxPerCustomer(coupon.maxRedemptionsPerCustomer?.toString() ?? "");
    setMinOrder(coupon.minOrderAmountMinorUnits ? (coupon.minOrderAmountMinorUnits / 100).toString() : "");
    setEndsAt(coupon.endsAt ? coupon.endsAt.slice(0, 10) : "");
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{coupon.code}</td>
        <td className="p-3 text-[var(--color-text-muted)]">
          {coupon.discountType === "percentage" ? `${coupon.discountValue / 100}%` : formatMoney(coupon.discountValue, "SAR", typedLocale)}
        </td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder={locale === "ar" ? "غير محدود" : "unlimited"}
              className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
            />
            <span className="text-[var(--color-text-muted)]">/</span>
            <input
              type="number"
              min={1}
              value={maxPerCustomer}
              onChange={(e) => setMaxPerCustomer(e.target.value)}
              placeholder={locale === "ar" ? "للعميل" : "per cust."}
              className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
            />
          </div>
        </td>
        <td className="p-2">
          <input
            type="number"
            min={0}
            step="0.01"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="SAR"
            className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
          />
        </td>
        <td className="p-2">
          <input
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
          />
        </td>
        <td className="p-3 text-[var(--color-text-muted)]">
          {coupon.isActive ? (locale === "ar" ? "نشط" : "Active") : locale === "ar" ? "معطّل" : "Inactive"}
        </td>
        <td className="p-2">
          <div className="flex flex-col items-start gap-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
              >
                {locale === "ar" ? "حفظ" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
            {error ? <p className="text-xs text-danger">{error}</p> : null}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{coupon.code}</td>
      <td className="p-3 text-[var(--color-text-primary)]">
        {coupon.discountType === "percentage" ? `${coupon.discountValue / 100}%` : formatMoney(coupon.discountValue, "SAR", typedLocale)}
      </td>
      <td className="p-3 text-[var(--color-text-muted)]">
        {coupon.maxRedemptionsPerCustomer ? `${coupon.maxRedemptionsPerCustomer}/${locale === "ar" ? "عميل" : "customer"} · ` : ""}
        {coupon.maxRedemptions ?? (locale === "ar" ? "غير محدود" : "unlimited")}
      </td>
      <td className="p-3 text-[var(--color-text-muted)]">
        {coupon.minOrderAmountMinorUnits ? formatMoney(coupon.minOrderAmountMinorUnits, "SAR", typedLocale) : "—"}
      </td>
      <td className="p-3 text-[var(--color-text-muted)]">
        {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "—"}
      </td>
      <td className="p-3 text-[var(--color-text-muted)]">{coupon.isActive ? (locale === "ar" ? "نشط" : "Active") : locale === "ar" ? "معطّل" : "Inactive"}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-primary hover:underline">
            {locale === "ar" ? "تعديل" : "Edit"}
          </button>
          {coupon.isActive ? <DeactivateCouponButton couponId={coupon.id} /> : null}
        </div>
      </td>
    </tr>
  );
}
