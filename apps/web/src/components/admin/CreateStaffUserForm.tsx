"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { ApiError, createAdminStaffUser } from "@/lib/api";

// CONTENT_SEO excluded — see create-staff-user.dto.ts on the API side: no
// admin controller grants it any access yet, so it would be a dead-end role.
const STAFF_ROLES = ["SUPER_ADMIN", "OPERATIONS", "FINANCE", "SUPPORT", "CATALOG_MANAGER", "READ_ONLY_ANALYST"] as const;

export function CreateStaffUserForm() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof STAFF_ROLES)[number]>("SUPPORT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError(locale === "ar" ? "كلمة المرور يجب ألا تقل عن 10 أحرف" : "Password must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      await createAdminStaffUser({ email, password, role });
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? locale === "ar"
            ? "يوجد مستخدم بهذا البريد الإلكتروني بالفعل"
            : "A user with this email already exists"
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
      <h2 className="font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "إضافة عضو فريق" : "Add a staff member"}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="staff-email" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "البريد الإلكتروني" : "Email"}
          </label>
          <input
            id="staff-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="staff-password" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "كلمة المرور المبدئية" : "Initial password"}
          </label>
          <input
            id="staff-password"
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="staff-role" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
            {locale === "ar" ? "الدور" : "Role"}
          </label>
          <select
            id="staff-role"
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof STAFF_ROLES)[number])}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {locale === "ar" ? "إضافة" : "Add"}
      </button>
    </form>
  );
}
