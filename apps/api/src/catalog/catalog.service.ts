import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@gcc-store/db";
import {
  computePriceBreakdown,
  type GameBrandDetail,
  type GameBrandSummary,
  type ProductDetail,
  type ProductInputSchema,
  type ProductSummary,
  type SupportedCurrency,
} from "@gcc-store/contracts";
import type { ListProductsQueryDto } from "./dto/list-products.dto";

@Injectable()
export class CatalogService {
  async listCategories(locale: "ar" | "en") {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return categories.map((c) => ({
      slug: c.slug,
      name: locale === "ar" ? c.nameAr : c.nameEn,
    }));
  }

  async listBrands(): Promise<GameBrandSummary[]> {
    const brands = await prisma.gameBrand.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
    });
    return brands.map((b) => ({
      slug: b.slug,
      nameAr: b.nameAr,
      nameEn: b.nameEn,
      logoUrl: b.logoUrl,
    }));
  }

  async getBrandBySlug(slug: string): Promise<GameBrandDetail> {
    const brand = await prisma.gameBrand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: "ACTIVE", deletedAt: null },
          include: { translations: true, category: true, variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    if (!brand || !brand.isActive) {
      throw new NotFoundException("Game brand not found");
    }

    return {
      slug: brand.slug,
      nameAr: brand.nameAr,
      nameEn: brand.nameEn,
      logoUrl: brand.logoUrl,
      bannerUrl: brand.bannerUrl,
      descriptionAr: brand.descriptionAr ?? "",
      descriptionEn: brand.descriptionEn ?? "",
      identifierHelpAr: brand.identifierHelpAr,
      identifierHelpEn: brand.identifierHelpEn,
      products: brand.products.map((product) => this.toProductSummary(product)),
    };
  }

  async listProducts(query: ListProductsQueryDto): Promise<{ items: ProductSummary[]; page: number; pageSize: number; total: number }> {
    const where = {
      status: "ACTIVE" as const,
      deletedAt: null,
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search
        ? {
            translations: {
              some: {
                locale: query.locale,
                name: { contains: query.search, mode: "insensitive" as const },
              },
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { translations: true, category: true, variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((product) => this.toProductSummary(product)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: true,
        category: true,
        gameBrand: true,
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        inputDefinitions: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product || product.status !== "ACTIVE" || product.deletedAt) {
      throw new NotFoundException("Product not found");
    }

    const inputSchema: ProductInputSchema = product.inputDefinitions.map((field) => ({
      key: field.key,
      labelAr: field.labelAr,
      labelEn: field.labelEn,
      helpTextAr: field.helpTextAr ?? undefined,
      helpTextEn: field.helpTextEn ?? undefined,
      type: field.fieldType as "text" | "number" | "select" | "email",
      required: field.required,
      regex: field.regex ?? undefined,
      minLength: field.minLength ?? undefined,
      maxLength: field.maxLength ?? undefined,
      options: (field.optionsJson as ProductInputSchema[number]["options"]) ?? undefined,
      normalize: field.normalize as "trim" | "trimAndUppercase" | "digitsOnly",
    }));

    return {
      ...this.toProductSummary(product),
      descriptionAr: product.translations.find((t) => t.locale === "ar")?.description ?? "",
      descriptionEn: product.translations.find((t) => t.locale === "en")?.description ?? "",
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        nameAr: variant.nameAr,
        nameEn: variant.nameEn,
        listPriceMinorUnits: this.computeListPrice(variant),
        currency: variant.currency,
        isActive: variant.isActive,
        minQuantityPerOrder: variant.minQuantityPerOrder,
        maxQuantityPerOrder: variant.maxQuantityPerOrder,
      })),
      inputSchema,
      refundEligible: product.refundEligible,
      refundPolicyAr: product.refundPolicyAr ?? "",
      refundPolicyEn: product.refundPolicyEn ?? "",
      identifierHelpAr: product.gameBrand?.identifierHelpAr ?? undefined,
      identifierHelpEn: product.gameBrand?.identifierHelpEn ?? undefined,
    } satisfies ProductDetail;
  }

  private computeListPrice(variant: {
    baseCostMinorUnits: number;
    marginBasisPoints: number;
    discountMinorUnits: number;
    taxRateBasisPoints: number;
    currency: SupportedCurrency;
  }): number {
    const breakdown = computePriceBreakdown({
      baseCostMinorUnits: variant.baseCostMinorUnits,
      currency: variant.currency,
      marginBasisPoints: variant.marginBasisPoints,
      discountMinorUnits: variant.discountMinorUnits,
      taxRateBasisPoints: variant.taxRateBasisPoints,
    });
    return breakdown.total.amountMinorUnits;
  }

  private toProductSummary(
    product: {
      id: string;
      slug: string;
      type: string;
      imageUrl: string | null;
      isDemoData: boolean;
      category: { slug: string };
      translations: { locale: string; name: string }[];
      variants: {
        baseCostMinorUnits: number;
        marginBasisPoints: number;
        discountMinorUnits: number;
        taxRateBasisPoints: number;
        currency: SupportedCurrency;
      }[];
    },
  ): ProductSummary {
    const nameAr = product.translations.find((t) => t.locale === "ar")?.name ?? "";
    const nameEn = product.translations.find((t) => t.locale === "en")?.name ?? "";
    const cheapestVariant = product.variants
      .map((v) => this.computeListPrice(v))
      .sort((a, b) => a - b)[0];

    return {
      id: product.id,
      slug: product.slug,
      type: product.type as ProductSummary["type"],
      nameAr,
      nameEn,
      categorySlug: product.category.slug,
      imageUrl: product.imageUrl,
      fromPriceMinorUnits: cheapestVariant ?? 0,
      currency: product.variants[0]?.currency ?? "SAR",
      isDemoData: product.isDemoData,
    };
  }
}
