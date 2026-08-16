import { Module } from "@nestjs/common";
import { OrderStateMachine } from "@gcc-store/db";
import { PaymentsModule } from "../payments/payments.module";
import { CheckoutController } from "./checkout.controller";
import { OrdersController } from "./orders.controller";
import { CheckoutService } from "./checkout.service";

@Module({
  imports: [PaymentsModule],
  controllers: [CheckoutController, OrdersController],
  providers: [CheckoutService, OrderStateMachine],
})
export class OrdersModule {}
