import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getBrands, getCategories, listProducts } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

export default async function GamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();
  const { category, search } = await searchParams;

  let loadError = false;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let brands: Awaited<ReturnType<typeof getBrands>> = [];
  let products: Awaited<ReturnType<typeof listProducts>> | null = null;

  try {
    [categories, brands, products] = await Promise.all([
      getCategories(typedLocale),
      getBrands(),
      listProducts({ category, search, locale: typedLocale }),
    ]);
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("nav.games")}</h1>
        {search ? (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {locale === "ar" ? `نتائج البحث عن "${search}"` : `Search results for "${search}"`}{" "}
            <Link href="/games" className="font-medium text-brand-secondary hover:underline">
              {locale === "ar" ? "مسح" : "clear"}
            </Link>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2" role="navigation" aria-label={t("nav.games")}>
        <Link
          href="/games"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !category
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-brand-primary/50"
          }`}
        >
          {locale === "ar" ? "الكل" : "All"}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={{ pathname: "/games", query: { category: c.slug } }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              category === c.slug
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-brand-primary/50"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {brands.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--color-text-primary)]">
            {locale === "ar" ? "الألعاب" : "Games"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/games/${brand.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5"
              >
                {locale === "ar" ? brand.nameAr : brand.nameEn}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        {loadError ? (
          <ErrorState title={t("common.errorGeneric")} />
        ) : products && products.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("common.empty")} />
        )}
      </section>
    </div>
  );
}
