import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter";

/**
 * Mirrors the bootstrap in src/main.ts (global prefix, ValidationPipe,
 * exception filter, cookie parsing) so e2e/integration tests exercise the
 * app exactly as it runs in production. Tests that skip this (like the
 * original health.e2e-spec.ts, which only worked because /health is
 * prefix-excluded) silently miss route-prefix bugs — see the checkout and
 * auth integration specs' git history for exactly that mistake.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });

  await app.init();
  return app;
}

/**
 * Logs in as the seeded SUPER_ADMIN and returns the session cookie. Was
 * copy-pasted identically into coupon.integration-spec.ts and
 * refund.integration-spec.ts before this — extracted here since every new
 * admin-endpoint spec needs the exact same login, and a third-plus copy
 * would be past the point duplication is cheaper than a shared helper.
 */
export async function adminCookie(app: INestApplication) {
  const adminSeedEmail = process.env["ADMIN_SEED_EMAIL"] ?? "admin@example.com";
  const adminSeedPassword = process.env["ADMIN_SEED_PASSWORD"];
  if (!adminSeedPassword) throw new Error("ADMIN_SEED_PASSWORD must be set for this test to log in as the seeded admin");
  const res = await request(app.getHttpServer())
    .post("/api/v1/auth/login")
    .send({ email: adminSeedEmail, password: adminSeedPassword })
    .expect(201);
  return res.headers["set-cookie"];
}
