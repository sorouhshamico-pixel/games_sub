import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../auth/request-user";
import { AdminCouponsService } from "./admin-coupons.service";
import { CreateCouponDto, UpdateCouponDto } from "./dto/create-coupon.dto";

const COUPON_EDITOR_ROLES = [UserRole.SUPER_ADMIN, UserRole.FINANCE] as const;
const COUPON_VIEWER_ROLES = [...COUPON_EDITOR_ROLES, UserRole.CATALOG_MANAGER, UserRole.READ_ONLY_ANALYST] as const;

@ApiTags("admin-coupons")
@Controller("admin/coupons")
@UseGuards(SessionAuthGuard, RolesGuard)
export class AdminCouponsController {
  constructor(private readonly couponsService: AdminCouponsService) {}

  @Get()
  @Roles(...COUPON_VIEWER_ROLES)
  listCoupons() {
    return this.couponsService.listCoupons();
  }

  @Get(":id")
  @Roles(...COUPON_VIEWER_ROLES)
  getCoupon(@Param("id") id: string) {
    return this.couponsService.getCoupon(id);
  }

  @Post()
  @Roles(...COUPON_EDITOR_ROLES)
  createCoupon(@Body() dto: CreateCouponDto, @Req() req: AuthenticatedRequest) {
    return this.couponsService.createCoupon(dto, req.user!.id);
  }

  @Patch(":id")
  @Roles(...COUPON_EDITOR_ROLES)
  updateCoupon(@Param("id") id: string, @Body() dto: UpdateCouponDto, @Req() req: AuthenticatedRequest) {
    return this.couponsService.updateCoupon(id, dto, req.user!.id);
  }

  @Delete(":id")
  @Roles(...COUPON_EDITOR_ROLES)
  deactivateCoupon(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.couponsService.deactivateCoupon(id, req.user!.id);
  }
}
