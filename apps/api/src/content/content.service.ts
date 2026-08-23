import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@gcc-store/db";
import type { PageContent, BlogPostSummary, BlogPostDetail } from "@gcc-store/contracts";
import { getStoreSetting } from "../admin/settings/admin-settings.service";

@Injectable()
export class ContentService {
  /** Only the subset of AppSetting that's safe for an unauthenticated
   * visitor to read — never the whole settings object (future admin-only
   * keys shouldn't need a second thought about what this leaks). */
  async getPublicStoreSettings() {
    const [maintenanceMode, supportEmail, supportPhone] = await Promise.all([
      getStoreSetting("maintenanceMode"),
      getStoreSetting("supportEmail"),
      getStoreSetting("supportPhone"),
    ]);
    return { maintenanceMode, supportEmail, supportPhone };
  }

  async getPage(slug: string, locale: "ar" | "en"): Promise<PageContent> {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: { translations: true },
    });

    if (!page || !page.isPublished) {
      throw new NotFoundException("Page not found");
    }

    const translation = page.translations.find((t) => t.locale === locale) ?? page.translations[0];
    if (!translation) {
      throw new NotFoundException("Page has no content");
    }

    return { slug: page.slug, title: translation.title, bodyMarkdown: translation.bodyMarkdown };
  }

  async listBlogPosts(
    locale: "ar" | "en",
    params: { category?: string; page: number },
  ): Promise<{ items: BlogPostSummary[]; page: number; pageSize: number; total: number }> {
    const pageSize = 20;
    const where = {
      isPublished: true,
      ...(params.category ? { categorySlug: params.category } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { translations: true },
        orderBy: { publishAt: "desc" },
        skip: (params.page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const items = posts
      .map((post) => this.toSummary(post, locale))
      .filter((item): item is BlogPostSummary => item !== null);

    return { items, page: params.page, pageSize, total };
  }

  async getBlogPost(slug: string, locale: "ar" | "en"): Promise<BlogPostDetail> {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { translations: true },
    });

    if (!post || !post.isPublished) {
      throw new NotFoundException("Blog post not found");
    }

    const translation = post.translations.find((t) => t.locale === locale) ?? post.translations[0];
    if (!translation) {
      throw new NotFoundException("Blog post has no content");
    }

    return {
      slug: post.slug,
      categorySlug: post.categorySlug,
      title: translation.title,
      excerpt: translation.excerpt,
      bodyMarkdown: translation.bodyMarkdown,
      readingMinutes: post.readingMinutes,
      publishAt: post.publishAt?.toISOString() ?? null,
    };
  }

  private toSummary(
    post: { slug: string; categorySlug: string; readingMinutes: number; publishAt: Date | null; translations: Array<{ locale: string; title: string; excerpt: string }> },
    locale: "ar" | "en",
  ): BlogPostSummary | null {
    const translation = post.translations.find((t) => t.locale === locale) ?? post.translations[0];
    if (!translation) return null;
    return {
      slug: post.slug,
      categorySlug: post.categorySlug,
      title: translation.title,
      excerpt: translation.excerpt,
      readingMinutes: post.readingMinutes,
      publishAt: post.publishAt?.toISOString() ?? null,
    };
  }
}
