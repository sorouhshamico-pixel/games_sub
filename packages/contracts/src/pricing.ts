import { z } from "zod";
import { SupportedCurrency } from "./enums";

// All monetary amounts are integer minor units (e.g. halalas for SAR) —
// never floating point. See docs/ARCHITECTURE.md#money.
export const moneySchema = z.object({
  amountMinorUnits: z.number().int(),
  currency: z.nativeEnum(SupportedCurrency),
});
export type Money = z.infer<typeof moneySchema>;

// Snapshot persisted on OrderItem so historical orders never change when
// a product's price/tax/name is edited later.
export const priceBreakdownSchema = z.object({
  providerCost: moneySchema.nullable(),
  baseCost: moneySchema,
  marginAppliedMinorUnits: z.number().int(),
  listPrice: moneySchema,
  discount: moneySchema.nullable(),
  taxRateBasisPoints: z.number().int().min(0).max(10000),
  taxAmount: moneySchema,
  total: moneySchema,
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;

export function computePriceBreakdown(input: {
  baseCostMinorUnits: number;
  currency: SupportedCurrency;
  marginBasisPoints: number;
  discountMinorUnits?: number;
  taxRateBasisPoints: number;
  providerCostMinorUnits?: number | null;
}): PriceBreakdown {
  const {
    baseCostMinorUnits,
    currency,
    marginBasisPoints,
    discountMinorUnits = 0,
    taxRateBasisPoints,
    providerCostMinorUnits = null,
  } = input;

  const margin = Math.round((baseCostMinorUnits * marginBasisPoints) / 10000);
  const listPrice = baseCostMinorUnits + margin;
  const afterDiscount = Math.max(0, listPrice - discountMinorUnits);
  const taxAmount = Math.round((afterDiscount * taxRateBasisPoints) / 10000);
  const total = afterDiscount + taxAmount;

  return {
    providerCost:
      providerCostMinorUnits === null ? null : { amountMinorUnits: providerCostMinorUnits, currency },
    baseCost: { amountMinorUnits: baseCostMinorUnits, currency },
    marginAppliedMinorUnits: margin,
    listPrice: { amountMinorUnits: listPrice, currency },
    discount: discountMinorUnits > 0 ? { amountMinorUnits: discountMinorUnits, currency } : null,
    taxRateBasisPoints,
    taxAmount: { amountMinorUnits: taxAmount, currency },
    total: { amountMinorUnits: total, currency },
  };
}

// Order-level coupon discount, applied on top of any item-level discounts
// already baked into computePriceBreakdown. Known simplification: this does
// not recompute per-item tax against the post-coupon subtotal (tax is fixed
// at the item level before the coupon is known) — see docs/PRICING.md.
export function computeCouponDiscountMinorUnits(input: {
  discountType: "percentage" | "fixed";
  discountValue: number; // basis points if percentage, minor units if fixed
  eligibleSubtotalMinorUnits: number;
}): number {
  const { discountType, discountValue, eligibleSubtotalMinorUnits } = input;
  const raw =
    discountType === "percentage" ? Math.round((eligibleSubtotalMinorUnits * discountValue) / 10000) : discountValue;
  return Math.min(Math.max(raw, 0), eligibleSubtotalMinorUnits);
}
