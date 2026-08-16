import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { prisma, OrderStatus, FulfillmentStatus } from "@gcc-store/db";
import { processFulfillmentJob } from "./process-fulfillment-job";
import { reserveDigitalCode } from "./digital-code-reservation";
import { MockFulfillmentProvider } from "../providers/mock-fulfillment.provider";
import { CircuitBreaker } from "../common/circuit-breaker";

// Needs a live, migrated, seeded Postgres — unavailable in this sandbox (no
// Docker, no Windows Redis build), so this is skipped locally when
// DATABASE_URL isn't set and runs for real in CI. Mirrors what was verified
// manually against a real (locally-run, non-Docker) instance during
// development — see docs/PROVIDER_INTEGRATION.md. Deliberately calls
// processFulfillmentJob directly rather than going through BullMQ: the
// queue is just "what calls this function and when," not the business
// logic under test here.
describe.skipIf(!process.env["DATABASE_URL"])("processFulfillmentJob (integration)", () => {
  async function createTestOrder(playerId: string) {
    const variant = await prisma.productVariant.findFirstOrThrow({ where: { sku: "DEMO-BA-DIAMOND-100" } });
    const order = await prisma.order.create({
      data: {
        orderNumber: `ITEST-${Math.random().toString(36).slice(2, 10)}`,
        trackingToken: `tok-${Math.random().toString(36).slice(2)}`,
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
              inputValuesJson: { playerId, serverId: "1" },
              priceSnapshotJson: {},
              productNameSnapshot: "integration-test",
            },
          ],
        },
      },
      include: { items: true },
    });
    const item = order.items[0];
    if (!item) throw new Error("expected order item");
    await prisma.fulfillment.create({ data: { orderItemId: item.id, status: FulfillmentStatus.QUEUED } });
    return { orderId: order.id, variantId: variant.id };
  }

  async function runAndInspect(label: string, playerId: string) {
    const { orderId } = await createTestOrder(playerId);
    await processFulfillmentJob(orderId, `itest-${label}`, {
      provider: new MockFulfillmentProvider(),
      breaker: new CircuitBreaker({ failureThreshold: 5, openDurationMs: 30_000 }),
    });
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { fulfillments: true } } },
    });
    return { orderStatus: order.status, fulfillmentStatus: order.items[0]?.fulfillments[0]?.status };
  }

  it.each([
    ["succeed", "123456", OrderStatus.COMPLETED, FulfillmentStatus.SUCCEEDED],
    ["insufficient_balance", "000000", OrderStatus.MANUAL_REVIEW, FulfillmentStatus.MANUAL_REVIEW],
    ["timeout", "111111", OrderStatus.MANUAL_REVIEW, FulfillmentStatus.MANUAL_REVIEW],
    ["rejected", "222222", OrderStatus.FAILED, FulfillmentStatus.FAILED],
    ["unknown", "999999", OrderStatus.MANUAL_REVIEW, FulfillmentStatus.MANUAL_REVIEW],
  ] as const)("maps provider outcome %s to order=%s / fulfillment=%s", async (label, playerId, expectedOrderStatus, expectedFulfillmentStatus) => {
    const result = await runAndInspect(label, playerId);
    expect(result.orderStatus).toBe(expectedOrderStatus);
    expect(result.fulfillmentStatus).toBe(expectedFulfillmentStatus);
  });

  it("never lets concurrent claims double-sell the same digital code", async () => {
    // Unique per run (not a fixed "oi-a"/"oi-b"/"oi-c") — reservedForOrderItemId
    // is a unique column, so reusing fixed IDs across runs would collide with
    // whatever a previous run left behind instead of testing anything new.
    const runId = randomUUID();
    const variant = await prisma.productVariant.findFirstOrThrow({ where: { sku: "DEMO-GIFT-50" } });
    // reserveDigitalCode claims *any* AVAILABLE code for this variant, not
    // just ones this test created — so the starting state has to be exactly
    // 2, not "2 plus whatever another run left behind." DEMO-GIFT-50 is
    // seed/test fixture data with no real inventory, so wiping it here is safe.
    await prisma.digitalCode.deleteMany({ where: { variantId: variant.id } });
    const batch = await prisma.digitalCodeBatch.create({ data: { variantId: variant.id, totalCodes: 2, fileName: "integration-test.csv" } });
    await Promise.all(
      [1, 2].map((n) =>
        prisma.digitalCode.create({
          data: { batchId: batch.id, variantId: variant.id, codeCiphertext: `integration-test-${runId}-${n}`, status: "AVAILABLE" },
        }),
      ),
    );

    const claimants = [`${runId}-a`, `${runId}-b`, `${runId}-c`];
    const results = await Promise.all(
      claimants.map((orderItemId) => prisma.$transaction((tx) => reserveDigitalCode(tx, variant.id, orderItemId))),
    );

    expect(results.filter((r) => r !== null)).toHaveLength(2);
    const stillAvailable = await prisma.digitalCode.count({
      where: { variantId: variant.id, status: "AVAILABLE", codeCiphertext: { startsWith: `integration-test-${runId}-` } },
    });
    expect(stillAvailable).toBe(0);
  });
});
