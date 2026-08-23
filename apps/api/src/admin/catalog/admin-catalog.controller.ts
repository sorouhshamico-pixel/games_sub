import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../auth/request-user";
import { AdminCatalogService } from "./admin-catalog.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/create-category.dto";
import { CreateProductDto, CreateVariantDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { ListAdminProductsQueryDto } from "./dto/list-admin-products.dto";

const CATALOG_EDITOR_ROLES = [UserRole.SUPER_ADMIN, UserRole.CATALOG_MANAGER] as const;

@ApiTags("admin-catalog")
@Controller("admin/catalog")
@UseGuards(SessionAuthGuard, RolesGuard)
export class AdminCatalogController {
  constructor(private readonly catalogService: AdminCatalogService) {}

  @Get("categories")
  @Roles(...CATALOG_EDITOR_ROLES, UserRole.READ_ONLY_ANALYST)
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Post("categories")
  @Roles(...CATALOG_EDITOR_ROLES)
  createCategory(@Body() dto: CreateCategoryDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.createCategory(dto, req.user!.id);
  }

  @Patch("categories/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.updateCategory(id, dto, req.user!.id);
  }

  @Delete("categories/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  deactivateCategory(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.catalogService.deactivateCategory(id, req.user!.id);
  }

  @Get("products")
  @Roles(...CATALOG_EDITOR_ROLES, UserRole.READ_ONLY_ANALYST)
  listProducts(@Query() query: ListAdminProductsQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Get("products/:id")
  @Roles(...CATALOG_EDITOR_ROLES, UserRole.READ_ONLY_ANALYST)
  getProduct(@Param("id") id: string) {
    return this.catalogService.getProduct(id);
  }

  @Post("products")
  @Roles(...CATALOG_EDITOR_ROLES)
  createProduct(@Body() dto: CreateProductDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.createProduct(dto, req.user!.id);
  }

  @Patch("products/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  updateProduct(@Param("id") id: string, @Body() dto: UpdateProductDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.updateProduct(id, dto, req.user!.id);
  }

  @Delete("products/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  softDeleteProduct(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.catalogService.softDeleteProduct(id, req.user!.id);
  }

  @Post("products/:id/variants")
  @Roles(...CATALOG_EDITOR_ROLES)
  createVariant(@Param("id") productId: string, @Body() dto: CreateVariantDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.createVariant(productId, dto, req.user!.id);
  }

  @Patch("variants/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  updateVariant(@Param("id") variantId: string, @Body() dto: UpdateVariantDto, @Req() req: AuthenticatedRequest) {
    return this.catalogService.updateVariant(variantId, dto, req.user!.id);
  }

  @Delete("variants/:id")
  @Roles(...CATALOG_EDITOR_ROLES)
  deactivateVariant(@Param("id") variantId: string, @Req() req: AuthenticatedRequest) {
    return this.catalogService.deactivateVariant(variantId, req.user!.id);
  }
}
