import { Controller, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma, UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ListOrdersQueryDto } from "./dto/list-orders.dto";

@ApiTags("admin")
@Controller("admin/orders")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.FINANCE, UserRole.SUPPORT, UserRole.READ_ONLY_ANALYST)
export class AdminOrdersController {
  @Get()
  async list(@Query() query: ListOrdersQueryDto) {
    const where = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          currency: true,
          totalMinorUnits: true,
          guestEmail: true,
          guestPhone: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, page: query.page, pageSize: query.pageSize, total };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { variant: true, fulfillments: { include: { providerTransactions: true } } } },
        payments: { include: { attempts: true } },
        statusEvents: { orderBy: { createdAt: "asc" } },
        refunds: true,
      },
    });

    if (!order) throw new NotFoundException("Order not found");

    // Notification has no orderId column (it's addressed by userId, since a
    // real provider would send to a person, not an order) — payloadJson
    // always carries orderId though, so a JSON-path filter finds the ones
    // about this order. See docs/NOTIFICATIONS.md.
    const notifications = await prisma.notification.findMany({
      where: { payloadJson: { path: ["orderId"], equals: id } },
      orderBy: { createdAt: "asc" },
    });

    return { ...order, notifications };
  }
}
