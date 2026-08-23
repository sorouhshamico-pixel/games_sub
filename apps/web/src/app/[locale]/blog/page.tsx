import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState, ErrorState } from "@gcc-store/ui";
import { BookOpen, Clock, Flame, Search as SearchIcon, Sparkles } from "lucide-react";
import { ApiError, listBlogPosts } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { WhatsAppIcon } from "@/components/home/icons";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { SectionHeading } from "@/components/home/SectionHeading";
import { AnimatedCounter, Reveal, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let posts: Awaited<ReturnType<typeof listBlogPosts>> | null = null;
  let loadError = false;
  try {
    posts = await listBlogPosts({ category, page, locale: typedLocale });
  } catch (error) {
    loadError = error instanceof ApiError;
  }

  const items = posts?.items ?? [];
  const featured = items.slice(0, 2);
  const mostRead = items.slice(0, 4);
  const latest = items.slice(2);
  const hasMore = posts ? page * posts.pageSize < posts.total : false;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-text-primary)]">
          {t("nav.home")}
        </Link>
        {" > "}
        <span className="text-[var(--color-text-primary)]">{locale === "ar" ? "المدونة" : "Blog"}</span>
      </nav>

      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 via-[var(--color-surface)] to-brand-secondary/10 p-8 sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -top-20 end-0 h-64 w-64 rounded-full bg-brand-secondary/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 start-1/4 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span aria-hidden className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                <BookOpen className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
                {locale === "ar" ? "مدونة شحنو" : "The Shahnoo Blog"}
              </h1>
              <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
                {locale === "ar"
                  ? "أدلة ونصائح وعروض تساعدك على شحن ألعابك واختيار اشتراكاتك بثقة"
                  : "Guides, tips, and offers to help you top up your games and pick subscriptions with confidence"}
              </p>
              <div className="relative mt-6 max-w-md">
                <SearchIcon aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="search"
                  placeholder={locale === "ar" ? "ابحث عن دليل أو نصيحة أو اشتراك" : "Search for a guide, tip, or subscription"}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 ps-10 pe-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus-visible:border-brand-primary/60"
                />
              </div>
              {posts && posts.total > 0 ? (
                <p className="mt-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <BookOpen className="h-4 w-4 text-brand-secondary" aria-hidden />
                  <AnimatedCounter value={posts.total} className="text-lg font-bold text-brand-primary" />
                  {locale === "ar" ? "مقالة ودليل متاح الآن" : "articles and guides available now"}
                </p>
              ) : null}
            </div>

            {/* Staggered real-photo collage — reuses the blog category
                cover set rather than needing dedicated hero-only assets. */}
            <div className="relative mx-auto hidden h-64 w-full max-w-sm sm:block">
              <div className="absolute start-0 top-0 h-40 w-48 -rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/blog/mobile-gaming.jpg" alt="" fill sizes="200px" className="object-cover" priority />
              </div>
              <div className="absolute bottom-0 end-0 h-40 w-48 rotate-3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/blog/laptop-relaxing.jpg" alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="absolute end-8 top-6 h-24 w-24 rotate-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src="/images/blog/security-shield.jpg" alt="" fill sizes="100px" className="object-cover" />
              </div>
              <span className="absolute -bottom-3 start-1/4 flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--color-surface)]/90 px-3 py-1.5 text-xs font-bold text-brand-secondary shadow-xl shadow-black/30 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {locale === "ar" ? "محتوى موثوق" : "Trusted content"}
              </span>
            </div>
          </div>
        </section>
      </Reveal>

      {loadError ? (
        <ErrorState title={t("common.errorGeneric")} />
      ) : items.length === 0 ? (
        <EmptyState title={t("common.empty")} />
      ) : (
        <>
          {featured.length > 0 ? (
            <Reveal>
              <StaggerContainer className="grid gap-4 sm:grid-cols-2">
                {featured.map((post) => (
                  <StaggerItem key={post.slug}>
                    <BlogPostCard post={post} locale={typedLocale} featured />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </Reveal>
          ) : null}

          <Reveal>
            <section>
              <SectionHeading title={locale === "ar" ? "تصفح حسب الفئة" : "Browse by category"} />
              <CategoryFilter activeCategory={category} locale={typedLocale} />
            </section>
          </Reveal>

          <Reveal>
            {/* "Most read" first in DOM so it lands on the reading-start
                side (right, in RTL) per direction; "Latest articles"
                (the wider column) second so it lands on the left. */}
            <section className="grid gap-8 lg:grid-cols-3">
              <div>
                <h2 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">
                  {locale === "ar" ? "الأكثر قراءة" : "Most read"}
                </h2>
                <StaggerContainer className="flex flex-col gap-3">
                  {mostRead.map((post, index) => {
                    const isTop = index === 0;
                    return (
                      <StaggerItem key={post.slug}>
                        <HoverCard>
                          <Link
                            href={`/blog/${post.slug}`}
                            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                              isTop
                                ? "border-brand-accent/40 bg-gradient-to-br from-brand-accent/10 to-transparent hover:border-brand-accent/70"
                                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-brand-primary/50"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isTop ? "bg-brand-accent text-[#070B14]" : "bg-brand-primary/15 text-brand-primary"
                              }`}
                            >
                              {isTop ? <Flame className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text-primary)]">{post.title}</p>
                              <span className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                                <Clock className="h-3 w-3" aria-hidden />
                                {locale === "ar" ? `${post.readingMinutes} دقائق` : `${post.readingMinutes} min`}
                              </span>
                            </div>
                          </Link>
                        </HoverCard>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>

              <div className="lg:col-span-2">
                <SectionHeading title={locale === "ar" ? "أحدث المقالات" : "Latest articles"} />
                {latest.length > 0 ? (
                  <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {latest.map((post) => (
                      <StaggerItem key={post.slug}>
                        <BlogPostCard post={post} locale={typedLocale} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">{t("common.empty")}</p>
                )}
                {hasMore ? (
                  <div className="mt-6 flex justify-center">
                    <Link
                      href={{ pathname: "/blog", query: { ...(category ? { category } : {}), page: page + 1 } }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:-translate-y-0.5 hover:border-brand-primary/50"
                    >
                      {locale === "ar" ? "اقرأ المزيد" : "Read more"} →
                    </Link>
                  </div>
                ) : null}
              </div>
            </section>
          </Reveal>
        </>
      )}

      <Reveal>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-8">
            <div aria-hidden className="pointer-events-none absolute -top-10 end-0 -z-10 h-32 w-32 rounded-full bg-brand-primary/20 blur-3xl" />
            <h2 className="relative text-xl font-bold text-[var(--color-text-primary)]">{locale === "ar" ? "جاهز للشحن؟" : "Ready to top up?"}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {locale === "ar" ? "اكتشف الألعاب والعروض وشحن بسرعة وأمان الآن" : "Discover games and offers, and top up fast and safely now"}
            </p>
            <Link
              href="/games"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              {locale === "ar" ? "استكشف الألعاب" : "Explore games"}
            </Link>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <p className="font-semibold text-[var(--color-text-primary)]">
              {locale === "ar" ? "نحن هنا لمساعدتك!" : "We're here to help!"}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "ar" ? "تواصل معنا عبر واتساب وسنرد عليك في أسرع وقت" : "Reach us on WhatsApp and we'll reply as fast as we can"}
            </p>
            <Link
              href="/pages/faq"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden />
              {locale === "ar" ? "تواصل معنا على واتساب" : "Contact us on WhatsApp"}
            </Link>
          </div>
        </section>
      </Reveal>

      <NewsletterSignup locale={typedLocale} />
    </div>
  );
}
