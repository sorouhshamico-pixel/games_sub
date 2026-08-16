import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminCategories } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { CreateCategoryForm } from "@/components/admin/CreateCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let categories: Awaited<ReturnType<typeof getAdminCategories>> | null = null;
  let forbidden = false;
  try {
    categories = await getAdminCategories({ cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else throw error;
  }

  if (forbidden || !categories) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "الفئات" : "Categories"}</h1>

      <CreateCategoryForm />

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3 text-start">Slug</th>
              <th className="p-3 text-start">{locale === "ar" ? "الاسم بالعربية" : "Arabic"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الاسم بالإنجليزية" : "English"}</th>
              <th className="p-3 text-start">{locale === "ar" ? "الحالة" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-[var(--color-border)]">
                <td className="p-3 font-mono text-xs text-[var(--color-text-primary)]">{category.slug}</td>
                <td className="p-3 text-[var(--color-text-primary)]">{category.nameAr}</td>
                <td className="p-3 text-[var(--color-text-primary)]">{category.nameEn}</td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  {category.isActive ? (locale === "ar" ? "نشطة" : "Active") : locale === "ar" ? "معطّلة" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
