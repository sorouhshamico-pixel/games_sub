import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";

/** Plain server-rendered bars (height = % of the window's max day) — no
 * charting library, no client JS. Native `title` gives an exact-value
 * tooltip on hover instead of a custom tooltip component. */
export function RevenueChart({
  data,
  locale,
}: {
  data: Array<{ date: string; totalMinorUnits: number }>;
  locale: Locale;
}) {
  const max = Math.max(1, ...data.map((d) => d.totalMinorUnits));

  return (
    <div className="flex h-40 items-end gap-1 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      {data.map((day) => {
        const heightPercent = Math.max(2, Math.round((day.totalMinorUnits / max) * 100));
        return (
          <div
            key={day.date}
            title={`${day.date} — ${formatMoney(day.totalMinorUnits, "SAR", locale)}`}
            className="flex min-w-[6px] flex-1 flex-col items-center justify-end"
          >
            <div
              style={{ height: `${heightPercent}%` }}
              className={`w-full rounded-t-sm transition-colors ${day.totalMinorUnits > 0 ? "bg-brand-primary hover:bg-brand-secondary" : "bg-[var(--color-border)]"}`}
            />
          </div>
        );
      })}
    </div>
  );
}
