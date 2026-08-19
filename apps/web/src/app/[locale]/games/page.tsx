import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Gamepad2, Gift, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { GameCategoryFilter } from "@/components/games/GameCategoryFilter";
import { BrandSlider } from "@/components/games/BrandSlider";
import { ApiError, getBrands, getCategories, listProducts } from "@/lib/api";
import { AnimatedCounter, Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

// Each catalog category gets its own hero identity — icon, accent color,
// real image, and copy — instead of the same fixed 3-photo collage
// showing regardless of which filter is active. "All" (no category) is
// the only state that shows all three images together; picking a
// specific category swaps in a single, larger, differently-framed image
// so the hero visibly reacts to what's selected.
const categoryHero: Record<
  string,
  {
    Icon: typeof Gamepad2;
    color: "primary" | "secondary" | "accent";
    image: string;
    titleAr: string;
    titleEn: string;
    badgeAr: string;
    badgeEn: string;
    subtitleAr: string;
    subtitleEn: string;
  }
> = {
  "game-topups": {
    Icon: Gamepad2,
    color: "primary",
    image: "/images/hero/game-top-up-illustration.png",
    // Same wording as the footer's quick links, so the category name
    // doesn't drift into a second phrasing depending on where it appears.
    titleAr: "شحن الألعاب",
    titleEn: "Game top-ups",
    badgeAr: "شحن فوري",
    badgeEn: "Instant top-up",
    subtitleAr: "اشحن رصيدك في أي لعبة خلال ثوانٍ، بأمان وسهولة تامة",
    subtitleEn: "Top up your balance in any game within seconds, safely and easily",
  },
  subscriptions: {
    Icon: PlayCircle,
    color: "secondary",
    image: "/images/hero/digital-subscriptions-illustration.png",
    titleAr: "الاشتراكات الرقمية",
    titleEn: "Digital subscriptions",
    badgeAr: "تفعيل فوري",
    badgeEn: "Instant activation",
    subtitleAr: "فعّل اشتراكاتك الرقمية المفضلة بسهولة وأمان تام",
    subtitleEn: "Activate your favorite digital subscriptions easily and securely",
  },
  "gift-cards": {
    Icon: Gift,
    color: "accent",
    image: "/images/hero/gift-cards-illustration.png",
    titleAr: "بطاقات الهدايا",
    titleEn: "Gift cards",
    badgeAr: "الهدية المثالية",
    badgeEn: "The perfect gift",
    subtitleAr: "بطاقات هدايا رقمية لكل المناسبات، تسليم فوري",
    subtitleEn: "Digital gift cards for every occasion, delivered instantly",
  },
};

// Tailwind needs full class strings present in source to pick them up —
// no dynamic `bg-brand-${color}` interpolation — so the three accent
// options are spelled out here once and looked up by key.
const accentClasses = {
  primary: { badge: "bg-brand-primary/15 text-brand-primary", text: "text-brand-primary", glow: "bg-brand-primary/20", ring: "shadow-brand-primary/30" },
  secondary: { badge: "bg-brand-secondary/15 text-brand-secondary", text: "text-brand-secondary", glow: "bg-brand-secondary/20", ring: "shadow-brand-secondary/30" },
  accent: { badge: "bg-brand-accent/15 text-brand-accent", text: "text-brand-accent", glow: "bg-brand-accent/20", ring: "shadow-brand-accent/30" },
} as const;

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

  const activeHero = category ? categoryHero[category] : undefined;
  const accent = accentClasses[activeHero?.color ?? "primary"];
  const HeroIcon = activeHero?.Icon ?? Gamepad2;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
      <Reveal>
        <section
          key={category ?? "all"}
          className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-10"
        >
          <div aria-hidden className={`pointer-events-none absolute -top-16 end-0 h-56 w-56 rounded-full blur-3xl ${accent.glow}`} />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 start-1/4 h-48 w-48 rounded-full bg-brand-primary/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span aria-hidden className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent.badge}`}>
                <HeroIcon className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
                {activeHero ? (locale === "ar" ? activeHero.titleAr : activeHero.titleEn) : t("nav.games")}
              </h1>

              {search ? (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {locale === "ar" ? `نتائج البحث عن "${search}"` : `Search results for "${search}"`}{" "}
                  <Link href="/games" className="font-medium text-brand-secondary hover:underline">
                    {locale === "ar" ? "مسح" : "clear"}
                  </Link>
                </p>
              ) : (
                <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
                  {activeHero
                    ? locale === "ar"
                      ? activeHero.subtitleAr
                      : activeHero.subtitleEn
                    : locale === "ar"
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
                independent of RTL/LTR direction. The hero reacts to the
                active filter instead of showing the same fixed picture no
                matter what's selected: "All" gets the three-photo collage
                (one real image per category), while picking a specific
                category swaps in that category's own image, accent color,
                and a floating badge naming it. */}
            {activeHero ? (
              <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-sm sm:block">
                <div aria-hidden className={`absolute -inset-3 -z-10 rounded-[2rem] opacity-60 blur-2xl ${accent.glow}`} />
                <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${accent.ring}`}>
                  <Image src={activeHero.image} alt="" fill sizes="400px" className="object-cover" priority />
                </div>
                <span
                  className={`absolute -top-3 -end-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--color-surface)]/90 px-3 py-1.5 text-xs font-bold shadow-xl shadow-black/30 backdrop-blur-md ${accent.text}`}
                >
                  <HeroIcon className="h-3.5 w-3.5" aria-hidden />
                  {locale === "ar" ? activeHero.badgeAr : activeHero.badgeEn}
                </span>
              </div>
            ) : (
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
            )}
          </div>
        </section>
      </Reveal>

      <GameCategoryFilter categories={categories} activeCategory={category} locale={typedLocale} />

      {/* Distinct heading per section — the brand list and the results
          grid used to both sit under a heading that just repeated "الألعاب"
          from the hero title above them. */}
      {brands.length > 0 ? (
        <Reveal>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--color-text-primary)]">
              <Gamepad2 className="h-5 w-5 text-brand-secondary" aria-hidden />
              {locale === "ar" ? "تصفح حسب اللعبة" : "Browse by game"}
            </h2>
            <BrandSlider brands={brands} locale={typedLocale} />
          </section>
        </Reveal>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--color-text-primary)]">
          <Sparkles className="h-5 w-5 text-brand-accent" aria-hidden />
          {locale === "ar" ? "النتائج" : "Results"}
        </h2>
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
