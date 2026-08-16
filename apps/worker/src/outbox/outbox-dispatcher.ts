import { prisma } from "@gcc-store/db";
import type { Queue } from "bullmq";
import type { FulfillmentJobData } from "../queue/fulfillment-queue";

interface OutboxRow {
  id: string;
  payloadJson: { orderId: string; correlationId: string };
}

/**
 * Relays `OutboxEvent` rows written inside the same DB transaction as the
 * order's PAID→FULFILLMENT_QUEUED move (see PaymentsService) onto the real
 * queue. Claims rows with `FOR UPDATE SKIP LOCKED` + an atomic
 * publishedAt stamp so running multiple worker replicas never double-enqueues
 * the same event. BullMQ's own `jobId: outboxEvent.id` makes re-adding the
 * same event (if a replica crashes between the DB claim and the queue add)
 * a safe no-op on top of that.
 */
export async function dispatchPendingOutboxEvents(queue: Queue<FulfillmentJobData>, batchSize = 20): Promise<number> {
  const claimed = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; payloadJson: unknown }[]>`
      SELECT id, "payloadJson" FROM outbox_events
      WHERE "publishedAt" IS NULL AND "eventType" = 'fulfillment.queued'
      ORDER BY "createdAt" ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    `;
    if (rows.length === 0) return [];

    await tx.outboxEvent.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { publishedAt: new Date() },
    });

    return rows as OutboxRow[];
  });

  for (const row of claimed) {
    await queue.add(
      "process-order-fulfillment",
      { orderId: row.payloadJson.orderId, correlationId: row.payloadJson.correlationId },
      { jobId: row.id, attempts: 1 }, // BullMQ-level retries are handled inside processFulfillmentJob instead
    );
  }

  return claimed.length;
}

export function startOutboxDispatcherLoop(queue: Queue<FulfillmentJobData>, intervalMs = 2000): NodeJS.Timeout {
  return setInterval(() => {
    dispatchPendingOutboxEvents(queue).catch((error: unknown) => {
       
      console.error("[outbox-dispatcher] failed to dispatch pending events", error);
    });
  }, intervalMs);
}
