import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OrderStateMachine } from "@gcc-store/db";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { MockPaymentGateway } from "./mock-payment.gateway";
import { MoyasarPaymentGateway } from "./moyasar-payment.gateway";
import { PAYMENT_GATEWAY } from "./payment-gateway.interface";

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OrderStateMachine,
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const enabled = config.get<string>("MOYASAR_ENABLED") === "true";
        if (!enabled) return new MockPaymentGateway();

        const secretKey = config.get<string>("MOYASAR_SECRET_KEY");
        const webhookSecret = config.get<string>("MOYASAR_WEBHOOK_SECRET");
        if (!secretKey || !webhookSecret) {
          throw new Error("MOYASAR_ENABLED=true requires MOYASAR_SECRET_KEY and MOYASAR_WEBHOOK_SECRET");
        }
        return new MoyasarPaymentGateway({
          secretKey,
          webhookSecret,
          callbackBaseUrl: config.get<string>("API_PUBLIC_URL") ?? "http://localhost:4000/api/v1",
        });
      },
    },
  ],
  exports: [PAYMENT_GATEWAY, PaymentsService],
})
export class PaymentsModule {}
