import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp, adminCookie } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Staff/user management (integration)", () => {
  let app: INestApplication;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
    await app.close();
    await prisma.$disconnect();
  });

  function newEmail(label: string) {
    const email = `integration-staff-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
    createdEmails.push(email);
    return email;
  }

  it("creates a staff account with a valid role", async () => {
    const cookie = await adminCookie(app);
    const email = newEmail("support");

    const res = await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", cookie)
      .send({ email, password: "integration-test-password-1", role: "SUPPORT" })
      .expect(201);

    expect(res.body).toMatchObject({ email, role: "SUPPORT", isActive: true });
    expect(res.body.id).toBeTruthy();

    const row = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(row.role).toBe("SUPPORT");
    // Password must actually be hashed, never stored/returned in the clear.
    expect(row.passwordHash).not.toBe("integration-test-password-1");
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("rejects CONTENT_SEO — no admin controller grants it any access, so it's excluded from the assignable list", async () => {
    const cookie = await adminCookie(app);
    // Not registered via newEmail()/createdEmails — this account should
    // never actually get created, so there's nothing to clean up.
    const email = `integration-staff-contentseo-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", cookie)
      .send({ email, password: "integration-test-password-1", role: "CONTENT_SEO" })
      .expect(400);

    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });

  it("rejects a duplicate email", async () => {
    const cookie = await adminCookie(app);
    const email = newEmail("dupe");

    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", cookie)
      .send({ email, password: "integration-test-password-1", role: "SUPPORT" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", cookie)
      .send({ email, password: "another-password-2", role: "OPERATIONS" })
      .expect(409);
  });

  it("lists only staff accounts, never CUSTOMER", async () => {
    const cookie = await adminCookie(app);
    const res = await request(app.getHttpServer()).get("/api/v1/admin/users").set("Cookie", cookie).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((u: { role: string }) => u.role !== "CUSTOMER")).toBe(true);
  });

  it("updates a staff member's role and active state", async () => {
    const cookie = await adminCookie(app);
    const email = newEmail("promote");
    const created = await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", cookie)
      .send({ email, password: "integration-test-password-1", role: "SUPPORT" })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${created.body.id}`)
      .set("Cookie", cookie)
      .send({ role: "OPERATIONS", isActive: false })
      .expect(200);

    expect(updated.body.role).toBe("OPERATIONS");
    expect(updated.body.isActive).toBe(false);
  });

  it("blocks a SUPER_ADMIN from deactivating their own account", async () => {
    const cookie = await adminCookie(app);
    const self = await request(app.getHttpServer()).get("/api/v1/auth/me").set("Cookie", cookie).expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${self.body.user.id}`)
      .set("Cookie", cookie)
      .send({ isActive: false })
      .expect(400);

    const stillActive = await prisma.user.findUniqueOrThrow({ where: { id: self.body.user.id } });
    expect(stillActive.isActive).toBe(true);
  });

  it("blocks a SUPER_ADMIN from removing their own SUPER_ADMIN role", async () => {
    const cookie = await adminCookie(app);
    const self = await request(app.getHttpServer()).get("/api/v1/auth/me").set("Cookie", cookie).expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/users/${self.body.user.id}`)
      .set("Cookie", cookie)
      .send({ role: "SUPPORT" })
      .expect(400);

    const stillAdmin = await prisma.user.findUniqueOrThrow({ where: { id: self.body.user.id } });
    expect(stillAdmin.role).toBe("SUPER_ADMIN");
  });

  it("blocks a non-SUPER_ADMIN staff role from managing staff", async () => {
    const superCookie = await adminCookie(app);
    const opsEmail = newEmail("ops");
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

    await request(app.getHttpServer()).get("/api/v1/admin/users").set("Cookie", opsCookie).expect(403);
    await request(app.getHttpServer())
      .post("/api/v1/admin/users")
      .set("Cookie", opsCookie)
      .send({ email: newEmail("blocked"), password: "integration-test-password-1", role: "SUPPORT" })
      .expect(403);
  });
});
