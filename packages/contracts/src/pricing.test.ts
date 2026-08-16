import { describe, expect, it } from "vitest";
import { computeCouponDiscountMinorUnits, computePriceBreakdown, validateProductInputValues } from "./index";

describe("computePriceBreakdown", () => {
  it("applies margin, discount, then tax in order", () => {
    const result = computePriceBreakdown({
      baseCostMinorUnits: 1000,
      currency: "SAR",
      marginBasisPoints: 1000, // +10%
      discountMinorUnits: 50,
      taxRateBasisPoints: 1500, // 15%
    });

    expect(result.marginAppliedMinorUnits).toBe(100);
    expect(result.listPrice.amountMinorUnits).toBe(1100);
    expect(result.discount?.amountMinorUnits).toBe(50);
    // (1100 - 50) * 15% = 157.5 -> rounds to 158
    expect(result.taxAmount.amountMinorUnits).toBe(158);
    expect(result.total.amountMinorUnits).toBe(1208);
  });

  it("never produces a negative total when discount exceeds list price", () => {
    const result = computePriceBreakdown({
      baseCostMinorUnits: 100,
      currency: "SAR",
      marginBasisPoints: 0,
      discountMinorUnits: 999,
      taxRateBasisPoints: 1500,
    });

    expect(result.total.amountMinorUnits).toBe(0);
  });
});

describe("computeCouponDiscountMinorUnits", () => {
  it("computes a percentage discount from basis points", () => {
    const result = computeCouponDiscountMinorUnits({
      discountType: "percentage",
      discountValue: 1500, // 15%
      eligibleSubtotalMinorUnits: 2000,
    });
    expect(result).toBe(300);
  });

  it("returns a fixed discount as-is when it fits within the subtotal", () => {
    const result = computeCouponDiscountMinorUnits({
      discountType: "fixed",
      discountValue: 500,
      eligibleSubtotalMinorUnits: 2000,
    });
    expect(result).toBe(500);
  });

  it("caps the discount at the eligible subtotal, never going negative", () => {
    const result = computeCouponDiscountMinorUnits({
      discountType: "fixed",
      discountValue: 5000,
      eligibleSubtotalMinorUnits: 2000,
    });
    expect(result).toBe(2000);
  });
});

describe("validateProductInputValues", () => {
  const schema = [
    {
      key: "playerId",
      labelAr: "معرف اللاعب",
      labelEn: "Player ID",
      type: "text" as const,
      required: true,
      regex: "^[0-9]{6,12}$",
      normalize: "digitsOnly" as const,
    },
  ];

  it("passes for valid input", () => {
    expect(validateProductInputValues(schema, { playerId: "123456" })).toEqual({ valid: true });
  });

  it("flags missing required fields", () => {
    const result = validateProductInputValues(schema, {});
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["playerId"]).toBe("required");
    }
  });

  it("flags values that fail the regex", () => {
    const result = validateProductInputValues(schema, { playerId: "abc" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["playerId"]).toBe("invalid_format");
    }
  });
});
