import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@gcc-store/i18n";
import { redirect } from "@/i18n/navigation";
import { ApiError, getAdminProduct } from "@/lib/api";
import { getServerCookieHeader } from "@/lib/server-cookies";
import { ProductAdminPanel } from "@/components/admin/ProductAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  const cookieHeader = await getServerCookieHeader();
  let product: Awaited<ReturnType<typeof getAdminProduct>> | null = null;
  let forbidden = false;
  let notFound = false;
  try {
    product = await getAdminProduct(id, { cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect({ href: "/login", locale: typedLocale });
    if (error instanceof ApiError && error.status === 403) forbidden = true;
    else if (error instanceof ApiError && error.status === 404) notFound = true;
    else throw error;
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You don't have permission to view this page"}
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-[var(--color-text-muted)]">
        {locale === "ar" ? "المنتج غير موجود" : "Product not found"}
      </div>
    );
  }

  const translation = product.translations.find((t) => t.locale === typedLocale) ?? product.translations[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{product.slug}</p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{translation?.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{translation?.description}</p>
      </div>

      <ProductAdminPanel product={product} />

      {product.inputDefinitions.length > 0 ? (
        <section>
          <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">
            {locale === "ar" ? "الحقول المطلوبة عند الشراء" : "Required checkout fields"}
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            {product.inputDefinitions.map((field) => (
              <li key={field.id}>{typedLocale === "ar" ? field.labelAr : field.labelEn} ({field.key})</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
