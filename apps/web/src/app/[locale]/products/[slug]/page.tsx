import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getProductBySlug, listProducts } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

async function loadProduct(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};
  return {
    title: locale === "ar" ? product.nameAr : product.nameEn,
    description: (locale === "ar" ? product.descriptionAr : product.descriptionEn).slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

  const product = await loadProduct(slug);
  if (!product) notFound();

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;

  let related: Awaited<ReturnType<typeof listProducts>> | null = null;
  try {
    related = await listProducts({ category: product.categorySlug, locale: typedLocale });
  } catch {
    related = null;
  }
  const relatedItems = (related?.items ?? []).filter((item) => item.slug !== product.slug).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku: product.slug,
    offers: product.variants
      .filter((v) => v.isActive)
      .map((variant) => ({
        "@type": "Offer",
        name: locale === "ar" ? variant.nameAr : variant.nameEn,
        price: (variant.listPriceMinorUnits / 100).toFixed(2),
        priceCurrency: variant.currency,
        availability: "https://schema.org/InStock",
      })),
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[var(--color-surface-elevated)]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[var(--color-text-muted)]">
                {name.slice(0, 1)}
              </div>
            )}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[var(--color-text-primary)]">{name}</h1>
          {product.isDemoData ? (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
          ) : null}
          {description ? <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p> : null}
        </div>

        <ProductPurchasePanel product={product} />
      </div>

      {relatedItems.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
            {locale === "ar" ? "منتجات ذات صلة" : "Related products"}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {relatedItems.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
