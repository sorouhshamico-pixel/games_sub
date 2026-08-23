import { setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminDashboard } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { DashboardRangeFilter } from "@/components/admin/DashboardRangeFilter";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

const ALLOWED_WINDOWS = [7, 30, 90] as const;

export default async function AdminDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const { days } = await searchParams;
  const windowDays = ALLOWED_WINDOWS.includes(Number(days) as (typeof ALLOWED_WINDOWS)[number]) ? (Number(days) as (typeof ALLOWED_WINDOWS)[number]) : 30;

  const cookieHeader = await getServerCookieHeader();
  let dashboard: Awaited<ReturnType<typeof getAdminDashboard>> | null = null;
  let forbidden = false;
  try {
    dashboard = await getAdminDashboard(windowDays, { cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect({ href: "/login", locale: typedLocale });
    }
    if (error instanceof ApiError && error.status === 403) {
      forbidden = true;
    } else {
      throw error;
    }
  }

  if (forbidden || !dashboard) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "لوحة التحكم" : "Dashboard"}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "ar" ? `آخر ${dashboard.windowDays} يومًا` : `Last ${dashboard.windowDays} days`}
          </p>
        </div>
        <DashboardRangeFilter currentDays={windowDays} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={locale === "ar" ? "الإيرادات" : "Revenue"}
          value={formatMoney(dashboard.revenue.totalMinorUnits, "SAR", typedLocale)}
        />
        <StatCard label={locale === "ar" ? "عدد الطلبات المدفوعة" : "Paid orders"} value={String(dashboard.revenue.orderCount)} />
        <StatCard
          label={locale === "ar" ? "نسبة نجاح التنفيذ" : "Fulfillment success rate"}
          value={dashboard.fulfillment.successRatePercent !== null ? `${dashboard.fulfillment.successRatePercent}%` : "—"}
        />
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "الإيرادات اليومية" : "Daily revenue"}</h2>
        <RevenueChart data={dashboard.dailyRevenue} locale={typedLocale} />
      </section>

      {dashboard.topProducts.length > 0 ? (
        <section>
          <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "الأكثر مبيعًا" : "Top products"}</h2>
          <div className="flex flex-col gap-2">
            {dashboard.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3 text-sm">
                <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/15 text-xs font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  {product.name}
                </span>
                <span className="font-medium text-brand-accent">{formatMoney(product.revenueMinorUnits, "SAR", typedLocale)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "الطلبات حسب الحالة" : "Orders by status"}</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(dashboard.ordersByStatus).map(([status, count]) => (
            <span key={status} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text-primary)]">
              {status}: {count}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">{locale === "ar" ? "مزوّدو الشحن" : "Fulfillment providers"}</h2>
        <div className="flex flex-col gap-2">
          {dashboard.providers.map((provider) => (
            <div key={provider.code} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3 text-sm">
              <span className="text-[var(--color-text-primary)]">{provider.name}</span>
              <span className="text-[var(--color-text-muted)]">
                {provider.latestBalance
                  ? formatMoney(provider.latestBalance.balanceMinorUnits, provider.latestBalance.currency, typedLocale)
                  : locale === "ar"
                    ? "لا توجد بيانات رصيد بعد"
                    : "No balance snapshot yet"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
