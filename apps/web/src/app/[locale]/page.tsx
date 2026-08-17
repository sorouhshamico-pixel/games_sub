import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getBrands, getCategories, listProducts } from "@/lib/api";
import { HomeHero } from "@/components/home/HomeHero";
import { SectionHeading } from "@/components/home/SectionHeading";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { BrandTiles } from "@/components/home/BrandTiles";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { StatStrip } from "@/components/home/StatStrip";
import { FaqPreview } from "@/components/home/FaqPreview";
import { LimitedOffers } from "@/components/home/LimitedOffers";
import { MostRequested } from "@/components/home/MostRequested";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { BoltIcon, ShieldIcon, HeadsetIcon } from "@/components/home/icons";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

  let popularProducts: Awaited<ReturnType<typeof listProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let brands: Awaited<ReturnType<typeof getBrands>> = [];
  let loadError = false;

  try {
    [popularProducts, categories, brands] = await Promise.all([
      listProducts({ page: 1 }),
      getCategories(typedLocale),
      getBrands(),
    ]);
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  const trustItems = [
    { icon: <BoltIcon />, label: t("home.trustDelivery") },
    { icon: <ShieldIcon />, label: t("home.trustSecurity") },
    { icon: <HeadsetIcon />, label: t("home.trustSupport") },
  ];

  return (
    <div className="relative">
      {/* Decorative, non-interactive background glow — purely visual, capped
          opacity so it never competes with content or hurts text contrast. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 start-1/4 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute top-1/3 end-0 h-80 w-80 rounded-full bg-brand-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10">
        <HomeHero
          title={t("home.heroTitle")}
          titleHighlight={t("home.heroTitleHighlight")}
          subtitle={t("home.heroSubtitle")}
          ctaLabel={t("home.heroCta")}
          trustItems={trustItems}
        />

        {categories.length > 0 ? (
          <Reveal>
            <section aria-label={locale === "ar" ? "تصفح حسب الفئة" : "Browse by category"}>
              <SectionHeading title={locale === "ar" ? "تصفح حسب الفئة" : "Browse by category"} />
              <CategoryTiles categories={categories} />
            </section>
          </Reveal>
        ) : null}

        {brands.length > 0 ? (
          <Reveal>
            <section aria-label={locale === "ar" ? "الألعاب المتوفرة" : "Available games"}>
              <SectionHeading
                title={locale === "ar" ? "الألعاب المتوفرة" : "Available games"}
                viewAllHref="/games"
                viewAllLabel={t("nav.games")}
              />
              {/* Native horizontal scroll (not a JS drag library) — cheapest
                  possible way to get real touch-drag momentum, mouse-wheel,
                  and keyboard scrolling all at once, with snap points. */}
              <BrandTiles brands={brands} locale={typedLocale} />
            </section>
          </Reveal>
        ) : null}

        <MostRequested locale={typedLocale} />

        {popularProducts && popularProducts.items.length > 0 ? (
          <LimitedOffers products={popularProducts.items.slice(0, 4)} locale={typedLocale} />
        ) : null}

        <section>
          <SectionHeading title={t("home.popularGames")} viewAllHref="/games" viewAllLabel={t("nav.games")} />
          {loadError ? (
            <ErrorState title={t("common.errorGeneric")} />
          ) : popularProducts && popularProducts.items.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {popularProducts.items.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <EmptyState title={t("common.empty")} />
          )}
        </section>

        <ProcessSteps locale={typedLocale} />

        <StatStrip
          locale={typedLocale}
          productCount={popularProducts?.total ?? 0}
          brandCount={brands.length}
          categoryCount={categories.length}
        />

        <Testimonials locale={typedLocale} />

        <FaqPreview locale={typedLocale} />

        <NewsletterSignup locale={typedLocale} />
      </div>
    </div>
  );
}
