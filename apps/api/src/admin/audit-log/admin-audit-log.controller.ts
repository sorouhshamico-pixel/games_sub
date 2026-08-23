import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma, UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../../auth/guards/session-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { ListAuditLogQueryDto } from "./dto/list-audit-log.dto";

@ApiTags("admin-audit-log")
@Controller("admin/audit-log")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.READ_ONLY_ANALYST)
export class AdminAuditLogController {
  @Get()
  async list(@Query() query: ListAuditLogQueryDto) {
    const where = query.entityType ? { entityType: query.entityType } : {};
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { actor: { select: { email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, page: query.page, pageSize: query.pageSize, total };
  }
}
