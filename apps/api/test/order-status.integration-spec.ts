import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma, OrderStatus } from "@gcc-store/db";
import { createTestApp, adminCookie } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Manual order status changes (integration)", () => {
  let app: INestApplication;
  const financeEmail = `integration-status-finance-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createTestApp();
  });

  // Orders created here are deliberately left in place, same as
  // checkout.integration-spec.ts — deleting them back out would mean
  // manually walking the Order FK graph (payments, fulfillments, ...) in
  // dependency order, and CI provisions a fresh Postgres per run anyway so
  // nothing leaks across runs.
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: financeEmail } });
    await app.close();
    await prisma.$disconnect();
  });

  async function getSeededVariant() {
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: "demo-battle-arena-diamonds" },
      include: { variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    });
    const variant = product.variants[0];
    if (!variant) throw new Error("Seed data missing DEMO-BA-DIAMOND variants — run `pnpm db:seed` first");
    return variant;
  }

  /** A real PENDING_PAYMENT order via the actual checkout flow (not a
   * prisma.order.create shortcut) — this specific status is naturally
   * reachable that way, unlike MANUAL_REVIEW below. */
  async function pendingPaymentOrder(playerId: string) {
    const variant = await getSeededVariant();
    const res = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId, serverId: "1" } }] })
      .expect(201);
    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: res.body.orderNumber } });
    return order;
  }

  /** MANUAL_REVIEW has no path through the real checkout/payment/fulfillment
   * flow in a test — it's a worker outcome for a real provider failure.
   * Created directly via prisma, same pattern as
   * apps/worker/src/fulfillment/process-fulfillment-job.integration.test.ts's
   * createTestOrder. */
  async function manualReviewOrder(playerId: string) {
    const variant = await getSeededVariant();
    const order = await prisma.order.create({
      data: {
        orderNumber: `ISTAT-${Math.random().toString(36).slice(2, 10)}`,
        trackingToken: `tok-${Math.random().toString(36).slice(2)}`,
        status: OrderStatus.MANUAL_REVIEW,
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
    });
    return order;
  }

  it("cancels a stuck PENDING_PAYMENT order", async () => {
    const order = await pendingPaymentOrder("710001");
    const cookie = await adminCookie(app);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Cookie", cookie)
      .send({ toStatus: "CANCELLED", reason: "integration test: abandoned order" })
      .expect(200);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("CANCELLED");

    const event = await prisma.orderStatusEvent.findFirst({ where: { orderId: order.id, toStatus: "CANCELLED" } });
    expect(event?.actorType).toBe("admin");

    const auditEntry = await prisma.auditLog.findFirst({ where: { entityType: "Order", entityId: order.id, action: "order.status_changed" } });
    expect(auditEntry).not.toBeNull();
  });

  it("resolves a MANUAL_REVIEW order to COMPLETED", async () => {
    const order = await manualReviewOrder("710002");
    const cookie = await adminCookie(app);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Cookie", cookie)
      .send({ toStatus: "COMPLETED", reason: "integration test: manually resolved" })
      .expect(200);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("COMPLETED");

    const notifications = await prisma.notification.findMany({ where: { payloadJson: { path: ["orderId"], equals: order.id } } });
    expect(notifications.map((n) => n.templateKey)).toContain("order_completed");
  });

  it("rejects a target status outside the admin-safe allow-list at the DTO layer", async () => {
    const order = await pendingPaymentOrder("710003");
    const cookie = await adminCookie(app);

    // PAID is a real, legal state-machine transition from PENDING_PAYMENT,
    // but never a manual one — set exclusively by the payment webhook.
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Cookie", cookie)
      .send({ toStatus: "PAID", reason: "should never be allowed by hand" })
      .expect(400);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING_PAYMENT");
  });

  it("rejects a transition that's state-machine-legal but not in the curated manual set", async () => {
    const order = await pendingPaymentOrder("710004");
    const cookie = await adminCookie(app);

    // FAILED is a DTO-allowed target in general, but PENDING_PAYMENT isn't
    // one of the statuses that may move to it manually (only an automated
    // payment failure does) — the service's own allow-list must catch what
    // the DTO's coarser enum check lets through.
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Cookie", cookie)
      .send({ toStatus: "FAILED", reason: "not a valid manual transition from here" })
      .expect(400);
  });

  it("blocks FINANCE from changing order status — this is a fulfillment action, not a money one", async () => {
    const order = await pendingPaymentOrder("710005");
    const superAdminCookie = await adminCookie(app);

    const createRes = await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", superAdminCookie)
      .send({ email: financeEmail, password: "integration-test-password-1", role: "FINANCE" })
      .expect(201);
    expect(createRes.body.role).toBe("FINANCE");

    const loginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: financeEmail, password: "integration-test-password-1" })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${order.id}/status`)
      .set("Cookie", loginRes.headers["set-cookie"])
      .send({ toStatus: "CANCELLED", reason: "should be forbidden for FINANCE" })
      .expect(403);
  });
});
