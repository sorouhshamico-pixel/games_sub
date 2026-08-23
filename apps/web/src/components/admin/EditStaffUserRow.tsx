"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, updateAdminStaffUser, type AdminStaffUser } from "@/lib/api";

const STAFF_ROLES = ["SUPER_ADMIN", "OPERATIONS", "FINANCE", "SUPPORT", "CATALOG_MANAGER", "CONTENT_SEO", "READ_ONLY_ANALYST"] as const;

export function EditStaffUserRow({ user, isSelf }: { user: AdminStaffUser; isSelf: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRoleChange(role: string) {
    setError(null);
    setBusy(true);
    try {
      await updateAdminStaffUser(user.id, { role });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive() {
    setError(null);
    setBusy(true);
    try {
      await updateAdminStaffUser(user.id, { isActive: !user.isActive });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="p-3 text-[var(--color-text-primary)]">
        {user.email}
        {isSelf ? <span className="ms-2 text-xs text-[var(--color-text-muted)]">({locale === "ar" ? "أنت" : "you"})</span> : null}
      </td>
      <td className="p-2">
        <select
          value={user.role}
          disabled={busy || isSelf}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-sm text-[var(--color-text-primary)] disabled:opacity-60"
        >
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={busy || isSelf}
          className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-60 ${
            user.isActive ? "bg-success/15 text-success hover:bg-success/25" : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:bg-danger/15 hover:text-danger"
          }`}
        >
          {user.isActive ? (locale === "ar" ? "نشط" : "Active") : locale === "ar" ? "معطّل" : "Inactive"}
        </button>
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      </td>
      <td className="p-3 text-[var(--color-text-muted)]">{new Date(user.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</td>
    </tr>
  );
}
