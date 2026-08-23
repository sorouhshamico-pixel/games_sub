import { Body, Controller, Get, NotFoundException, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { prisma, UserRole } from "@gcc-store/db";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../auth/request-user";
import { InvoicingService } from "../invoicing/invoicing.service";
import { AdminOrdersService } from "./admin-orders.service";
import { ListOrdersQueryDto } from "./dto/list-orders.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@ApiTags("admin")
@Controller("admin/orders")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.FINANCE, UserRole.SUPPORT, UserRole.READ_ONLY_ANALYST)
export class AdminOrdersController {
  constructor(
    private readonly invoicingService: InvoicingService,
    private readonly adminOrdersService: AdminOrdersService,
  ) {}

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
        invoice: true,
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

    const invoiceQrCodeDataUri = order.invoice ? await this.invoicingService.buildQrImageDataUri(order.invoice, order) : null;

    return { ...order, notifications, invoiceQrCodeDataUri };
  }

  @Patch(":id/status")
  // FINANCE and READ_ONLY_ANALYST deliberately excluded — this is a
  // fulfillment/support resolution action, not a money one (refunds already
  // have their own endpoint/role check), and READ_ONLY_ANALYST is read-only
  // by name. Method-level @Roles() replaces the class-level list entirely
  // (RolesGuard uses getAllAndOverride), it doesn't add to it.
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: AuthenticatedRequest) {
    return this.adminOrdersService.updateStatus(id, dto.toStatus, dto.reason, req.user!.id);
  }
}
