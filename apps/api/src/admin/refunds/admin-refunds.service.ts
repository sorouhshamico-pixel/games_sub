import { randomUUID } from "node:crypto";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, OrderStatus, PaymentStatus, OrderStateMachine, recordNotification, recordAuditLog } from "@gcc-store/db";
import { PAYMENT_GATEWAY, type PaymentGateway } from "../../payments/payment-gateway.interface";
import { getStoreSetting } from "../settings/admin-settings.service";
import type { CreateRefundDto } from "./dto/create-refund.dto";

// Orders can only move to REFUND_PENDING from one of these — see
// docs/ORDER_STATE_MACHINE.md. Anything else (still PENDING_PAYMENT, already
// REFUNDED, ...) isn't a valid place to start a refund from.
export const REFUNDABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.FULFILLMENT_QUEUED,
  OrderStatus.PROCESSING,
  OrderStatus.PARTIALLY_FULFILLED,
  OrderStatus.COMPLETED,
  OrderStatus.FAILED,
  OrderStatus.MANUAL_REVIEW,
];

const orderStateMachine = new OrderStateMachine();

@Injectable()
export class AdminRefundsService {
  constructor(@Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway) {}

  async createRefund(orderId: string, dto: CreateRefundDto, adminUserId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true, refunds: true },
    });
    if (!order) throw new NotFoundException("Order not found");

    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(`Order in status ${order.status} cannot be refunded`);
    }

    // Configurable via /admin/settings — no configured window means no
    // enforcement (the previous, always-eligible behavior), same as every
    // other optional AppSetting defaulting to "off" until an admin sets it.
    const refundWindowDays = await getStoreSetting("refundWindowDays");
    if (refundWindowDays !== null) {
      const windowEnd = new Date(order.createdAt.getTime() + refundWindowDays * 24 * 60 * 60 * 1000);
      if (Date.now() > windowEnd.getTime()) {
        throw new BadRequestException(`This order is outside the ${refundWindowDays}-day refund window`);
      }
    }

    const payment = order.payments.find((p) => p.status === PaymentStatus.CAPTURED || p.status === PaymentStatus.PARTIALLY_REFUNDED);
    if (!payment) throw new BadRequestException("Order has no captured payment to refund");

    const alreadyRefunded = order.refunds
      .filter((r) => r.status === "succeeded")
      .reduce((sum, r) => sum + r.amountMinorUnits, 0);
    const refundable = payment.amountMinorUnits - alreadyRefunded;

    const requestedAmount = dto.amountMinorUnits ?? refundable;
    if (requestedAmount <= 0 || requestedAmount > refundable) {
      throw new BadRequestException(`Requested amount must be between 1 and ${refundable} minor units (already refunded: ${alreadyRefunded})`);
    }

    const correlationId = randomUUID();
    const fromStatus = order.status;

    const refund = await prisma.$transaction(async (tx) => {
      const created = await tx.refund.create({
        data: {
          orderId: order.id,
          paymentId: payment.id,
          amountMinorUnits: requestedAmount,
          reason: dto.reason,
          status: "pending",
          requestedByUserId: adminUserId,
        },
      });
      await orderStateMachine.transition(tx, order.id, fromStatus, OrderStatus.REFUND_PENDING, { type: "admin", id: adminUserId }, dto.reason, correlationId);
      await recordAuditLog(tx, {
        actorUserId: adminUserId,
        action: "order.refund_requested",
        entityType: "Order",
        entityId: order.id,
        metadata: { amountMinorUnits: requestedAmount, reason: dto.reason },
      });
      return created;
    });

    // Real network call to the gateway — deliberately outside the DB
    // transaction above, same pattern as CheckoutService.checkout's
    // createPaymentIntent call.
    const gatewayResult = await this.gateway.refund(payment.gatewayReference ?? "", requestedAmount);

    if (!gatewayResult.success) {
      await prisma.refund.update({ where: { id: refund.id }, data: { status: "failed" } });
      // Order stays in REFUND_PENDING — a legitimate resting state for an
      // admin to investigate or retry, not silently reverted.
      return { ...refund, status: "failed" as const };
    }

    const newTotalRefunded = alreadyRefunded + requestedAmount;
    const isFullyRefunded = newTotalRefunded >= payment.amountMinorUnits;

    await prisma.$transaction(async (tx) => {
      await tx.refund.update({ where: { id: refund.id }, data: { status: "succeeded" } });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: isFullyRefunded ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED },
      });
      await orderStateMachine.transition(
        tx,
        order.id,
        OrderStatus.REFUND_PENDING,
        isFullyRefunded ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED,
        { type: "system" },
        "gateway_refund_succeeded",
        correlationId,
      );
      await recordNotification(tx, {
        userId: order.userId,
        templateKey: "refund_issued",
        payload: { orderId: order.id, orderNumber: order.orderNumber, amountMinorUnits: requestedAmount, recipientEmail: order.guestEmail },
      });
    });

    return { ...refund, status: "succeeded" as const };
  }
}
