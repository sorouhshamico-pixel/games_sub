"use client";

import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/api";

export function LogoutButton() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
    >
      {locale === "ar" ? "تسجيل الخروج" : "Log out"}
    </button>
  );
}
