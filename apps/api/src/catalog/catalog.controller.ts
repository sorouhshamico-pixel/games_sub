import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import { ListProductsQueryDto } from "./dto/list-products.dto";

@ApiTags("catalog")
@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("categories")
  listCategories(@Query("locale") locale: "ar" | "en" = "ar") {
    return this.catalogService.listCategories(locale === "en" ? "en" : "ar");
  }

  @Get("products")
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Get("products/:slug")
  getProduct(@Param("slug") slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
