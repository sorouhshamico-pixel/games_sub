import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp, adminCookie } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Audit log (integration)", () => {
  let app: INestApplication;
  const analystEmail = `integration-audit-analyst-${Date.now()}@example.com`;
  const supportEmail = `integration-audit-support-${Date.now()}@example.com`;
  let categoryId: string;
  let originalNameEn: string;

  beforeAll(async () => {
    app = await createTestApp();
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: "game-topups" } });
    categoryId = category.id;
    originalNameEn = category.nameEn;
  });

  afterAll(async () => {
    await prisma.category.update({ where: { id: categoryId }, data: { nameEn: originalNameEn } });
    await prisma.user.deleteMany({ where: { email: { in: [analystEmail, supportEmail] } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("writes a real audit entry when an existing admin mutation runs, not just a best-effort side write", async () => {
    const cookie = await adminCookie(app);
    const testValue = `Game Top-ups (audit test ${Date.now()})`;

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/catalog/categories/${categoryId}`)
      .set("Cookie", cookie)
      .send({ nameEn: testValue })
      .expect(200);

    const entry = await prisma.auditLog.findFirst({
      where: { entityType: "Category", entityId: categoryId, action: "category.updated" },
      orderBy: { createdAt: "desc" },
    });
    expect(entry).not.toBeNull();
    expect((entry?.metadataJson as { nameEn?: string } | null)?.nameEn).toBe(testValue);

    const res = await request(app.getHttpServer())
      .get("/api/v1/admin/audit-log")
      .set("Cookie", cookie)
      .query({ entityType: "Category" })
      .expect(200);
    expect(res.body.items.some((i: { id: string }) => i.id === entry?.id)).toBe(true);
    expect(res.body.items.every((i: { entityType: string }) => i.entityType === "Category")).toBe(true);
  });

  it("READ_ONLY_ANALYST can read the audit log", async () => {
    const superCookie = await adminCookie(app);
    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", superCookie)
      .send({ email: analystEmail, password: "integration-test-password-1", role: "READ_ONLY_ANALYST" })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: analystEmail, password: "integration-test-password-1" })
      .expect(201);

    await request(app.getHttpServer()).get("/api/v1/admin/audit-log").set("Cookie", login.headers["set-cookie"]).expect(200);
  });

  it("blocks a staff role with no audit-log grant (SUPPORT)", async () => {
    const superCookie = await adminCookie(app);
    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", superCookie)
      .send({ email: supportEmail, password: "integration-test-password-1", role: "SUPPORT" })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: supportEmail, password: "integration-test-password-1" })
      .expect(201);

    await request(app.getHttpServer()).get("/api/v1/admin/audit-log").set("Cookie", login.headers["set-cookie"]).expect(403);
  });
});
