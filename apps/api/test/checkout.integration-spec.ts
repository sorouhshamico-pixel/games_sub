import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp } from "./test-app";

// Needs a live, migrated, seeded Postgres (packages/db/prisma/seed.ts) —
// unavailable in this sandbox (no Docker, no Windows Redis), so this is
// skipped locally when DATABASE_URL isn't set and runs for real in CI,
// which does provision Postgres. Mirrors what was verified manually against
// a real (locally-run, non-Docker) instance during development — see
// docs/PAYMENT_INTEGRATION.md.
describe.skipIf(!process.env["DATABASE_URL"])("Checkout (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
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

  it("takes a guest order from checkout through mock payment to FULFILLMENT_QUEUED", async () => {
    const variant = await getSeededVariant();

    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "123456", serverId: "1" } }],
        guestEmail: "integration-test@example.com",
      })
      .expect(201);

    const { orderNumber, trackingToken, payment } = checkoutRes.body;
    expect(payment.gatewayCode).toBe("mock");

    await request(app.getHttpServer()).post(`/api/v1/payments/mock/${payment.paymentId}/confirm`).expect(200);

    const trackRes = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderNumber}?token=${trackingToken}`)
      .expect(200);

    expect(trackRes.body.status).toBe("FULFILLMENT_QUEUED");
    expect(trackRes.body.timeline.map((e: { toStatus: string }) => e.toStatus)).toEqual([
      "DRAFT",
      "PENDING_PAYMENT",
      "PAID",
      "FULFILLMENT_QUEUED",
    ]);

    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber } });
    const notifications = await prisma.notification.findMany({ where: { payloadJson: { path: ["orderId"], equals: orderRow.id } } });
    expect(notifications.map((n) => n.templateKey)).toEqual(["order_confirmed"]);
    expect(notifications[0]?.status).toBe("sent");
  });

  it("is idempotent when the same mock payment is confirmed twice", async () => {
    const variant = await getSeededVariant();

    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "654321", serverId: "1" } }] })
      .expect(201);
    const { payment } = checkoutRes.body;

    await request(app.getHttpServer()).post(`/api/v1/payments/mock/${payment.paymentId}/confirm`).expect(200);
    await request(app.getHttpServer()).post(`/api/v1/payments/mock/${payment.paymentId}/confirm`).expect(200);

    const fulfillmentCount = await prisma.fulfillment.count({
      where: { orderItem: { variantId: variant.id, order: { payments: { some: { id: payment.paymentId } } } } },
    });
    expect(fulfillmentCount).toBe(1);
  });

  it("rejects checkout with a malformed dynamic input value", async () => {
    const variant = await getSeededVariant();

    // playerId normalizes as digitsOnly before length/regex checks, so a
    // value with no digits at all (like "not-numeric") strips to "" and
    // correctly fails as too_short rather than invalid_format — this value
    // has digits but too few of them, which does exercise the length check
    // directly.
    const res = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "123", serverId: "1" } }] })
      .expect(400);

    expect(res.body.error.details.errors.playerId).toBe("too_short");
  });

  it("returns 404 for a wrong tracking token", async () => {
    const variant = await getSeededVariant();
    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "111222", serverId: "1" } }] })
      .expect(201);

    await request(app.getHttpServer()).get(`/api/v1/orders/${checkoutRes.body.orderNumber}?token=wrong`).expect(404);
  });
});
