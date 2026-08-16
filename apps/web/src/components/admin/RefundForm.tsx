"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { formatMoney } from "@gcc-store/ui";
import type { SupportedCurrency } from "@gcc-store/contracts";
import { ApiError, createAdminRefund } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

export function RefundForm({ orderId, refundableMinorUnits, currency }: { orderId: string; refundableMinorUnits: number; currency: SupportedCurrency }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [amountSar, setAmountSar] = useState((refundableMinorUnits / 100).toFixed(2));
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (refundableMinorUnits <= 0) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const amountMinorUnits = Math.round(Number.parseFloat(amountSar) * 100);
    if (!Number.isFinite(amountMinorUnits) || amountMinorUnits <= 0 || amountMinorUnits > refundableMinorUnits) {
      setError(locale === "ar" ? "المبلغ غير صالح" : "Invalid amount");
      return;
    }
    if (reason.trim().length < 3) {
      setError(locale === "ar" ? "يرجى كتابة سبب الاسترجاع" : "Please enter a reason");
      return;
    }

    setLoading(true);
    try {
      const result = await createAdminRefund(orderId, { amountMinorUnits, reason });
      if (result.status === "succeeded") {
        setSuccess(locale === "ar" ? "تم الاسترجاع بنجاح" : "Refund succeeded");
      } else {
        setError(locale === "ar" ? "فشلت بوابة الدفع في تنفيذ الاسترجاع — راجع الطلب لاحقًا" : "The payment gateway failed to process the refund — check the order later");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4">
      <h2 className="font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "استرجاع مبلغ" : "Issue a refund"}</h2>
      <p className="text-xs text-[var(--color-text-muted)]">
        {locale === "ar" ? "الحد الأقصى القابل للاسترجاع:" : "Max refundable:"} {formatMoney(refundableMinorUnits, currency, locale)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="refund-amount" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "المبلغ" : "Amount"}
          </label>
          <input
            id="refund-amount"
            type="number"
            min="0.01"
            step="0.01"
            max={(refundableMinorUnits / 100).toFixed(2)}
            value={amountSar}
            onChange={(e) => setAmountSar(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="refund-reason" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "السبب" : "Reason"}
          </label>
          <input
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-danger px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {locale === "ar" ? "تنفيذ الاسترجاع" : "Process refund"}
      </button>
    </form>
  );
}
