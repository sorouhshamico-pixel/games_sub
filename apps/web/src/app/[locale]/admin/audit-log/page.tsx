import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { Link, redirect } from "@/i18n/navigation";
import { ApiError, getAdminAuditLog } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";

export const dynamic = "force-dynamic";

const ENTITY_TYPES = ["Order", "Product", "ProductVariant", "Category", "Coupon", "User", "AppSetting"];

export default async function AdminAuditLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ entityType?: string; page?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const { entityType, page } = await searchParams;

  const cookieHeader = await getServerCookieHeader();
  let result: Awaited<ReturnType<typeof getAdminAuditLog>> | null = null;
  let forbidden = false;
  try {
    result = await getAdminAuditLog({ entityType, page: page ? Number(page) : undefined }, { cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else throw error;
  }

  if (forbidden || !result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  const currentPage = page ? Number(page) : 1;
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "سجل التدقيق" : "Audit log"}</h1>
        <form className="flex items-center gap-2" action={`/${locale}/admin/audit-log`} method="GET">
          <select
            name="entityType"
            defaultValue={entityType ?? ""}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          >
            <option value="">{locale === "ar" ? "كل الأنواع" : "All types"}</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]">
            {locale === "ar" ? "تصفية" : "Filter"}
          </button>
        </form>
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">{locale === "ar" ? "لا توجد سجلات بعد" : "No entries yet"}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
              <tr>
                <th className="p-3 text-start">{locale === "ar" ? "الإجراء" : "Action"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "النوع" : "Entity"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "بواسطة" : "Actor"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((entry) => (
                <tr key={entry.id} className="border-t border-[var(--color-border)]">
                  <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{entry.action}</td>
                  <td className="p-3 text-[var(--color-text-muted)]">
                    {entry.entityType} <span className="font-mono text-xs">{entry.entityId.slice(0, 8)}</span>
                  </td>
                  <td className="p-3 text-[var(--color-text-muted)]">{entry.actor?.email ?? "—"}</td>
                  <td className="p-3 text-[var(--color-text-muted)]">{new Date(entry.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">{locale === "ar" ? `الإجمالي: ${result.total}` : `Total: ${result.total}`}</p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-3 text-sm">
            {currentPage > 1 ? (
              <Link
                href={{ pathname: "/admin/audit-log", query: { ...(entityType ? { entityType } : {}), page: String(currentPage - 1) } }}
                className="text-brand-primary hover:underline"
              >
                {locale === "ar" ? "السابق" : "Previous"}
              </Link>
            ) : (
              <span className="text-[var(--color-text-muted)]">{locale === "ar" ? "السابق" : "Previous"}</span>
            )}
            <span className="text-[var(--color-text-muted)]">{locale === "ar" ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
            {currentPage < totalPages ? (
              <Link
                href={{ pathname: "/admin/audit-log", query: { ...(entityType ? { entityType } : {}), page: String(currentPage + 1) } }}
                className="text-brand-primary hover:underline"
              >
                {locale === "ar" ? "التالي" : "Next"}
              </Link>
            ) : (
              <span className="text-[var(--color-text-muted)]">{locale === "ar" ? "التالي" : "Next"}</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
