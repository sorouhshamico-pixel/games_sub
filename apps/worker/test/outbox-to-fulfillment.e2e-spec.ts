import { randomUUID } from "node:crypto";
import type { Queue, Worker } from "bullmq";
import type IORedis from "ioredis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma, OrderStatus, FulfillmentStatus } from "@gcc-store/db";
import { createRedisConnection } from "../src/queue/connection";
import { createFulfillmentQueue, type FulfillmentJobData } from "../src/queue/fulfillment-queue";
import { createFulfillmentWorker } from "../src/fulfillment/fulfillment-worker";
import { dispatchPendingOutboxEvents } from "../src/outbox/outbox-dispatcher";
import { MockFulfillmentProvider } from "../src/providers/mock-fulfillment.provider";

/**
 * The one thing process-fulfillment-job.integration.test.ts deliberately
 * doesn't cover: the actual BullMQ queue/worker wiring, not just the
 * business logic it calls into. No Redis is available in the sandbox this
 * was developed in (no Docker, no official Windows Redis build), so this
 * was written but could not be run locally — it's gated on both
 * DATABASE_URL and REDIS_URL and is meant to be proven by CI, which does
 * provision both. See docs/PROVIDER_INTEGRATION.md.
 */
describe.skipIf(!process.env["DATABASE_URL"] || !process.env["REDIS_URL"])("Outbox -> BullMQ -> fulfillment (e2e)", () => {
  let connection: IORedis;
  let queue: Queue<FulfillmentJobData>;
  let worker: Worker<FulfillmentJobData>;

  beforeAll(() => {
    connection = createRedisConnection();
    queue = createFulfillmentQueue(connection);
    worker = createFulfillmentWorker(connection, new MockFulfillmentProvider());
  });

  afterAll(async () => {
    await worker.close();
    await queue.close();
    await connection.quit();
  });

  it("carries a queued order through the real queue to COMPLETED", async () => {
    const variant = await prisma.productVariant.findFirstOrThrow({ where: { sku: "DEMO-BA-DIAMOND-100" } });
    const order = await prisma.order.create({
      data: {
        orderNumber: `E2E-${randomUUID().slice(0, 8)}`,
        trackingToken: randomUUID(),
        status: OrderStatus.FULFILLMENT_QUEUED,
        currency: variant.currency,
        subtotalMinorUnits: variant.baseCostMinorUnits,
        taxMinorUnits: 0,
        totalMinorUnits: variant.baseCostMinorUnits,
        items: {
          create: [
            {
              variantId: variant.id,
              quantity: 1,
              inputValuesJson: { playerId: "555444", serverId: "1" },
              priceSnapshotJson: {},
              productNameSnapshot: "e2e-test",
            },
          ],
        },
      },
      include: { items: true },
    });
    const item = order.items[0];
    if (!item) throw new Error("expected order item");
    await prisma.fulfillment.create({ data: { orderItemId: item.id, status: FulfillmentStatus.QUEUED } });
    await prisma.outboxEvent.create({
      data: { eventType: "fulfillment.queued", payloadJson: { orderId: order.id, correlationId: randomUUID() } },
    });

    const dispatched = await dispatchPendingOutboxEvents(queue);
    expect(dispatched).toBeGreaterThanOrEqual(1);

    const deadline = Date.now() + 15_000;
    let finalStatus: OrderStatus | undefined;
    while (Date.now() < deadline) {
      const current = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      finalStatus = current.status;
      if (finalStatus === OrderStatus.COMPLETED) break;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    expect(finalStatus).toBe(OrderStatus.COMPLETED);
  }, 20_000);
});
