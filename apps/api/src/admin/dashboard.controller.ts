import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma, OrderStatus, FulfillmentStatus, UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("admin")
@Controller("admin/dashboard")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.FINANCE, UserRole.READ_ONLY_ANALYST)
export class DashboardController {
  @Get()
  async getDashboard() {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [ordersByStatus, paidOrdersAgg, fulfillmentByStatus, providerBalances] = await Promise.all([
      prisma.order.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt: { gte: since30d } } }),
      prisma.order.aggregate({
        _sum: { totalMinorUnits: true },
        _count: { _all: true },
        where: { createdAt: { gte: since30d }, status: { in: [OrderStatus.PAID, OrderStatus.FULFILLMENT_QUEUED, OrderStatus.PROCESSING, OrderStatus.PARTIALLY_FULFILLED, OrderStatus.COMPLETED] } },
      }),
      prisma.fulfillment.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt: { gte: since30d } } }),
      prisma.provider.findMany({
        select: {
          code: true,
          name: true,
          balanceSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      }),
    ]);

    const totalFulfillments = fulfillmentByStatus.reduce((sum, row) => sum + row._count._all, 0);
    const succeeded = fulfillmentByStatus.find((row) => row.status === FulfillmentStatus.SUCCEEDED)?._count._all ?? 0;

    return {
      windowDays: 30,
      revenue: {
        totalMinorUnits: paidOrdersAgg._sum.totalMinorUnits ?? 0,
        orderCount: paidOrdersAgg._count._all,
      },
      ordersByStatus: Object.fromEntries(ordersByStatus.map((row) => [row.status, row._count._all])),
      fulfillment: {
        successRatePercent: totalFulfillments > 0 ? Math.round((succeeded / totalFulfillments) * 1000) / 10 : null,
        byStatus: Object.fromEntries(fulfillmentByStatus.map((row) => [row.status, row._count._all])),
      },
      providers: providerBalances.map((provider) => ({
        code: provider.code,
        name: provider.name,
        latestBalance: provider.balanceSnapshots[0]
          ? { balanceMinorUnits: provider.balanceSnapshots[0].balanceMinorUnits, currency: provider.balanceSnapshots[0].currency, capturedAt: provider.balanceSnapshots[0].capturedAt }
          : null,
      })),
    };
  }
}
