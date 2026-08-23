import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import type { BlogPostSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";
import { getBlogCategoryMeta } from "@/lib/blogCategories";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function BlogPostCard({ post, locale, featured = false }: { post: BlogPostSummary; locale: Locale; featured?: boolean }) {
  const meta = getBlogCategoryMeta(post.categorySlug);

  return (
    <HoverCard className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--color-surface)] transition-colors ${
          featured ? "border-brand-primary/40 hover:border-brand-primary/70" : "border-[var(--color-border)] hover:border-brand-primary/50"
        }`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-surface-elevated)]">
          {meta ? (
            <>
              <Image
                src={meta.coverImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Diagonal light sweep on hover — same micro-interaction
                  used on product cards, so cards across the site feel
                  like one family. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="absolute top-2 start-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {locale === "ar" ? meta.ar : meta.en}
              </span>
              {featured ? (
                <span className="absolute top-2 end-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-brand-primary/40">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {locale === "ar" ? "مميز" : "Featured"}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="line-clamp-2 font-bold text-[var(--color-text-primary)]">{post.title}</p>
          <p className="line-clamp-2 grow text-sm text-[var(--color-text-muted)]">{post.excerpt}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {locale === "ar" ? `${post.readingMinutes} دقائق` : `${post.readingMinutes} min read`}
            </span>
            <span>{formatDate(post.publishAt, locale)}</span>
          </div>
        </div>
      </Link>
    </HoverCard>
  );
}
