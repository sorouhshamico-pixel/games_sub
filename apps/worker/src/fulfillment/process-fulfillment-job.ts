import { randomUUID } from "node:crypto";
import { prisma, OrderStatus, FulfillmentStatus, ProductType, OrderStateMachine, recordNotification } from "@gcc-store/db";
import type { NotificationTemplateKey } from "@gcc-store/db";
import type { FulfillmentProvider } from "../providers/fulfillment-provider.interface";
import { InsufficientProviderBalanceError, ProviderTimeoutError } from "../providers/fulfillment-provider.interface";
import type { CircuitBreaker } from "../common/circuit-breaker";
import { retryWithBackoff } from "../common/retry";
import { markDigitalCodeSold, releaseDigitalCode, reserveDigitalCode } from "./digital-code-reservation";

const orderStateMachine = new OrderStateMachine();

export interface ProcessFulfillmentJobDeps {
  provider: FulfillmentProvider;
  breaker: CircuitBreaker;
  retryOptions?: { maxAttempts: number; baseDelayMs: number; maxDelayMs: number };
}

const DEFAULT_RETRY = { maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 5_000 };

/**
 * The whole point of keeping this as a plain function (not a BullMQ
 * processor callback) is that it's testable against a real Postgres
 * instance without needing Redis/BullMQ running at all — the queue is just
 * "what calls this function and when", not part of the business logic
 * itself. See docs/PROVIDER_INTEGRATION.md.
 */
export async function processFulfillmentJob(orderId: string, correlationId: string, deps: ProcessFulfillmentJobDeps): Promise<void> {
  const retryOptions = deps.retryOptions ?? DEFAULT_RETRY;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
          fulfillments: true,
        },
      },
    },
  });

  if (order.status !== OrderStatus.FULFILLMENT_QUEUED && order.status !== OrderStatus.PROCESSING) {
    // Already terminal or being handled by another delivery of this job —
    // BullMQ's at-least-once delivery means this is a normal occurrence,
    // not an error.
    return;
  }

  if (order.status === OrderStatus.FULFILLMENT_QUEUED) {
    await prisma.$transaction((tx) =>
      orderStateMachine.transition(tx, order.id, OrderStatus.FULFILLMENT_QUEUED, OrderStatus.PROCESSING, { type: "system" }, "worker_picked_up", correlationId),
    );
  }

  for (const item of order.items) {
    const pending = item.fulfillments.find((f) => f.status === FulfillmentStatus.QUEUED || f.status === FulfillmentStatus.IN_PROGRESS);
    if (!pending) continue; // already SUCCEEDED/FAILED/MANUAL_REVIEW from a prior delivery of this job

    if (!deps.breaker.canAttempt()) {
      await prisma.fulfillment.update({
        where: { id: pending.id },
        data: { status: FulfillmentStatus.MANUAL_REVIEW, lastError: "circuit_open" },
      });
      continue;
    }

    await prisma.fulfillment.update({
      where: { id: pending.id },
      data: { status: FulfillmentStatus.IN_PROGRESS, attemptCount: { increment: 1 } },
    });

    const needsCodeReservation = item.variant.product.type === ProductType.DIGITAL_CODE || item.variant.product.type === ProductType.GIFT_CARD;

    try {
      if (needsCodeReservation) {
        const claimed = await prisma.$transaction((tx) => reserveDigitalCode(tx, item.variantId, item.id));
        if (!claimed) {
          await prisma.fulfillment.update({
            where: { id: pending.id },
            data: { status: FulfillmentStatus.MANUAL_REVIEW, lastError: "out_of_stock" },
          });
          continue;
        }
      }

      const idempotencyKey = `${item.id}_${pending.attemptCount}`;
      const result = await retryWithBackoff(
        () =>
          deps.provider.createFulfillment({
            idempotencyKey,
            providerSku: item.variant.sku,
            quantity: item.quantity,
            inputValues: (item.inputValuesJson as Record<string, string> | null) ?? {},
          }),
        retryOptions,
      );

      deps.breaker.recordSuccess();

      await prisma.$transaction(async (tx) => {
        await tx.providerTransaction.create({
          data: {
            fulfillmentId: pending.id,
            providerId: (await tx.provider.findUniqueOrThrow({ where: { code: deps.provider.code } })).id,
            providerTxnRef: result.providerTxnRef,
            idempotencyKey,
            status: result.outcome,
          },
        });

        if (result.outcome === "succeeded") {
          if (needsCodeReservation) await markDigitalCodeSold(tx, item.id);
          await tx.fulfillment.update({
            where: { id: pending.id },
            data: { status: FulfillmentStatus.SUCCEEDED, completedAt: new Date() },
          });
        } else if (result.outcome === "unknown") {
          await tx.fulfillment.update({
            where: { id: pending.id },
            data: { status: FulfillmentStatus.MANUAL_REVIEW, lastError: "unknown_provider_result" },
          });
        } else {
          if (needsCodeReservation) await releaseDigitalCode(tx, item.id);
          await tx.fulfillment.update({
            where: { id: pending.id },
            data: { status: FulfillmentStatus.FAILED, lastError: result.failureReason ?? "failed" },
          });
        }
      });
    } catch (error) {
      deps.breaker.recordFailure();
      if (needsCodeReservation) {
        await prisma.$transaction((tx) => releaseDigitalCode(tx, item.id));
      }

      const lastError =
        error instanceof InsufficientProviderBalanceError
          ? "insufficient_provider_balance"
          : error instanceof ProviderTimeoutError
            ? "provider_timeout"
            : error instanceof Error
              ? error.message
              : "unknown_error";

      // Balance/timeout are ops issues, not "this order is broken" — route
      // to manual review rather than a hard failure so support can retry
      // once the provider recovers, instead of the customer needing a refund.
      const status =
        error instanceof InsufficientProviderBalanceError || error instanceof ProviderTimeoutError
          ? FulfillmentStatus.MANUAL_REVIEW
          : FulfillmentStatus.FAILED;

      await prisma.fulfillment.update({ where: { id: pending.id }, data: { status, lastError } });
    }
  }

  await finalizeOrderFulfillmentStatus(orderId, correlationId);
}

async function finalizeOrderFulfillmentStatus(orderId: string, correlationId: string): Promise<void> {
  const fulfillments = await prisma.fulfillment.findMany({ where: { orderItem: { orderId } } });

  const allSucceeded = fulfillments.every((f) => f.status === FulfillmentStatus.SUCCEEDED);
  const anySucceeded = fulfillments.some((f) => f.status === FulfillmentStatus.SUCCEEDED);
  const anyManualReview = fulfillments.some((f) => f.status === FulfillmentStatus.MANUAL_REVIEW);
  const anyPending = fulfillments.some((f) => f.status === FulfillmentStatus.QUEUED || f.status === FulfillmentStatus.IN_PROGRESS);

  if (anyPending) return; // shouldn't happen once this function is reached, but never guess a final state

  let target: OrderStatus;
  if (allSucceeded) target = OrderStatus.COMPLETED;
  else if (anyManualReview) target = OrderStatus.MANUAL_REVIEW;
  else if (anySucceeded) target = OrderStatus.PARTIALLY_FULFILLED;
  else target = OrderStatus.FAILED;

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status === target) return; // already finalized by a prior delivery of this job

  const notificationTemplate: NotificationTemplateKey | null =
    target === OrderStatus.COMPLETED ? "order_completed" : target === OrderStatus.FAILED ? "order_failed" : null;

  await prisma.$transaction(async (tx) => {
    await orderStateMachine.transition(tx, orderId, order.status, target, { type: "system" }, "fulfillment_result", correlationId);
    if (notificationTemplate) {
      await recordNotification(tx, {
        userId: order.userId,
        templateKey: notificationTemplate,
        payload: { orderId: order.id, orderNumber: order.orderNumber, recipientEmail: order.guestEmail },
      });
    }
  });
}

export function newCorrelationId(): string {
  return randomUUID();
}
