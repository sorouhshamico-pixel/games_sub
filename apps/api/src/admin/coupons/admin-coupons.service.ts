import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@gcc-store/db";
import type { CreateCouponDto, UpdateCouponDto } from "./dto/create-coupon.dto";

@Injectable()
export class AdminCouponsService {
  listCoupons() {
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  async getCoupon(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException("Coupon not found");
    return coupon;
  }

  async createCoupon(dto: CreateCouponDto) {
    this.validateDiscountValue(dto.discountType, dto.discountValue);
    this.validateDateWindow(dto.startsAt, dto.endsAt);

    const code = dto.code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Coupon code "${code}" already exists`);

    return prisma.coupon.create({
      data: {
        code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxRedemptions: dto.maxRedemptions,
        maxRedemptionsPerCustomer: dto.maxRedemptionsPerCustomer,
        minOrderAmountMinorUnits: dto.minOrderAmountMinorUnits,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.getCoupon(id);
    const discountType = dto.discountType ?? (coupon.discountType as "percentage" | "fixed");
    const discountValue = dto.discountValue ?? coupon.discountValue;
    this.validateDiscountValue(discountType, discountValue);
    this.validateDateWindow(
      dto.startsAt ?? coupon.startsAt?.toISOString(),
      dto.endsAt ?? coupon.endsAt?.toISOString(),
    );

    return prisma.coupon.update({
      where: { id },
      data: {
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxRedemptions: dto.maxRedemptions,
        maxRedemptionsPerCustomer: dto.maxRedemptionsPerCustomer,
        minOrderAmountMinorUnits: dto.minOrderAmountMinorUnits,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  /** Deactivates rather than deletes — coupons are referenced by historical Orders/CouponRedemptions. */
  async deactivateCoupon(id: string) {
    await this.getCoupon(id);
    return prisma.coupon.update({ where: { id }, data: { isActive: false } });
  }

  private validateDiscountValue(discountType: string, discountValue: number) {
    if (discountType === "percentage" && discountValue > 100_00) {
      throw new BadRequestException("Percentage discount cannot exceed 10000 basis points (100%)");
    }
  }

  private validateDateWindow(startsAt?: string, endsAt?: string) {
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new BadRequestException("startsAt must be before endsAt");
    }
  }
}
