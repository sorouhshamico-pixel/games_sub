import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Gamepad2, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { GameCategoryFilter } from "@/components/games/GameCategoryFilter";
import { BrandSlider } from "@/components/games/BrandSlider";
import { ApiError, getBrands, getCategories, listProducts } from "@/lib/api";
import { AnimatedCounter, Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
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
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -top-16 end-0 h-56 w-56 rounded-full bg-brand-secondary/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 start-1/4 h-48 w-48 rounded-full bg-brand-primary/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span aria-hidden className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                <Gamepad2 className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">{t("nav.games")}</h1>

              {search ? (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {locale === "ar" ? `نتائج البحث عن "${search}"` : `Search results for "${search}"`}{" "}
                  <Link href="/games" className="font-medium text-brand-secondary hover:underline">
                    {locale === "ar" ? "مسح" : "clear"}
                  </Link>
                </p>
              ) : (
                <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
                  {locale === "ar"
                    ? "تصفح كل الألعاب والاشتراكات وبطاقات الهدايا في مكان واحد"
                    : "Browse every game, subscription, and gift card in one place"}
                </p>
              )}

              {products && products.total > 0 ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Sparkles className="h-4 w-4 text-brand-accent" aria-hidden />
                  <AnimatedCounter value={products.total} className="text-lg font-bold text-brand-primary" />
                  {locale === "ar" ? "منتج متاح الآن" : "products available now"}
                </p>
              ) : null}
            </div>

            {/* Second in DOM order so it lands physically on the left,
                as requested — independent of RTL/LTR direction. Reuses
                the three real hero illustrations (one per catalog
                category) in a staggered collage, echoing the blog hero's
                proven layout and directly illustrating "every game,
                subscription, and gift card in one place". */}
            <div className="relative mx-auto hidden h-64 w-full max-w-sm sm:block">
              <div className="absolute start-0 top-0 h-40 w-48 -rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/hero/game-top-up-illustration.png" alt="" fill sizes="200px" className="object-cover" priority />
              </div>
              <div className="absolute bottom-0 end-0 h-40 w-48 rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/hero/digital-subscriptions-illustration.png" alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="absolute end-8 top-6 h-24 w-24 rotate-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/hero/gift-cards-illustration.png" alt="" fill sizes="100px" className="object-cover" />
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <GameCategoryFilter categories={categories} activeCategory={category} locale={typedLocale} />

      {brands.length > 0 ? (
        <Reveal>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--color-text-primary)]">
              <Gamepad2 className="h-5 w-5 text-brand-secondary" aria-hidden />
              {locale === "ar" ? "الألعاب" : "Games"}
            </h2>
            <BrandSlider brands={brands} locale={typedLocale} />
          </section>
        </Reveal>
      ) : null}

      <section>
        {loadError ? (
          <ErrorState title={t("common.errorGeneric")} />
        ) : products && products.items.length > 0 ? (
          <>
            <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.items.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
          </>
        ) : (
          <EmptyState title={t("common.empty")} />
        )}
      </section>
    </div>
  );
}
