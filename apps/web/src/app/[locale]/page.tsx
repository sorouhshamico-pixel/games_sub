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
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-16">
        <img
          src="https://images.unsplash.com/photo-1756694938594-e760b4bd3bfb?q=75&w=1600&auto=format&fit=crop"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--color-surface)]/70" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 end-0 h-80 w-80 rounded-full bg-brand-secondary/20 blur-3xl"
        />
        <div className="relative">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">{t("home.heroSubtitle")}</p>
          <Link
            href="/games"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand-primary px-7 text-base font-semibold text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            {t("home.heroCta")}
          </Link>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            <TrustBadge icon={<BoltIcon />} label={t("home.trustDelivery")} />
            <TrustBadge icon={<ShieldIcon />} label={t("home.trustSecurity")} />
            <TrustBadge icon={<HeadsetIcon />} label={t("home.trustSupport")} />
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
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
        <h2 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">{t("home.trustTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard icon={<BoltIcon />} title={t("home.trustDelivery")} />
          <FeatureCard icon={<ShieldIcon />} title={t("home.trustSecurity")} />
          <FeatureCard icon={<HeadsetIcon />} title={t("home.trustSupport")} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-8 text-center sm:p-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{t("home.faqTitle")}</h2>
        <Link
          href="/pages/faq"
          className="mt-4 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-brand-primary/60"
        >
          {t("home.faqTitle")} →
        </Link>
      </section>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
      <span className="text-brand-accent">{icon}</span>
      {label}
    </div>
  );
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-brand-primary/40">
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
