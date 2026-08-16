import { Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module";
import { CheckoutController } from "./checkout.controller";
import { OrdersController } from "./orders.controller";
import { CheckoutService } from "./checkout.service";
import { OrderStateMachine } from "./order-state-machine";

@Module({
  imports: [PaymentsModule],
  controllers: [CheckoutController, OrdersController],
  providers: [CheckoutService, OrderStateMachine],
})
export class OrdersModule {}
