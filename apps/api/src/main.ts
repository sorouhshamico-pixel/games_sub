import path from "node:path";
import { config as loadEnv } from "dotenv";

// Must run before any other local import: @gcc-store/db instantiates a
// PrismaClient() as a top-level side effect the moment it's first
// imported, which happens while AppModule's import graph is being
// evaluated below — well before Nest's ConfigModule would otherwise load
// .env. If DATABASE_URL isn't in process.env by then, Prisma initializes
// against nothing. Root .env, since apps/api is two levels under the repo
// root (works identically from src/ in dev and dist/ in production).
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { CorrelationIdMiddleware } from "./common/correlation-id.middleware";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new CorrelationIdMiddleware().use);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: process.env["WEB_APP_ORIGIN"] ?? "http://localhost:3000", credentials: true });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });

  const openApiConfig = new DocumentBuilder()
    .setTitle("GCC Gaming Store API")
    .setDescription("Public, customer, and admin API — see docs/ARCHITECTURE.md")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("api/v1/docs", app, document);

  const port = Number(process.env["PORT"] ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
}

bootstrap();
