import { setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link, redirect } from "@/i18n/navigation";
import { ApiError, getAdminOrders } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const { status, page } = await searchParams;

  const cookieHeader = await getServerCookieHeader();
  let result: Awaited<ReturnType<typeof getAdminOrders>> | null = null;
  let forbidden = false;
  try {
    result = await getAdminOrders({ status, page: page ? Number(page) : undefined }, { cookieHeader });
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

  if (forbidden || !result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "الطلبات" : "Orders"}</h1>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3 text-start">{locale === "ar" ? "رقم الطلب" : "Order #"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الإجمالي" : "Total"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "العميل" : "Customer"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "التاريخ" : "Date"}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((order) => (
              <tr key={order.id} className="border-t border-[var(--color-border)]">
                <td className="p-3 font-mono text-xs">
                  <Link href={`/admin/orders/${order.id}`} className="text-brand-primary hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-3 text-[var(--color-text-primary)]">{order.status}</td>
                <td className="p-3 text-[var(--color-text-primary)]">{formatMoney(order.totalMinorUnits, order.currency, typedLocale)}</td>
                <td className="p-3 text-[var(--color-text-muted)]">{order.guestEmail ?? order.guestPhone ?? "—"}</td>
                <td className="p-3 text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">
        {locale === "ar" ? `الإجمالي: ${result.total}` : `Total: ${result.total}`}
      </p>
    </div>
  );
}
