"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { ApiError, updateAdminOrderStatus, ADMIN_MANUAL_ORDER_TRANSITIONS } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

/** Only offers the curated, admin-safe targets for the order's current
 * status (mirrors the backend's own allow-list) — never the full state
 * machine graph, which includes automated-only targets like PAID that would
 * desync invoicing/refund logic if set by hand. Renders nothing when the
 * current status has no manual target at all (most statuses don't; this is
 * deliberately narrow, see docs/ORDER_STATE_MACHINE.md). */
export function OrderStatusChangeForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const options = ADMIN_MANUAL_ORDER_TRANSITIONS[currentStatus] ?? [];
  const [toStatus, setToStatus] = useState(options[0] ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (options.length === 0) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (reason.trim().length < 3) {
      setError(locale === "ar" ? "يرجى كتابة سبب التغيير" : "Please enter a reason");
      return;
    }

    setLoading(true);
    try {
      await updateAdminOrderStatus(orderId, toStatus, reason);
      setSuccess(locale === "ar" ? "تم تحديث حالة الطلب" : "Order status updated");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? locale === "ar"
            ? "تغيّرت حالة الطلب في هذه الأثناء — أعد تحميل الصفحة وحاول مجددًا"
            : "This order's status changed since it was loaded — refresh and try again"
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
      <h2 className="font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "تغيير حالة الطلب يدويًا" : "Manually change order status"}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="status-target" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الحالة الجديدة" : "New status"}
          </label>
          <select
            id="status-target"
            value={toStatus}
            onChange={(e) => setToStatus(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          >
            {options.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-reason" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "السبب" : "Reason"}
          </label>
          <input
            id="status-reason"
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
        className="self-start rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {locale === "ar" ? "تحديث الحالة" : "Update status"}
      </button>
    </form>
  );
}
