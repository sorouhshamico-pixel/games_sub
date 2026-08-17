import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ContentService } from "./content.service";

@ApiTags("content")
@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("pages/:slug")
  getPage(@Param("slug") slug: string, @Query("locale") locale: "ar" | "en" = "ar") {
    return this.contentService.getPage(slug, locale === "en" ? "en" : "ar");
  }

  @Get("blog")
  listBlogPosts(
    @Query("locale") locale: "ar" | "en" = "ar",
    @Query("category") category?: string,
    @Query("page") page?: string,
  ) {
    return this.contentService.listBlogPosts(locale === "en" ? "en" : "ar", {
      category,
      page: page ? Math.max(1, Number(page) || 1) : 1,
    });
  }

  @Get("blog/:slug")
  getBlogPost(@Param("slug") slug: string, @Query("locale") locale: "ar" | "en" = "ar") {
    return this.contentService.getBlogPost(slug, locale === "en" ? "en" : "ar");
  }
}
