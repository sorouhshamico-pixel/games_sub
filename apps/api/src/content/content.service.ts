import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@gcc-store/db";
import type { PageContent } from "@gcc-store/contracts";

@Injectable()
export class ContentService {
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
}
