"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, updateAdminSettings, type StoreSettings } from "@/lib/api";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail ?? "");
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone ?? "");
  const [refundWindowDays, setRefundWindowDays] = useState(settings.refundWindowDays?.toString() ?? "");
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await updateAdminSettings({
        supportEmail: supportEmail.trim() || undefined,
        supportPhone: supportPhone.trim() || undefined,
        refundWindowDays: refundWindowDays.trim() ? Number(refundWindowDays) : undefined,
        maintenanceMode,
      });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="support-email" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "بريد الدعم" : "Support email"}
          </label>
          <input
            id="support-email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@example.com"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {locale === "ar" ? "يظهر في صفحة الأسئلة الشائعة عند تعبئته" : "Shows on the FAQ page once set"}
          </p>
        </div>
        <div>
          <label htmlFor="support-phone" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "رقم واتساب الدعم" : "Support WhatsApp number"}
          </label>
          <input
            id="support-phone"
            type="tel"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="+9665XXXXXXXX"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {locale === "ar"
              ? "زر واتساب العائم يفتح محادثة حقيقية بهذا الرقم عند تعبئته؛ بدونه يفتح صفحة الأسئلة الشائعة"
              : "The floating WhatsApp button opens a real chat to this number once set; without it, it links to the FAQ page"}
          </p>
        </div>
        <div>
          <label htmlFor="refund-window" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            {locale === "ar" ? "مهلة الاسترجاع (أيام)" : "Refund window (days)"}
          </label>
          <input
            id="refund-window"
            type="number"
            min="0"
            max="365"
            value={refundWindowDays}
            onChange={(e) => setRefundWindowDays(e.target.value)}
            placeholder={locale === "ar" ? "بلا حد (اتركه فارغًا)" : "No limit (leave blank)"}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {locale === "ar" ? "يُطبَّق فعليًا عند محاولة استرجاع طلب" : "Actually enforced when a refund is attempted"}
          </p>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">{locale === "ar" ? "وضع الصيانة" : "Maintenance mode"}</span>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="h-4 w-4" />
            {locale === "ar" ? "إظهار شريط صيانة على واجهة المتجر" : "Show a maintenance banner on the storefront"}
          </label>
        </div>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{locale === "ar" ? "تم الحفظ" : "Saved"}</p> : null}
      <button type="submit" disabled={loading} className="self-start rounded-lg bg-brand-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
        {locale === "ar" ? "حفظ الإعدادات" : "Save settings"}
      </button>
    </form>
  );
}
