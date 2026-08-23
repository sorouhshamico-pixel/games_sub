"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { formatMoney } from "@gcc-store/ui";
import type { AdminProductDetail } from "@/lib/api";
import { deactivateAdminVariant, deleteAdminProduct, updateAdminProductStatus } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { AddVariantForm } from "./AddVariantForm";

const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "OUT_OF_STOCK", "RETIRED"] as const;

export function ProductAdminPanel({ product }: { product: AdminProductDetail }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [status, setStatus] = useState(product.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(next: string) {
    setBusy(true);
    setError(null);
    try {
      await updateAdminProductStatus(product.id, next);
      setStatus(next);
      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذر تحديث الحالة" : "Could not update status");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivateVariant(variantId: string) {
    setBusy(true);
    setError(null);
    try {
      await deactivateAdminVariant(variantId);
      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذر تعطيل الفئة السعرية" : "Could not deactivate the variant");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteAdminProduct(product.id);
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError(locale === "ar" ? "تعذر حذف المنتج" : "Could not delete the product");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label htmlFor="product-status" className="text-sm font-medium text-[var(--color-text-primary)]">
          {locale === "ar" ? "الحالة" : "Status"}
        </label>
        <select
          id="product-status"
          value={status}
          disabled={busy}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="ms-auto rounded-lg border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/5 disabled:opacity-60"
        >
          {locale === "ar" ? "حذف المنتج" : "Delete product"}
        </button>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "الفئات السعرية" : "Price tiers"}</h2>
        <div className="flex flex-col gap-2">
          {product.variants.map((variant) => (
            <div key={variant.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3 text-sm">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {locale === "ar" ? variant.nameAr : variant.nameEn} · <span className="font-mono text-xs">{variant.sku}</span>
                </p>
                <p className="text-[var(--color-text-muted)]">{formatMoney(variant.baseCostMinorUnits, variant.currency, locale)} base cost</p>
              </div>
              {variant.isActive ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDeactivateVariant(variant.id)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-60"
                >
                  {locale === "ar" ? "تعطيل" : "Deactivate"}
                </button>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)]">{locale === "ar" ? "معطّلة" : "Inactive"}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <AddVariantForm productId={product.id} />
        </div>
      </section>
    </div>
  );
}
