"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PRODUCT_LIFECYCLE_STATUSES as STATUSES } from "@/lib/admin-constants";

export function ProductStatusFilter({ currentStatus }: { currentStatus?: string }) {
  const locale = useLocale();
  const router = useRouter();

  function handleChange(value: string) {
    router.push(value ? `/admin/products?status=${value}` : "/admin/products");
  }

  return (
    <select
      value={currentStatus ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
    >
      <option value="">{locale === "ar" ? "كل الحالات" : "All statuses"}</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
