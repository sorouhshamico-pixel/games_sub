import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma, OrderStatus, FulfillmentStatus, UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

const REVENUE_STATUSES = [OrderStatus.PAID, OrderStatus.FULFILLMENT_QUEUED, OrderStatus.PROCESSING, OrderStatus.PARTIALLY_FULFILLED, OrderStatus.COMPLETED];

function itemTotal(priceSnapshotJson: unknown, quantity: number): number {
  const total = (priceSnapshotJson as { total?: { amountMinorUnits?: number } } | null)?.total?.amountMinorUnits;
  return total ? total * quantity : 0;
}

@ApiTags("admin")
@Controller("admin/dashboard")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.FINANCE, UserRole.READ_ONLY_ANALYST)
export class DashboardController {
  @Get()
  async getDashboard(@Query() query: DashboardQueryDto) {
    const windowDays = query.days;
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const [ordersByStatus, paidOrdersAgg, fulfillmentByStatus, providerBalances, revenueOrders] = await Promise.all([
      prisma.order.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
      prisma.order.aggregate({
        _sum: { totalMinorUnits: true },
        _count: { _all: true },
        where: { createdAt: { gte: since }, status: { in: REVENUE_STATUSES } },
      }),
      prisma.fulfillment.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
      prisma.provider.findMany({
        select: {
          code: true,
          name: true,
          balanceSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      }),
      // Fetched raw (not groupBy) and bucketed in JS below — Prisma has no
      // portable "group by day" or "aggregate a JSON field" primitive, and
      // this dataset is demo-scale, so a $queryRaw isn't worth the
      // Postgres-specific SQL it'd lock this endpoint into.
      prisma.order.findMany({
        where: { createdAt: { gte: since }, status: { in: REVENUE_STATUSES } },
        select: {
          createdAt: true,
          totalMinorUnits: true,
          items: { select: { productNameSnapshot: true, quantity: true, priceSnapshotJson: true } },
        },
      }),
    ]);

    const totalFulfillments = fulfillmentByStatus.reduce((sum, row) => sum + row._count._all, 0);
    const succeeded = fulfillmentByStatus.find((row) => row.status === FulfillmentStatus.SUCCEEDED)?._count._all ?? 0;

    // Daily revenue — every day in the window gets an entry, even ones with
    // zero orders, so the frontend can render a continuous chart without
    // its own gap-filling logic.
    const dailyRevenue = new Map<string, number>();
    for (let i = 0; i < windowDays; i += 1) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dailyRevenue.set(day, 0);
    }
    for (const order of revenueOrders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + order.totalMinorUnits);
    }

    const productRevenue = new Map<string, number>();
    for (const order of revenueOrders) {
      for (const item of order.items) {
        const amount = itemTotal(item.priceSnapshotJson, item.quantity);
        productRevenue.set(item.productNameSnapshot, (productRevenue.get(item.productNameSnapshot) ?? 0) + amount);
      }
    }
    const topProducts = [...productRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenueMinorUnits]) => ({ name, revenueMinorUnits }));

    return {
      windowDays,
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
      dailyRevenue: [...dailyRevenue.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, totalMinorUnits]) => ({ date, totalMinorUnits })),
      topProducts,
    };
  }
}
