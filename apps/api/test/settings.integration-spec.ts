import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp, adminCookie } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Store settings (integration)", () => {
  let app: INestApplication;
  const opsEmail = `integration-settings-ops-${Date.now()}@example.com`;
  const testOrderIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    // PATCH's DTO only accepts a real int for refundWindowDays (no null-to-
    // unset path), so clearing it back to "no enforcement" for whatever
    // spec file runs after this one goes straight through Prisma.
    await prisma.appSetting.deleteMany({ where: { key: { in: ["refundWindowDays", "supportEmail", "supportPhone", "maintenanceMode"] } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: testOrderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: testOrderIds } } });
    await prisma.user.deleteMany({ where: { email: opsEmail } });
    await app.close();
    await prisma.$disconnect();
  });

  it("SUPER_ADMIN updates settings and GET reflects them", async () => {
    const cookie = await adminCookie(app);

    await request(app.getHttpServer())
      .patch("/api/v1/admin/settings")
      .set("Cookie", cookie)
      .send({ supportEmail: "integration-support@example.com", maintenanceMode: true })
      .expect(200);

    const res = await request(app.getHttpServer()).get("/api/v1/admin/settings").set("Cookie", cookie).expect(200);
    expect(res.body.supportEmail).toBe("integration-support@example.com");
    expect(res.body.maintenanceMode).toBe(true);

    // Reset maintenanceMode immediately — leaving it "true" would make the
    // storefront show a real maintenance banner for the rest of this suite.
    await request(app.getHttpServer()).patch("/api/v1/admin/settings").set("Cookie", cookie).send({ maintenanceMode: false }).expect(200);
  });

  it("blocks a non-SUPER_ADMIN staff role from reading or writing settings", async () => {
    const superCookie = await adminCookie(app);
    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", superCookie)
      .send({ email: opsEmail, password: "integration-test-password-1", role: "OPERATIONS" })
      .expect(201);
    const opsLogin = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: opsEmail, password: "integration-test-password-1" })
      .expect(201);
    const opsCookie = opsLogin.headers["set-cookie"];

    await request(app.getHttpServer()).get("/api/v1/admin/settings").set("Cookie", opsCookie).expect(403);
    await request(app.getHttpServer())
      .patch("/api/v1/admin/settings")
      .set("Cookie", opsCookie)
      .send({ maintenanceMode: true })
      .expect(403);
  });

  it("exposes only the public-safe subset with no authentication required", async () => {
    const cookie = await adminCookie(app);
    await request(app.getHttpServer())
      .patch("/api/v1/admin/settings")
      .set("Cookie", cookie)
      .send({ supportPhone: "+966500000000", refundWindowDays: 7 })
      .expect(200);

    const publicRes = await request(app.getHttpServer()).get("/api/v1/content/store-settings").expect(200);
    expect(publicRes.body).toMatchObject({ supportPhone: "+966500000000" });
    // refundWindowDays is real admin-facing data (not a secret, but not a
    // storefront concern either) — the public endpoint deliberately never
    // returns it, only the three fields the storefront actually renders.
    expect(publicRes.body.refundWindowDays).toBeUndefined();
  });

  it("actually enforces refundWindowDays — not just stored and ignored", async () => {
    const cookie = await adminCookie(app);
    await request(app.getHttpServer()).patch("/api/v1/admin/settings").set("Cookie", cookie).send({ refundWindowDays: 3 }).expect(200);

    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { product: { slug: "demo-battle-arena-diamonds" }, isActive: true },
    });
    const checkoutRes = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({ items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "720001", serverId: "1" } }] })
      .expect(201);
    await request(app.getHttpServer()).post(`/api/v1/payments/mock/${checkoutRes.body.payment.paymentId}/confirm`).expect(200);
    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: checkoutRes.body.orderNumber } });
    testOrderIds.push(order.id);

    // Backdate past the 3-day window — direct Prisma write for test setup
    // only; the assertion below goes through the real API.
    await prisma.order.update({ where: { id: order.id }, data: { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } });

    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${order.id}/refund`)
      .set("Cookie", cookie)
      .send({ reason: "should be rejected — outside the configured window" })
      .expect(400);
  });
});
