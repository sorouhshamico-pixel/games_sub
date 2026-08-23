import { randomUUID } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, OrderStatus, OrderStateMachine, InvalidOrderTransitionError, recordNotification, recordAuditLog } from "@gcc-store/db";

// Curated subset of what the state machine *allows* — see
// docs/ORDER_STATE_MACHINE.md's "what's not built yet" note calling out
// MANUAL_REVIEW having no resolution UI, plus letting an admin kill a
// stuck/abandoned order. Deliberately excludes PAID, FULFILLMENT_QUEUED,
// PROCESSING, and REFUND_PENDING/REFUNDED — those belong exclusively to the
// payment webhook, fulfillment worker, and refund flow respectively; a
// manual override there would desync invoicing/refund logic that assumes
// those transitions came from a real captured payment or gateway call.
const ADMIN_MANUAL_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.DRAFT]: [OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CANCELLED],
  [OrderStatus.FAILED]: [OrderStatus.CANCELLED],
  [OrderStatus.MANUAL_REVIEW]: [OrderStatus.COMPLETED, OrderStatus.PARTIALLY_FULFILLED, OrderStatus.FAILED],
};

const orderStateMachine = new OrderStateMachine();

@Injectable()
export class AdminOrdersService {
  async updateStatus(orderId: string, toStatus: OrderStatus, reason: string, adminUserId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Order not found");

    const allowedTargets = ADMIN_MANUAL_TRANSITIONS[order.status] ?? [];
    if (!allowedTargets.includes(toStatus)) {
      throw new BadRequestException(`Order in status ${order.status} cannot be manually moved to ${toStatus}`);
    }

    const correlationId = randomUUID();

    try {
      await prisma.$transaction(async (tx) => {
        await orderStateMachine.transition(tx, orderId, order.status, toStatus, { type: "admin", id: adminUserId }, reason, correlationId);
        await recordAuditLog(tx, {
          actorUserId: adminUserId,
          action: "order.status_changed",
          entityType: "Order",
          entityId: orderId,
          metadata: { fromStatus: order.status, toStatus, reason },
        });

        if (toStatus === OrderStatus.COMPLETED || toStatus === OrderStatus.FAILED) {
          await recordNotification(tx, {
            userId: order.userId,
            templateKey: toStatus === OrderStatus.COMPLETED ? "order_completed" : "order_failed",
            payload: { orderId: order.id, orderNumber: order.orderNumber, recipientEmail: order.guestEmail },
          });
        }
      });
    } catch (error) {
      // The state machine throws if another process (worker, webhook) moved
      // the order off the status we read a moment ago — a real concurrent
      // edit, not a bug, so it maps to 409 rather than a generic 500.
      if (error instanceof InvalidOrderTransitionError) {
        throw new ConflictException("This order's status changed since it was loaded — refresh and try again");
      }
      throw error;
    }

    return { id: orderId, status: toStatus };
  }
}
