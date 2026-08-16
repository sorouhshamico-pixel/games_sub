import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Refunds (integration)", () => {
  let app: INestApplication;
  const adminEmail = `integration-refund-admin-${Date.now()}@example.com`;
  const customerEmail = `integration-refund-customer-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createTestApp();
    // Reuse the seeded SUPER_ADMIN rather than creating a new one — refunds
    // require SUPER_ADMIN/FINANCE, which self-registration never grants.
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, customerEmail] } } });
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

  async function paidOrder(playerId: string) {
    const variant = await getSeededVariant();
    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId, serverId: "1" } }] })
      .expect(201);
    await request(app.getHttpServer()).post(`/api/v1/payments/mock/${checkoutRes.body.payment.paymentId}/confirm`).expect(200);
    return checkoutRes.body as { orderNumber: string; trackingToken: string; totalMinorUnits: number };
  }

  async function adminCookie() {
    const adminSeedEmail = process.env["ADMIN_SEED_EMAIL"] ?? "admin@example.com";
    const adminSeedPassword = process.env["ADMIN_SEED_PASSWORD"];
    if (!adminSeedPassword) throw new Error("ADMIN_SEED_PASSWORD must be set for this test to log in as the seeded admin");
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: adminSeedEmail, password: adminSeedPassword })
      .expect(201);
    return res.headers["set-cookie"];
  }

  it("fully refunds a paid order and marks it REFUNDED", async () => {
    const order = await paidOrder("700001");
    const cookie = await adminCookie();
    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber: order.orderNumber } });

    const refundRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${orderRow.id}/refund`)
      .set("Cookie", cookie)
      .send({ reason: "integration test full refund" })
      .expect(201);
    expect(refundRes.body.status).toBe("succeeded");
    expect(refundRes.body.amountMinorUnits).toBe(order.totalMinorUnits);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderRow.id } });
    expect(updated.status).toBe("REFUNDED");
  });

  it("partially refunds and marks the order PARTIALLY_REFUNDED", async () => {
    const order = await paidOrder("700002");
    const cookie = await adminCookie();
    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber: order.orderNumber } });
    const partialAmount = Math.floor(order.totalMinorUnits / 2);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${orderRow.id}/refund`)
      .set("Cookie", cookie)
      .send({ amountMinorUnits: partialAmount, reason: "integration test partial refund" })
      .expect(201);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderRow.id } });
    expect(updated.status).toBe("PARTIALLY_REFUNDED");
  });

  it("rejects a refund larger than what's refundable", async () => {
    const order = await paidOrder("700003");
    const cookie = await adminCookie();
    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber: order.orderNumber } });

    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${orderRow.id}/refund`)
      .set("Cookie", cookie)
      .send({ amountMinorUnits: order.totalMinorUnits + 1000, reason: "too much" })
      .expect(400);
  });

  it("rejects refunding an order that was never paid", async () => {
    const cookie = await adminCookie();
    const variant = await getSeededVariant();
    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "700004", serverId: "1" } }] })
      .expect(201);
    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber: checkoutRes.body.orderNumber } });
    expect(orderRow.status).toBe("PENDING_PAYMENT");

    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${orderRow.id}/refund`)
      .set("Cookie", cookie)
      .send({ reason: "should not work" })
      .expect(400);
  });

  it("blocks a customer session from issuing refunds", async () => {
    const order = await paidOrder("700005");
    const orderRow = await prisma.order.findUniqueOrThrow({ where: { orderNumber: order.orderNumber } });

    const registerRes = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: customerEmail, password: "correct-horse-battery" })
      .expect(201);
    const customerCookie = registerRes.headers["set-cookie"];

    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${orderRow.id}/refund`)
      .set("Cookie", customerCookie)
      .send({ reason: "should be forbidden" })
      .expect(403);
  });
});
