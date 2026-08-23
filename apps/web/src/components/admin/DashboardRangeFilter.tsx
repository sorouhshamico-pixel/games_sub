"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const RANGES = [7, 30, 90] as const;

export function DashboardRangeFilter({ currentDays }: { currentDays: number }) {
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] p-1">
      {RANGES.map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => router.push(`/admin?days=${days}`)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            days === currentDays ? "bg-brand-primary text-white" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
          }`}
        >
          {locale === "ar" ? `${days} يوم` : `${days}d`}
        </button>
      ))}
    </div>
  );
}
