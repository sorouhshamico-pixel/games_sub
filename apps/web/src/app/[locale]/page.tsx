import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ApiError, getCategories, listProducts } from "@/lib/api";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();

  let popularProducts: Awaited<ReturnType<typeof listProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let loadError = false;

  try {
    [popularProducts, categories] = await Promise.all([
      listProducts({ page: 1 }),
      getCategories(locale as Locale),
    ]);
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/20 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-14">
        <h1 className="max-w-2xl text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">{t("home.heroSubtitle")}</p>
        <Link
          href="/games"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-5 text-base font-medium text-white transition-colors hover:brightness-110"
        >
          {t("home.heroCta")}
        </Link>
      </section>

      {categories.length > 0 ? (
        <section aria-label={t("home.popularGames")}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={{ pathname: "/games", query: { category: category.slug } }}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm text-[var(--color-text-primary)] hover:border-brand-primary/60"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">{t("home.popularGames")}</h2>
        {loadError ? (
          <ErrorState title={t("common.errorGeneric")} />
        ) : popularProducts && popularProducts.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {popularProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("common.empty")} />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">{t("home.trustTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TrustCard title={t("home.trustDelivery")} />
          <TrustCard title={t("home.trustSecurity")} />
          <TrustCard title={t("home.trustSupport")} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">{t("home.faqTitle")}</h2>
        <Link
          href="/pages/faq"
          className="inline-block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:border-brand-primary/60"
        >
          {t("home.faqTitle")} →
        </Link>
      </section>
    </div>
  );
}

function TrustCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-medium text-[var(--color-text-primary)]">
      {title}
    </div>
  );
}
