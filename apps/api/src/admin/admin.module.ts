import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PaymentsModule } from "../payments/payments.module";
import { InvoicingModule } from "../invoicing/invoicing.module";
import { DashboardController } from "./dashboard.controller";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminCatalogController } from "./catalog/admin-catalog.controller";
import { AdminCatalogService } from "./catalog/admin-catalog.service";
import { AdminRefundsController } from "./refunds/admin-refunds.controller";
import { AdminRefundsService } from "./refunds/admin-refunds.service";
import { AdminCouponsController } from "./coupons/admin-coupons.controller";
import { AdminCouponsService } from "./coupons/admin-coupons.service";

@Module({
  imports: [AuthModule, PaymentsModule, InvoicingModule],
  controllers: [
    DashboardController,
    AdminOrdersController,
    AdminCatalogController,
    AdminRefundsController,
    AdminCouponsController,
  ],
  providers: [AdminCatalogService, AdminRefundsService, AdminCouponsService],
})
export class AdminModule {}
