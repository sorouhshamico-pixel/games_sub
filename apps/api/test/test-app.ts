import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
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
