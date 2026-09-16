import { Body, Controller, Get, NotFoundException, Param, Patch, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { prisma, UserRole, PaymentStatus } from "@gcc-store/db";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../auth/request-user";
import { InvoicingService } from "../invoicing/invoicing.service";
import { toCsv } from "../common/csv";
import { AdminOrdersService } from "./admin-orders.service";
import { REFUNDABLE_STATUSES } from "./refunds/admin-refunds.service";
import { ListOrdersQueryDto } from "./dto/list-orders.dto";
import { ExportOrdersQueryDto } from "./dto/export-orders.dto";
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

  // Must be declared before @Get(":id") — Nest/Express match routes in
  // declaration order, so "export.csv" would otherwise be captured as the
  // :id param instead of reaching this handler.
  @Get("export.csv")
  async exportCsv(@Query() query: ExportOrdersQueryDto, @Res() res: Response) {
    const where = query.status ? { status: query.status } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        status: true,
        currency: true,
        totalMinorUnits: true,
        guestEmail: true,
        guestPhone: true,
        createdAt: true,
      },
    });

    const csv = toCsv(
      ["Order Number", "Status", "Total", "Currency", "Customer Email", "Customer Phone", "Created At (UTC)"],
      orders.map((o) => [o.orderNumber, o.status, (o.totalMinorUnits / 100).toFixed(2), o.currency, o.guestEmail, o.guestPhone, o.createdAt.toISOString()]),
    );

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
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

    // Computed once, server-side, from the same REFUNDABLE_STATUSES the
    // refund endpoint itself enforces — the frontend used to re-derive this
    // (a duplicated status list plus its own captured-payment/already-
    // refunded arithmetic) purely to decide whether to render the refund
    // form. One source of truth now; the two can't drift out of sync.
    const capturedPayment = order.payments.find((p) => p.status === PaymentStatus.CAPTURED || p.status === PaymentStatus.PARTIALLY_REFUNDED);
    const alreadyRefunded = order.refunds.filter((r) => r.status === "succeeded").reduce((sum, r) => sum + r.amountMinorUnits, 0);
    const refundableMinorUnits = REFUNDABLE_STATUSES.includes(order.status) && capturedPayment ? Math.max(0, capturedPayment.amountMinorUnits - alreadyRefunded) : 0;

    return { ...order, notifications, invoiceQrCodeDataUri, refundableMinorUnits };
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
