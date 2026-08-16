import { setRequestLocale } from "next-intl/server";
import { formatMoney } from "@gcc-store/ui";
import type { Locale } from "@gcc-store/i18n";
import { Link, redirect } from "@/i18n/navigation";
import { ApiError, getAdminProducts } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let result: Awaited<ReturnType<typeof getAdminProducts>> | null = null;
  let forbidden = false;
  try {
    result = await getAdminProducts({}, { cookieHeader });
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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "المنتجات" : "Products"}</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white">
          {locale === "ar" ? "+ منتج جديد" : "+ New product"}
        </Link>
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "ar" ? "لا توجد منتجات بعد." : "No products yet."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
              <tr>
                <th className="p-3 text-start">{locale === "ar" ? "الاسم" : "Name"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "الفئة" : "Category"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
                <th className="p-3 text-start">{locale === "ar" ? "من سعر" : "From"}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((product) => {
                const translation = product.translations.find((t) => t.locale === typedLocale) ?? product.translations[0];
                const cheapest = product.variants.length > 0 ? Math.min(...product.variants.map((v) => v.baseCostMinorUnits)) : null;
                const currency = product.variants[0]?.currency ?? "SAR";
                return (
                  <tr key={product.id} className="border-t border-[var(--color-border)]">
                    <td className="p-3">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-brand-primary hover:underline">
                        {translation?.name ?? product.slug}
                      </Link>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {typedLocale === "ar" ? product.category.nameAr : product.category.nameEn}
                    </td>
                    <td className="p-3 text-[var(--color-text-primary)]">{product.status}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {cheapest !== null ? formatMoney(cheapest, currency, typedLocale) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
