import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getCategories, listProducts } from "@/lib/api";
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
  let loadError = false;

  try {
    [popularProducts, categories] = await Promise.all([listProducts({ page: 1 }), getCategories(typedLocale)]);
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10">
        <HomeHero
          titlePrefix={t("home.heroTitlePrefix")}
          titleHighlight={t("home.heroTitleHighlight")}
          subtitle={t("home.heroSubtitle")}
          ctaLabel={t("home.heroCta")}
        />

        {categories.length > 0 ? (
          <Reveal>
            <section aria-label={locale === "ar" ? "تصفح حسب الفئة" : "Browse by category"}>
              <SectionHeading title={locale === "ar" ? "تصفح حسب الفئة" : "Browse by category"} />
              <CategoryTiles categories={categories} locale={typedLocale} />
            </section>
          </Reveal>
        ) : null}

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
            <BrandTiles locale={typedLocale} />
          </section>
        </Reveal>

        <MostRequested locale={typedLocale} />

        {popularProducts && popularProducts.items.length > 0 ? (
          <LimitedOffers products={popularProducts.items.slice(0, 4)} locale={typedLocale} />
        ) : null}

        <Reveal>
          <section className="relative">
            {/* Physical left-1/2 (not logical start-1/2) — centering via a
                translateX(-50%) counter-shift is a physical operation, so
                pairing it with a logical inset flips the math in RTL and
                pushes this off-screen instead of centering it. */}
            <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-64 w-[80%] -translate-x-1/2 rounded-full bg-brand-primary/5 blur-3xl" />
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
        </Reveal>

        <ProcessSteps locale={typedLocale} />

        <StatStrip locale={typedLocale} />

        <Testimonials locale={typedLocale} />

        <FaqPreview locale={typedLocale} />

        <NewsletterSignup locale={typedLocale} />
      </div>
    </div>
  );
}
