import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getBrandBySlug } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

async function loadBrand(slug: string) {
  try {
    return await getBrandBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}): Promise<Metadata> {
  const { locale, brand: brandSlug } = await params;
  const brand = await loadBrand(brandSlug);
  if (!brand) return {};
  const title = locale === "ar" ? brand.nameAr : brand.nameEn;
  const description = (locale === "ar" ? brand.descriptionAr : brand.descriptionEn).slice(0, 160);
  return { title, description };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}) {
  const { locale, brand: brandSlug } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

  const brand = await loadBrand(brandSlug);
  if (!brand) notFound();

  const name = locale === "ar" ? brand.nameAr : brand.nameEn;
  const description = locale === "ar" ? brand.descriptionAr : brand.descriptionEn;
  const identifierHelp = locale === "ar" ? brand.identifierHelpAr : brand.identifierHelpEn;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-text-primary)]">
          {t("nav.home")}
        </Link>
        {" / "}
        <Link href="/games" className="hover:text-[var(--color-text-primary)]">
          {t("nav.games")}
        </Link>
        {" / "}
        <span className="text-[var(--color-text-primary)]">{name}</span>
      </nav>

      <header className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/15 via-[var(--color-surface)] to-brand-secondary/10 p-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{name}</h1>
        {description ? <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">{description}</p> : null}
      </header>

      {identifierHelp ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-2 font-semibold text-[var(--color-text-primary)]">
            {locale === "ar" ? "كيف أجد معرف اللاعب؟" : "How do I find my Player ID?"}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">{identifierHelp}</p>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
          {locale === "ar" ? "المنتجات" : "Products"}
        </h2>
        {brand.products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {brand.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
          </>
        ) : (
          <EmptyState title={t("common.empty")} />
        )}
      </section>
    </div>
  );
}
