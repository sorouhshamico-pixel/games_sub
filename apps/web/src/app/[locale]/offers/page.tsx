import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Tag, TrendingDown, Zap } from "lucide-react";
import { ApiError, listProducts } from "@/lib/api";
import { demoDiscountFor } from "@/lib/discount";
import { OffersCountdown } from "@/components/offers/OffersCountdown";
import { OffersGrid } from "@/components/offers/OffersGrid";
import { Reveal } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "عروض لفترة محدودة" : "Limited-time offers",
    description:
      locale === "ar"
        ? "أفضل خصومات شحنو على شحن الألعاب والاشتراكات وبطاقات الهدايا"
        : "Shahnoo's best discounts on game top-ups, subscriptions, and gift cards",
  };
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

  let loadError = false;
  let products: Awaited<ReturnType<typeof listProducts>> | null = null;
  try {
    products = await listProducts({ locale: typedLocale });
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  const items = products?.items ?? [];
  const bestDiscount = items.reduce((max, product) => Math.max(max, demoDiscountFor(product.id)), 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-danger/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -top-16 end-0 h-56 w-56 rounded-full bg-danger/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 start-1/4 h-48 w-48 rounded-full bg-brand-secondary/15 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <span aria-hidden className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/15 text-danger">
                <Zap className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
                {locale === "ar" ? "عروض لفترة محدودة" : "Limited-time offers"}
              </h1>
              <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
                {locale === "ar"
                  ? "أفضل الخصومات على شحن الألعاب والاشتراكات وبطاقات الهدايا — كل الكتالوج في مكان واحد، مرتب حسب أعلى خصم"
                  : "The best discounts on game top-ups, subscriptions, and gift cards — the whole catalog, sorted by biggest savings first"}
              </p>

              {items.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-medium text-[var(--color-text-primary)]">
                    <Tag className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                    {locale === "ar" ? `${items.length} عرض متاح` : `${items.length} offers available`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 font-bold text-danger">
                    <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                    {locale === "ar" ? `خصم يصل إلى ${bestDiscount}%` : `Up to ${bestDiscount}% off`}
                  </span>
                </div>
              ) : null}
            </div>

            <OffersCountdown />
          </div>
        </section>
      </Reveal>

      {loadError ? (
        <ErrorState title={t("common.errorGeneric")} />
      ) : items.length > 0 ? (
        <section>
          <OffersGrid products={items} />
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t("common.demoDataNotice")}</p>
        </section>
      ) : (
        <EmptyState title={t("common.empty")} />
      )}
    </div>
  );
}
