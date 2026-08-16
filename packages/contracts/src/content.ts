import { z } from "zod";

export const pageContentSchema = z.object({
  slug: z.string(),
  title: z.string(),
  bodyMarkdown: z.string(),
});
export type PageContent = z.infer<typeof pageContentSchema>;
