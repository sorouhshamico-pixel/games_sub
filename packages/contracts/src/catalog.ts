import { z } from "zod";
import { ProductType, SupportedCurrency } from "./enums";
import { productInputSchemaSchema } from "./product-input";

export const productVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  nameAr: z.string(),
  nameEn: z.string(),
  listPriceMinorUnits: z.number().int().nonnegative(),
  currency: z.nativeEnum(SupportedCurrency),
  isActive: z.boolean(),
  minQuantityPerOrder: z.number().int().positive().default(1),
  maxQuantityPerOrder: z.number().int().positive().default(10),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

export const productSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  type: z.nativeEnum(ProductType),
  nameAr: z.string(),
  nameEn: z.string(),
  categorySlug: z.string(),
  imageUrl: z.string().nullable(),
  fromPriceMinorUnits: z.number().int().nonnegative(),
  currency: z.nativeEnum(SupportedCurrency),
  isDemoData: z.boolean().default(false),
});
export type ProductSummary = z.infer<typeof productSummarySchema>;

export const productDetailSchema = productSummarySchema.extend({
  descriptionAr: z.string(),
  descriptionEn: z.string(),
  variants: z.array(productVariantSchema),
  inputSchema: productInputSchemaSchema,
  refundEligible: z.boolean(),
  refundPolicyAr: z.string(),
  refundPolicyEn: z.string(),
  identifierHelpAr: z.string().optional(),
  identifierHelpEn: z.string().optional(),
});
export type ProductDetail = z.infer<typeof productDetailSchema>;
