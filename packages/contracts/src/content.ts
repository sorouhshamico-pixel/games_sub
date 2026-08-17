import { z } from "zod";

export const pageContentSchema = z.object({
  slug: z.string(),
  title: z.string(),
  bodyMarkdown: z.string(),
});
export type PageContent = z.infer<typeof pageContentSchema>;

export const blogPostSummarySchema = z.object({
  slug: z.string(),
  categorySlug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  readingMinutes: z.number().int().positive(),
  publishAt: z.string().nullable(),
});
export type BlogPostSummary = z.infer<typeof blogPostSummarySchema>;

export const blogPostDetailSchema = blogPostSummarySchema.extend({
  bodyMarkdown: z.string(),
});
export type BlogPostDetail = z.infer<typeof blogPostDetailSchema>;
