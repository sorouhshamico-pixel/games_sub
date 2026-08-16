"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, createAdminCategory } from "@/lib/api";

export function CreateCategoryForm() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createAdminCategory({ slug, nameAr, nameEn });
      setSlug("");
      setNameAr("");
      setNameEn("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? locale === "ar"
            ? "المعرف مستخدم بالفعل"
            : "That slug is already in use"
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
          <label htmlFor="cat-slug" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "المعرف (slug)" : "Slug"}
          </label>
          <input
            id="cat-slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="game-topups"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="cat-ar" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الاسم بالعربية" : "Arabic name"}
          </label>
          <input
            id="cat-ar"
            required
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="cat-en" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الاسم بالإنجليزية" : "English name"}
          </label>
          <input
            id="cat-en"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
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
        {locale === "ar" ? "إضافة الفئة" : "Add category"}
      </button>
    </form>
  );
}
