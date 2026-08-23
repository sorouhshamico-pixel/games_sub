import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, recordAuditLog } from "@gcc-store/db";
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

  async createCoupon(dto: CreateCouponDto, adminUserId: string) {
    this.validateDiscountValue(dto.discountType, dto.discountValue);
    this.validateDateWindow(dto.startsAt, dto.endsAt);

    const code = dto.code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Coupon code "${code}" already exists`);

    return prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.create({
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
      await recordAuditLog(tx, { actorUserId: adminUserId, action: "coupon.created", entityType: "Coupon", entityId: coupon.id, metadata: { code: coupon.code } });
      return coupon;
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto, adminUserId: string) {
    const coupon = await this.getCoupon(id);
    const discountType = dto.discountType ?? (coupon.discountType as "percentage" | "fixed");
    const discountValue = dto.discountValue ?? coupon.discountValue;
    this.validateDiscountValue(discountType, discountValue);
    this.validateDateWindow(
      dto.startsAt ?? coupon.startsAt?.toISOString(),
      dto.endsAt ?? coupon.endsAt?.toISOString(),
    );

    return prisma.$transaction(async (tx) => {
      const updated = await tx.coupon.update({
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
      await recordAuditLog(tx, { actorUserId: adminUserId, action: "coupon.updated", entityType: "Coupon", entityId: id, metadata: dto as never });
      return updated;
    });
  }

  /** Deactivates rather than deletes — coupons are referenced by historical Orders/CouponRedemptions. */
  async deactivateCoupon(id: string, adminUserId: string) {
    await this.getCoupon(id);
    return prisma.$transaction(async (tx) => {
      const updated = await tx.coupon.update({ where: { id }, data: { isActive: false } });
      await recordAuditLog(tx, { actorUserId: adminUserId, action: "coupon.deactivated", entityType: "Coupon", entityId: id });
      return updated;
    });
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
