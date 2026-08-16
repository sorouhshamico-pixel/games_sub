import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./dashboard.controller";
import { AdminOrdersController } from "./admin-orders.controller";

@Module({
  imports: [AuthModule],
  controllers: [DashboardController, AdminOrdersController],
})
export class AdminModule {}
