import path from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthController } from "./health/health.controller";
import { CatalogModule } from "./catalog/catalog.module";
import { ContentModule } from "./content/content.module";
import { PaymentsModule } from "./payments/payments.module";
import { OrdersModule } from "./orders/orders.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    // Redundant with main.ts's earlier dotenv load (harmless — dotenv never
    // overwrites an already-set process.env value), kept explicit here so
    // ConfigService's own env-file lookup can't silently drift back to a
    // cwd-relative path if main.ts's ordering ever changes.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.resolve(__dirname, "../../../.env") }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CatalogModule,
    ContentModule,
    PaymentsModule,
    OrdersModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
