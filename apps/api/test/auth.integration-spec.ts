import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp } from "./test-app";

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Auth + RBAC (integration)", () => {
  let app: INestApplication;
  const email = `integration-auth-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
    await prisma.$disconnect();
  });

  it("registers, rejects a duplicate email, and lets the new user reach /auth/me", async () => {
    const registerRes = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password: "correct-horse-battery", displayName: "Integration Test" })
      .expect(201);

    const cookie = registerRes.headers["set-cookie"];
    expect(cookie).toBeDefined();
    expect(registerRes.body.user.role).toBe("CUSTOMER");

    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password: "correct-horse-battery" })
      .expect(409);

    const meRes = await request(app.getHttpServer()).get("/api/v1/auth/me").set("Cookie", cookie).expect(200);
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.displayName).toBe("Integration Test");
  });

  it("blocks a customer session from admin routes (403) and an anonymous request (401)", async () => {
    const loginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password: "correct-horse-battery" })
      .expect(201);
    const cookie = loginRes.headers["set-cookie"];

    await request(app.getHttpServer()).get("/api/v1/admin/dashboard").set("Cookie", cookie).expect(403);
    await request(app.getHttpServer()).get("/api/v1/admin/dashboard").expect(401);
  });

  it("returns 401 for both a wrong password and a nonexistent email (no 500 from the dummy-hash path)", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password: "totally-wrong" })
      .expect(401);

    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "does-not-exist-anywhere@example.com", password: "whatever12345" })
      .expect(401);
  });

  it("revokes the session on logout", async () => {
    const loginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password: "correct-horse-battery" })
      .expect(201);
    const cookie = loginRes.headers["set-cookie"];

    await request(app.getHttpServer()).post("/api/v1/auth/logout").set("Cookie", cookie).expect(201);
    await request(app.getHttpServer()).get("/api/v1/auth/me").set("Cookie", cookie).expect(401);
  });
});
