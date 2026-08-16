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
}
