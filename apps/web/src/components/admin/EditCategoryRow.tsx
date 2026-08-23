"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, updateAdminCategory, type AdminCategory } from "@/lib/api";

export function EditCategoryRow({ category }: { category: AdminCategory }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nameAr, setNameAr] = useState(category.nameAr);
  const [nameEn, setNameEn] = useState(category.nameEn);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await updateAdminCategory(category.id, { nameAr, nameEn });
      setEditing(false);
      router.refresh();
    } catch {
      setError(locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    setError(null);
    try {
      await updateAdminCategory(category.id, { isActive: !category.isActive });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? (locale === "ar" ? "تعذّر تحديث الحالة" : "Couldn't update status") : (locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong"),
      );
    }
  }

  function handleCancel() {
    setNameAr(category.nameAr);
    setNameEn(category.nameEn);
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{category.slug}</td>
        <td className="p-2">
          <input
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text-primary)]"
          />
        </td>
        <td className="p-2">
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text-primary)]"
          />
        </td>
        <td className="p-3 text-[var(--color-text-muted)]">
          {category.isActive ? (locale === "ar" ? "نشطة" : "Active") : locale === "ar" ? "معطّلة" : "Inactive"}
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
      <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{category.slug}</td>
      <td className="p-3 text-[var(--color-text-primary)]">{category.nameAr}</td>
      <td className="p-3 text-[var(--color-text-primary)]">{category.nameEn}</td>
      <td className="p-3">
        <button
          type="button"
          onClick={handleToggleActive}
          className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
            category.isActive
              ? "bg-success/15 text-success hover:bg-success/25"
              : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:bg-danger/15 hover:text-danger"
          }`}
        >
          {category.isActive ? (locale === "ar" ? "نشطة" : "Active") : locale === "ar" ? "معطّلة" : "Inactive"}
        </button>
      </td>
      <td className="p-3">
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-primary hover:underline">
          {locale === "ar" ? "تعديل" : "Edit"}
        </button>
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      </td>
    </tr>
  );
}
