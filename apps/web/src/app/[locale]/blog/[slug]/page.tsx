import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, User } from "lucide-react";
import { ApiError, getBlogPost, listBlogPosts } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { getBlogCategoryMeta } from "@/lib/blogCategories";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareButton } from "@/components/blog/ShareButton";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Locale } from "@gcc-store/i18n";

async function loadPost(slug: string, locale: Locale) {
  try {
    return await getBlogPost(slug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await loadPost(slug, locale as Locale);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);
  const t = await getTranslations();

  const post = await loadPost(slug, typedLocale);
  if (!post) notFound();

  const meta = getBlogCategoryMeta(post.categorySlug);

  let related: Awaited<ReturnType<typeof listBlogPosts>>["items"] = [];
  try {
    const relatedResult = await listBlogPosts({ category: post.categorySlug, locale: typedLocale });
    related = relatedResult.items.filter((item) => item.slug !== post.slug).slice(0, 3);
  } catch {
    // Related articles are a nice-to-have — a failed lookup shouldn't
    // break the article page itself.
  }

  return (
    <div>
      <ReadingProgress />

      <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <nav aria-label="breadcrumb" className="text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-text-primary)]">
            {t("nav.home")}
          </Link>
          {" > "}
          <Link href="/blog" className="hover:text-[var(--color-text-primary)]">
            {locale === "ar" ? "المدونة" : "Blog"}
          </Link>
        </nav>

        {meta ? (
          <Reveal>
            <div className="relative">
              <div aria-hidden className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/25 via-brand-secondary/15 to-transparent opacity-70 blur-2xl" />
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                <Image src={meta.coverImage} alt="" fill priority sizes="(min-width: 1024px) 768px, 100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <span className="absolute -bottom-3 start-6 flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--color-surface)]/90 px-3 py-1.5 text-xs font-bold text-brand-primary shadow-xl shadow-black/30 backdrop-blur-md">
                <meta.Icon className="h-3.5 w-3.5" aria-hidden />
                {locale === "ar" ? meta.ar : meta.en}
              </span>
            </div>
          </Reveal>
        ) : null}

        <Reveal>
          <div className="mt-3">
            <h1 className="text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" aria-hidden />
                {locale === "ar" ? "فريق شحنو" : "The Shahnoo Team"}
              </span>
              <span>{formatDate(post.publishAt, typedLocale)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {locale === "ar" ? `${post.readingMinutes} دقائق قراءة` : `${post.readingMinutes} min read`}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="prose-content flex flex-col gap-4 text-[15px] leading-relaxed text-[var(--color-text-muted)] [&_a]:text-brand-primary [&_a]:underline [&_h2]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_strong]:text-[var(--color-text-primary)]">
            <ReactMarkdown>{post.bodyMarkdown}</ReactMarkdown>
          </div>
        </Reveal>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
          <ShareButton locale={typedLocale} title={post.title} />
          <Link href="/blog" className="text-sm font-medium text-brand-secondary hover:underline">
            {locale === "ar" ? "عرض كل المقالات" : "View all articles"} →
          </Link>
        </div>
      </article>

      {related.length > 0 ? (
        <Reveal>
          <section className="mx-auto max-w-7xl px-4 pb-16">
            <SectionHeading title={locale === "ar" ? "مقالات ذات صلة" : "Related articles"} />
            <StaggerContainer className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug}>
                  <BlogPostCard post={item} locale={typedLocale} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}
