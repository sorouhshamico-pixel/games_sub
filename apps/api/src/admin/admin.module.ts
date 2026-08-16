import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./dashboard.controller";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminCatalogController } from "./catalog/admin-catalog.controller";
import { AdminCatalogService } from "./catalog/admin-catalog.service";

@Module({
  imports: [AuthModule],
  controllers: [DashboardController, AdminOrdersController, AdminCatalogController],
  providers: [AdminCatalogService],
})
export class AdminModule {}
