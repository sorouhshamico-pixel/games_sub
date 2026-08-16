import { OrderStatus, type Prisma } from "../generated/client";

// Explicit allow-list of transitions — see docs/ORDER_STATE_MACHINE.md.
// Anything not listed here is rejected, so a bad webhook or a retried job
// can never silently push an order into an inconsistent state. Framework
// agnostic (no NestJS import) so both apps/api and apps/worker can share it.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  PENDING_PAYMENT: [OrderStatus.PAYMENT_REVIEW, OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED],
  PAYMENT_REVIEW: [OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED],
  PAID: [OrderStatus.FULFILLMENT_QUEUED, OrderStatus.REFUND_PENDING],
  FULFILLMENT_QUEUED: [OrderStatus.PROCESSING, OrderStatus.MANUAL_REVIEW],
  PROCESSING: [
    OrderStatus.PARTIALLY_FULFILLED,
    OrderStatus.COMPLETED,
    OrderStatus.MANUAL_REVIEW,
    OrderStatus.FAILED,
  ],
  PARTIALLY_FULFILLED: [OrderStatus.COMPLETED, OrderStatus.MANUAL_REVIEW, OrderStatus.REFUND_PENDING],
  MANUAL_REVIEW: [OrderStatus.COMPLETED, OrderStatus.PARTIALLY_FULFILLED, OrderStatus.FAILED, OrderStatus.REFUND_PENDING],
  COMPLETED: [OrderStatus.REFUND_PENDING],
  FAILED: [OrderStatus.REFUND_PENDING, OrderStatus.CANCELLED],
  CANCELLED: [],
  REFUND_PENDING: [OrderStatus.PARTIALLY_REFUNDED, OrderStatus.REFUNDED],
  PARTIALLY_REFUNDED: [OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED],
  REFUNDED: [],
};

export class InvalidOrderTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot transition order from ${from} to ${to}`);
    this.name = "InvalidOrderTransitionError";
  }
}

export interface TransitionActor {
  type: "system" | "customer" | "admin" | "provider";
  id?: string;
}

export class OrderStateMachine {
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /** Must run inside the same Prisma transaction as any side effects (e.g. OutboxEvent). */
  async transition(
    tx: Prisma.TransactionClient,
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    actor: TransitionActor,
    reason: string | null,
    correlationId: string,
  ): Promise<void> {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new InvalidOrderTransitionError(fromStatus, toStatus);
    }

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: fromStatus },
      data: { status: toStatus },
    });

    // updateMany matched zero rows: another process already moved this
    // order off `fromStatus` (concurrent webhook/retry) — fail loudly
    // rather than overwrite state we didn't expect.
    if (updated.count === 0) {
      throw new InvalidOrderTransitionError(fromStatus, toStatus);
    }

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus,
        toStatus,
        actorType: actor.type,
        actorId: actor.id,
        reason,
        correlationId,
      },
    });
  }
}
