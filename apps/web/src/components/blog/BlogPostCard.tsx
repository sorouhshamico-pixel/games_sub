import Image from "next/image";
import { Clock } from "lucide-react";
import type { BlogPostSummary } from "@gcc-store/contracts";
import type { Locale } from "@gcc-store/i18n";
import { Link } from "@/i18n/navigation";
import { HoverCard } from "@/components/motion";
import { getBlogCategoryMeta } from "@/lib/blogCategories";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function BlogPostCard({ post, locale }: { post: BlogPostSummary; locale: Locale }) {
  const meta = getBlogCategoryMeta(post.categorySlug);

  return (
    <HoverCard className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-brand-primary/50"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-surface-elevated)]">
          {meta ? (
            <>
              <Image src={meta.coverImage} alt="" fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute top-2 start-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {locale === "ar" ? meta.ar : meta.en}
              </span>
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
