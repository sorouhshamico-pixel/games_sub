import { Module } from "@nestjs/common";
import { OrderStateMachine } from "@gcc-store/db";
import { PaymentsModule } from "../payments/payments.module";
import { InvoicingModule } from "../invoicing/invoicing.module";
import { CheckoutController } from "./checkout.controller";
import { OrdersController } from "./orders.controller";
import { CheckoutService } from "./checkout.service";
import { CouponService } from "./coupon.service";

@Module({
  imports: [PaymentsModule, InvoicingModule],
  controllers: [CheckoutController, OrdersController],
  providers: [CheckoutService, CouponService, OrderStateMachine],
})
export class OrdersModule {}
