import "reflect-metadata";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { prisma } from "@gcc-store/db";
import { createTestApp, adminCookie } from "./test-app";
import { UPLOADS_DIR } from "../src/storage/uploads-dir";

// 1x1 transparent PNG — smallest valid file that passes real image
// mimetype/content checks, not just a fake extension.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

// See checkout.integration-spec.ts for why this is DATABASE_URL-gated.
describe.skipIf(!process.env["DATABASE_URL"])("Product image upload (integration)", () => {
  let app: INestApplication;
  const supportEmail = `integration-image-support-${Date.now()}@example.com`;
  let productId: string;
  let originalImageUrl: string | null;

  beforeAll(async () => {
    app = await createTestApp();
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: "demo-battle-arena-diamonds" } });
    productId = product.id;
    originalImageUrl = product.imageUrl;
  });

  afterAll(async () => {
    await prisma.product.update({ where: { id: productId }, data: { imageUrl: originalImageUrl } });
    await prisma.user.deleteMany({ where: { email: supportEmail } });
    await app.close();
    await prisma.$disconnect();
  });

  it("uploads a valid PNG and persists the returned URL onto the product", async () => {
    const cookie = await adminCookie(app);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/admin/catalog/products/${productId}/image`)
      .set("Cookie", cookie)
      .attach("file", TINY_PNG, { filename: "cover.png", contentType: "image/png" })
      .expect(201);

    expect(res.body.imageUrl).toMatch(/^https?:\/\/.+\/uploads\/products\/.+\.png$/);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(updated.imageUrl).toBe(res.body.imageUrl);

    // Confirms LocalDiskStorageProvider actually wrote the file, not just
    // that it returned a plausible-looking URL — CI never sets S3_* vars,
    // so this is the active backend there.
    const key = new URL(res.body.imageUrl).pathname.split("/uploads/")[1];
    expect(key).toBeDefined();
    expect(existsSync(join(UPLOADS_DIR, key!))).toBe(true);

    const auditEntry = await prisma.auditLog.findFirst({
      where: { entityType: "Product", entityId: productId, action: "product.image_uploaded" },
      orderBy: { createdAt: "desc" },
    });
    expect(auditEntry).not.toBeNull();
  });

  it("rejects a non-image file", async () => {
    const cookie = await adminCookie(app);

    await request(app.getHttpServer())
      .post(`/api/v1/admin/catalog/products/${productId}/image`)
      .set("Cookie", cookie)
      .attach("file", Buffer.from("not an image"), { filename: "notes.txt", contentType: "text/plain" })
      .expect(400);
  });

  it("blocks a staff role with no catalog-edit grant (SUPPORT)", async () => {
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

    await request(app.getHttpServer())
      .post(`/api/v1/admin/catalog/products/${productId}/image`)
      .set("Cookie", login.headers["set-cookie"])
      .attach("file", TINY_PNG, { filename: "cover.png", contentType: "image/png" })
      .expect(403);
  });
});
