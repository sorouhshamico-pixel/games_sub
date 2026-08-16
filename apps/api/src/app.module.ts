import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthController } from "./health/health.controller";
import { CatalogModule } from "./catalog/catalog.module";
import { ContentModule } from "./content/content.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CatalogModule,
    ContentModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
