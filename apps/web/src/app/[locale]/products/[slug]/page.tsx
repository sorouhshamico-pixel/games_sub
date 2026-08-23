import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Gamepad2, Gift, Headset, HelpCircle, PlayCircle, RefreshCw, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { ProductCard } from "@/components/ProductCard";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { ApiError, getProductBySlug, listProducts } from "@/lib/api";
import { demoDiscountFor } from "@/lib/discount";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

// Same three category identities as the games listing hero (icon, accent,
// "instant" wording) so a product page doesn't introduce a fourth visual
// language of its own — this is scoped locally since the listing page's
// version also carries hero-only fields (subtitle, background image).
const categoryMeta: Record<
  string,
  { Icon: typeof Gamepad2; text: string; glow: string; ring: string; labelAr: string; labelEn: string }
> = {
  "game-topups": {
    Icon: Gamepad2,
    text: "text-brand-primary",
    glow: "bg-brand-primary/20",
    ring: "shadow-brand-primary/30",
    labelAr: "شحن فوري",
    labelEn: "Instant top-up",
  },
  subscriptions: {
    Icon: PlayCircle,
    text: "text-brand-secondary",
    glow: "bg-brand-secondary/20",
    ring: "shadow-brand-secondary/30",
    labelAr: "تفعيل فوري",
    labelEn: "Instant activation",
  },
  "gift-cards": {
    Icon: Gift,
    text: "text-brand-accent",
    glow: "bg-brand-accent/20",
    ring: "shadow-brand-accent/30",
    labelAr: "تسليم فوري",
    labelEn: "Instant delivery",
  },
};

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
  const identifierHelp = locale === "ar" ? product.identifierHelpAr : product.identifierHelpEn;
  const meta = categoryMeta[product.categorySlug] ?? categoryMeta["game-topups"]!;
  // Same id-based discount every ProductCard for this product already
  // shows in listings/related grids — without this the "-X%" ribbon a
  // shopper clicked through from would just vanish on this page.
  const discountPercent = demoDiscountFor(product.id);

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

      <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="transition-colors hover:text-[var(--color-text-primary)]">
          {t("nav.home")}
        </Link>
        <span aria-hidden>/</span>
        <Link href="/games" className="transition-colors hover:text-[var(--color-text-primary)]">
          {t("nav.games")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-text-primary)]">{name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div>
            <div className="relative">
              <div aria-hidden className={`pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] opacity-60 blur-3xl ${meta.glow}`} />
              <div className={`aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-surface-elevated)] shadow-2xl ${meta.ring}`}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <ProductImagePlaceholder label={name.slice(0, 1)} labelClassName="text-4xl" />
                )}
              </div>
              <span
                className={`absolute -bottom-3 start-5 flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--color-surface)]/90 px-3 py-1.5 text-xs font-bold shadow-xl shadow-black/30 backdrop-blur-md ${meta.text}`}
              >
                <meta.Icon className="h-3.5 w-3.5" aria-hidden />
                {locale === "ar" ? meta.labelAr : meta.labelEn}
              </span>
              <span className="absolute top-3 start-5 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-black/30">
                -{discountPercent}%
              </span>
            </div>

            <div className="mt-8 flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">{name}</h1>
              {product.isDemoData ? (
                <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                  {locale === "ar" ? "تجريبي" : "Demo"}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                {locale === "ar" ? "أمن وموثوق" : "Safe & trusted"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                <Headset className="h-3.5 w-3.5 text-brand-secondary" aria-hidden />
                {locale === "ar" ? "دعم 24/7" : "24/7 support"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                {product.refundEligible ? (
                  <RefreshCw className="h-3.5 w-3.5 text-brand-accent" aria-hidden />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden />
                )}
                {product.refundEligible
                  ? locale === "ar"
                    ? "قابل للاسترجاع"
                    : "Refundable"
                  : locale === "ar"
                    ? "غير قابل للاسترجاع"
                    : "Non-refundable"}
              </span>
            </div>

            {description ? (
              <div className="mt-6">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                  <Sparkles className="h-4 w-4 text-brand-accent" aria-hidden />
                  {locale === "ar" ? "وصف المنتج" : "Product description"}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
              </div>
            ) : null}

            {identifierHelp ? (
              <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                  <HelpCircle className="h-4 w-4 text-brand-primary" aria-hidden />
                  {locale === "ar" ? "كيف أجد المعرّف المطلوب؟" : "How do I find the required ID?"}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{identifierHelp}</p>
              </div>
            ) : null}
          </div>
        </Reveal>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 lg:sticky lg:top-24">
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      {relatedItems.length > 0 ? (
        <Reveal>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)]">
              <Sparkles className="h-5 w-5 text-brand-accent" aria-hidden />
              {locale === "ar" ? "منتجات ذات صلة" : "Related products"}
            </h2>
            <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {relatedItems.map((item) => (
                <StaggerItem key={item.id}>
                  <ProductCard product={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}
