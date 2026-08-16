import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Coupons (integration)", () => {
  let app: INestApplication;
  const createdCouponCodes: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.couponRedemption.deleteMany({ where: { coupon: { code: { in: createdCouponCodes } } } });
    await prisma.order.updateMany({ where: { coupon: { code: { in: createdCouponCodes } } }, data: { couponId: null } });
    await prisma.coupon.deleteMany({ where: { code: { in: createdCouponCodes } } });
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

  async function makeCoupon(overrides: Partial<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxRedemptions: number | null;
    maxRedemptionsPerCustomer: number | null;
    minOrderAmountMinorUnits: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  }>) {
    const code = overrides.code ?? `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
    createdCouponCodes.push(code);
    await prisma.coupon.create({
      data: {
        code,
        discountType: overrides.discountType ?? "percentage",
        discountValue: overrides.discountValue ?? 1000,
        maxRedemptions: overrides.maxRedemptions,
        maxRedemptionsPerCustomer: overrides.maxRedemptionsPerCustomer,
        minOrderAmountMinorUnits: overrides.minOrderAmountMinorUnits,
        startsAt: overrides.startsAt,
        endsAt: overrides.endsAt,
        isActive: overrides.isActive ?? true,
      },
    });
    return code;
  }

  it("applies a percentage coupon and returns the correct discount", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ discountType: "percentage", discountValue: 1000 }); // 10%

    const res = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800001", serverId: "1" } }],
        couponCode: code.toLowerCase(), // lowercase input must still match
      })
      .expect(201);

    expect(res.body.couponCode).toBe(code);
    expect(res.body.discountMinorUnits).toBeGreaterThan(0);

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: res.body.orderNumber } });
    expect(order.couponId).not.toBeNull();
    expect(order.discountMinorUnits).toBe(res.body.discountMinorUnits);
    // Round-trip check: total = subtotal - discount + tax, using the
    // persisted order row as ground truth rather than re-deriving it.
    expect(res.body.totalMinorUnits).toBe(order.subtotalMinorUnits - order.discountMinorUnits + order.taxMinorUnits);
    const redemption = await prisma.couponRedemption.findUnique({ where: { orderId: order.id } });
    expect(redemption).not.toBeNull();
  });

  it("applies a fixed-amount coupon", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ discountType: "fixed", discountValue: 200 });

    const res = await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800002", serverId: "1" } }],
        couponCode: code,
      })
      .expect(201);

    expect(res.body.discountMinorUnits).toBe(200);
  });

  it("rejects an unknown coupon code and creates no order", async () => {
    const variant = await getSeededVariant();
    const beforeCount = await prisma.order.count();

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800003", serverId: "1" } }],
        couponCode: "DOES-NOT-EXIST",
      })
      .expect(400);

    expect(await prisma.order.count()).toBe(beforeCount);
  });

  it("rejects an expired coupon", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ endsAt: new Date(Date.now() - 86_400_000) });

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800004", serverId: "1" } }],
        couponCode: code,
      })
      .expect(400);
  });

  it("rejects a coupon that hasn't started yet", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ startsAt: new Date(Date.now() + 86_400_000) });

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800005", serverId: "1" } }],
        couponCode: code,
      })
      .expect(400);
  });

  it("rejects an order below the coupon's minimum amount", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ minOrderAmountMinorUnits: 999_999_999 });

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800006", serverId: "1" } }],
        couponCode: code,
      })
      .expect(400);
  });

  it("enforces maxRedemptions across separate checkouts", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ maxRedemptions: 1 });

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800007", serverId: "1" } }],
        couponCode: code,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800008", serverId: "1" } }],
        couponCode: code,
      })
      .expect(400);
  });

  it("allows the first use per customer email then blocks a second use by the same email", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ maxRedemptionsPerCustomer: 1, maxRedemptions: null });
    const email = `coupon-customer-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800010", serverId: "1" } }],
        guestEmail: email,
        couponCode: code,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800011", serverId: "1" } }],
        guestEmail: email,
        couponCode: code,
      })
      .expect(400);
  });

  it("rejects a per-customer-limited coupon when no email is supplied", async () => {
    const variant = await getSeededVariant();
    const code = await makeCoupon({ maxRedemptionsPerCustomer: 1 });

    await request(app.getHttpServer())
      .post("/api/v1/checkout")
      .send({
        items: [{ variantId: variant.id, quantity: 1, inputValues: { playerId: "800012", serverId: "1" } }],
        couponCode: code,
      })
      .expect(400);
  });

  describe("admin CRUD", () => {
    it("creates, lists, updates, and deactivates a coupon as SUPER_ADMIN", async () => {
      const cookie = await adminCookie();
      const code = `ADMIN-${Date.now()}`;
      createdCouponCodes.push(code.toUpperCase());

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/admin/coupons")
        .set("Cookie", cookie)
        .send({ code, discountType: "percentage", discountValue: 500 })
        .expect(201);
      expect(createRes.body.code).toBe(code.toUpperCase());

      const listRes = await request(app.getHttpServer()).get("/api/v1/admin/coupons").set("Cookie", cookie).expect(200);
      expect(listRes.body.some((c: { code: string }) => c.code === code.toUpperCase())).toBe(true);

      const updateRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/coupons/${createRes.body.id}`)
        .set("Cookie", cookie)
        .send({ discountValue: 750 })
        .expect(200);
      expect(updateRes.body.discountValue).toBe(750);

      const deactivateRes = await request(app.getHttpServer())
        .delete(`/api/v1/admin/coupons/${createRes.body.id}`)
        .set("Cookie", cookie)
        .expect(200);
      expect(deactivateRes.body.isActive).toBe(false);
    });

    it("rejects a duplicate coupon code with 409", async () => {
      const cookie = await adminCookie();
      const code = await makeCoupon({});

      await request(app.getHttpServer())
        .post("/api/v1/admin/coupons")
        .set("Cookie", cookie)
        .send({ code, discountType: "percentage", discountValue: 500 })
        .expect(409);
    });

    it("blocks a customer session from managing coupons", async () => {
      const customerEmail = `coupon-admin-test-${Date.now()}@example.com`;
      const registerRes = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ email: customerEmail, password: "correct-horse-battery" })
        .expect(201);
      const customerCookie = registerRes.headers["set-cookie"];

      await request(app.getHttpServer())
        .post("/api/v1/admin/coupons")
        .set("Cookie", customerCookie)
        .send({ code: "SHOULD-FAIL", discountType: "percentage", discountValue: 500 })
        .expect(403);

      await prisma.user.deleteMany({ where: { email: customerEmail } });
    });
  });
});
