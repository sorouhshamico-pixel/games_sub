import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Prisma, ProductLifecycleStatus } from "@gcc-store/db";
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto/create-category.dto";
import type { CreateProductDto, CreateVariantDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";
import type { UpdateVariantDto } from "./dto/update-variant.dto";

@Injectable()
export class AdminCatalogService {
  // --- Categories -----------------------------------------------------

  listCategories() {
    return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Category slug "${dto.slug}" already exists`);

    return prisma.category.create({
      data: { slug: dto.slug, nameAr: dto.nameAr, nameEn: dto.nameEn, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.getCategoryOrThrow(id);
    return prisma.category.update({ where: { id }, data: dto });
  }

  /** Deactivates rather than deletes — categories may be referenced by existing products. */
  async deactivateCategory(id: string) {
    await this.getCategoryOrThrow(id);
    return prisma.category.update({ where: { id }, data: { isActive: false } });
  }

  private async getCategoryOrThrow(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  // --- Products ---------------------------------------------------------

  async listProducts(params: { page: number; pageSize: number; status?: ProductLifecycleStatus; categoryId?: string }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { translations: true, category: true, variants: true },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, page: params.page, pageSize: params.pageSize, total };
  }

  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { translations: true, category: true, variants: true, inputDefinitions: true },
    });
    if (!product || product.deletedAt) throw new NotFoundException("Product not found");
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const existing = await prisma.product.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Product slug "${dto.slug}" already exists`);

    const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException("categoryId does not reference an existing category");

    if (dto.gameBrandId) {
      const brand = await prisma.gameBrand.findUnique({ where: { id: dto.gameBrandId } });
      if (!brand) throw new BadRequestException("gameBrandId does not reference an existing game brand");
    }

    const skus = dto.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) throw new BadRequestException("Variant SKUs must be unique within the product");
    const conflictingSkus = await prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true } });
    if (conflictingSkus.length > 0) {
      throw new ConflictException(`SKU(s) already in use: ${conflictingSkus.map((v) => v.sku).join(", ")}`);
    }

    return prisma.product.create({
      data: {
        slug: dto.slug,
        type: dto.type,
        categoryId: dto.categoryId,
        gameBrandId: dto.gameBrandId,
        imageUrl: dto.imageUrl,
        refundEligible: dto.refundEligible ?? false,
        refundPolicyAr: dto.refundPolicyAr,
        refundPolicyEn: dto.refundPolicyEn,
        fulfillmentEtaMinutes: dto.fulfillmentEtaMinutes,
        status: ProductLifecycleStatus.DRAFT,
        translations: { create: dto.translations },
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            nameAr: v.nameAr,
            nameEn: v.nameEn,
            currency: v.currency,
            baseCostMinorUnits: v.baseCostMinorUnits,
            marginBasisPoints: v.marginBasisPoints ?? 0,
            discountMinorUnits: v.discountMinorUnits ?? 0,
            taxRateBasisPoints: v.taxRateBasisPoints ?? 1500,
            minQuantityPerOrder: v.minQuantityPerOrder ?? 1,
            maxQuantityPerOrder: v.maxQuantityPerOrder ?? 10,
          })),
        },
        inputDefinitions: dto.inputDefinitions
          ? {
              create: dto.inputDefinitions.map((f, index) => ({
                key: f.key,
                labelAr: f.labelAr,
                labelEn: f.labelEn,
                helpTextAr: f.helpTextAr,
                helpTextEn: f.helpTextEn,
                fieldType: f.fieldType,
                required: f.required ?? true,
                regex: f.regex,
                minLength: f.minLength,
                maxLength: f.maxLength,
                normalize: f.normalize ?? "trim",
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { translations: true, variants: true, inputDefinitions: true },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProduct(id);

    if (dto.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException("categoryId does not reference an existing category");
    }

    return prisma.product.update({
      where: { id },
      data: {
        type: dto.type,
        categoryId: dto.categoryId,
        gameBrandId: dto.gameBrandId,
        imageUrl: dto.imageUrl,
        refundEligible: dto.refundEligible,
        refundPolicyAr: dto.refundPolicyAr,
        refundPolicyEn: dto.refundPolicyEn,
        fulfillmentEtaMinutes: dto.fulfillmentEtaMinutes,
        status: dto.status,
      },
      include: { translations: true, variants: true, inputDefinitions: true },
    });
  }

  /** Soft delete — a Product may be referenced by historical OrderItems via its variants. */
  async softDeleteProduct(id: string) {
    await this.getProduct(id);
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductLifecycleStatus.RETIRED },
    });
  }

  // --- Variants -----------------------------------------------------------

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.getProduct(productId);

    const existing = await prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`SKU "${dto.sku}" already in use`);

    return prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        currency: dto.currency,
        baseCostMinorUnits: dto.baseCostMinorUnits,
        marginBasisPoints: dto.marginBasisPoints ?? 0,
        discountMinorUnits: dto.discountMinorUnits ?? 0,
        taxRateBasisPoints: dto.taxRateBasisPoints ?? 1500,
        minQuantityPerOrder: dto.minQuantityPerOrder ?? 1,
        maxQuantityPerOrder: dto.maxQuantityPerOrder ?? 10,
      },
    });
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException("Variant not found");

    return prisma.productVariant.update({
      where: { id: variantId },
      data: {
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        currency: dto.currency,
        baseCostMinorUnits: dto.baseCostMinorUnits,
        marginBasisPoints: dto.marginBasisPoints,
        discountMinorUnits: dto.discountMinorUnits,
        taxRateBasisPoints: dto.taxRateBasisPoints,
        minQuantityPerOrder: dto.minQuantityPerOrder,
        maxQuantityPerOrder: dto.maxQuantityPerOrder,
        isActive: dto.isActive,
      },
    });
  }

  /** Deactivates rather than deletes — variants may be referenced by historical OrderItems. */
  async deactivateVariant(variantId: string) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException("Variant not found");
    return prisma.productVariant.update({ where: { id: variantId }, data: { isActive: false } });
  }
}
