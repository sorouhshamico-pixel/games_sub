import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../auth/request-user";
import { AdminRefundsService } from "./admin-refunds.service";
import { CreateRefundDto } from "./dto/create-refund.dto";

@ApiTags("admin-refunds")
@Controller("admin/orders")
@UseGuards(SessionAuthGuard, RolesGuard)
export class AdminRefundsController {
  constructor(private readonly refundsService: AdminRefundsService) {}

  @Post(":id/refund")
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE)
  createRefund(@Param("id") orderId: string, @Body() dto: CreateRefundDto, @Req() req: AuthenticatedRequest) {
    // SessionAuthGuard runs before this and always sets req.user, or throws
    // — the non-null assertion here reflects a guarantee the guard chain
    // already made, not an assumption this handler is making on its own.
    return this.refundsService.createRefund(orderId, dto, req.user!.id);
  }
}
