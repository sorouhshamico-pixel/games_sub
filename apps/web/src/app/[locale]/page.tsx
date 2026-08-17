import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getBrands, getCategories, listProducts } from "@/lib/api";
import { HomeHero } from "@/components/home/HomeHero";
import { Reveal, StaggerContainer, StaggerItem, HoverCard, AnimatedCounter } from "@/components/motion";
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
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10">
      <HomeHero title={t("home.heroTitle")} subtitle={t("home.heroSubtitle")} ctaLabel={t("home.heroCta")} trustItems={trustItems} />

      {categories.length > 0 ? (
        <Reveal>
          <section aria-label={t("home.popularGames")}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={{ pathname: "/games", query: { category: category.slug } }}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5"
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

      {brands.length > 0 ? (
        <Reveal>
          <section aria-label={locale === "ar" ? "الألعاب المتوفرة" : "Available games"}>
            <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
              {locale === "ar" ? "الألعاب المتوفرة" : "Available games"}
            </h2>
            {/* Native horizontal scroll (not a JS drag library) — cheapest
                possible way to get real touch-drag momentum, mouse-wheel,
                and keyboard scrolling all at once, with snap points. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/games/${brand.slug}`}
                  className="flex shrink-0 snap-start items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60"
                >
                  {locale === "ar" ? brand.nameAr : brand.nameEn}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{t("home.popularGames")}</h2>
          <Link href="/games" className="text-sm font-medium text-brand-secondary hover:underline">
            {t("nav.games")} →
          </Link>
        </div>
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

      <section>
        <h2 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">{t("home.trustTitle")}</h2>
        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          <StaggerItem>
            <HoverCard>
              <FeatureCard icon={<BoltIcon />} title={t("home.trustDelivery")} />
            </HoverCard>
          </StaggerItem>
          <StaggerItem>
            <HoverCard>
              <FeatureCard icon={<ShieldIcon />} title={t("home.trustSecurity")} />
            </HoverCard>
          </StaggerItem>
          <StaggerItem>
            <HoverCard>
              <FeatureCard icon={<HeadsetIcon />} title={t("home.trustSupport")} />
            </HoverCard>
          </StaggerItem>
        </StaggerContainer>

        {popularProducts && popularProducts.total > 0 ? (
          <Reveal className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "ar" ? "أكثر من" : "Over"}{" "}
              <AnimatedCounter value={popularProducts.total} className="text-lg font-bold text-brand-primary" />{" "}
              {locale === "ar" ? "خيار شحن متاح الآن" : "top-up options available now"}
            </p>
          </Reveal>
        ) : null}
      </section>

      <Reveal>
        <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{t("home.faqTitle")}</h2>
          <Link
            href="/pages/faq"
            className="mt-4 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60"
          >
            {t("home.faqTitle")} →
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-brand-primary/40">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
    </div>
  );
}

function BoltIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinejoin="round" d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path strokeLinecap="round" d="M19 19v.5a3 3 0 0 1-3 3h-2.5" />
    </svg>
  );
}
