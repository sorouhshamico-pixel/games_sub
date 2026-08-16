import { BadRequestException, Injectable } from "@nestjs/common";
import type { Prisma } from "@gcc-store/db";
import { computeCouponDiscountMinorUnits } from "@gcc-store/contracts";

interface CouponRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxRedemptions: number | null;
  maxRedemptionsPerCustomer: number | null;
  minOrderAmountMinorUnits: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
}

@Injectable()
export class CouponService {
  /**
   * Validates a coupon code and returns the discount to apply. Must run
   * inside the same transaction as order creation: locks the Coupon row
   * with FOR UPDATE so two concurrent checkouts racing on the same code
   * serialize around the maxRedemptions check instead of both slipping
   * past it (same pattern as digital code reservation in the worker).
   */
  async applyCoupon(
    tx: Prisma.TransactionClient,
    code: string,
    params: { eligibleSubtotalMinorUnits: number; guestEmail?: string },
  ): Promise<{ couponId: string; code: string; discountMinorUnits: number }> {
    const normalizedCode = code.trim().toUpperCase();
    const rows = await tx.$queryRaw<CouponRow[]>`
      SELECT id, code, "discountType", "discountValue", "maxRedemptions",
             "maxRedemptionsPerCustomer", "minOrderAmountMinorUnits", "startsAt", "endsAt", "isActive"
      FROM coupons
      WHERE code = ${normalizedCode}
      FOR UPDATE
    `;
    const coupon = rows[0];
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException("Invalid or inactive coupon code");
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException("This coupon is not active yet");
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      throw new BadRequestException("This coupon has expired");
    }
    if (coupon.minOrderAmountMinorUnits !== null && params.eligibleSubtotalMinorUnits < coupon.minOrderAmountMinorUnits) {
      throw new BadRequestException("This order does not meet the coupon's minimum amount");
    }

    if (coupon.maxRedemptions !== null) {
      const totalRedemptions = await tx.couponRedemption.count({ where: { couponId: coupon.id } });
      if (totalRedemptions >= coupon.maxRedemptions) {
        throw new BadRequestException("This coupon has reached its redemption limit");
      }
    }

    if (coupon.maxRedemptionsPerCustomer !== null) {
      if (!params.guestEmail) {
        throw new BadRequestException("An email address is required to use this coupon");
      }
      const customerRedemptions = await tx.couponRedemption.count({
        where: { couponId: coupon.id, order: { guestEmail: params.guestEmail } },
      });
      if (customerRedemptions >= coupon.maxRedemptionsPerCustomer) {
        throw new BadRequestException("You have already used this coupon the maximum number of times");
      }
    }

    const discountMinorUnits = computeCouponDiscountMinorUnits({
      discountType: coupon.discountType as "percentage" | "fixed",
      discountValue: coupon.discountValue,
      eligibleSubtotalMinorUnits: params.eligibleSubtotalMinorUnits,
    });

    return { couponId: coupon.id, code: coupon.code, discountMinorUnits };
  }
}
