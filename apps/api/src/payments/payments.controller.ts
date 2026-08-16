import { Controller, Headers, HttpCode, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Moyasar's webhook verification is a plaintext `secret_token` field
  // compared inside the JSON body (see MoyasarPaymentGateway), not an
  // HMAC-over-raw-bytes signature — so re-serializing the parsed body is
  // sufficient here. A future gateway using a true byte-exact HMAC would
  // need Nest's `rawBody: true` app option instead.
  @Post("webhook/moyasar")
  @HttpCode(200)
  async handleMoyasarWebhook(@Req() req: Request, @Headers() headers: Record<string, string>) {
    await this.paymentsService.handleWebhook(JSON.stringify(req.body), headers);
    return { received: true };
  }

  @Post("mock/:paymentId/confirm")
  @HttpCode(200)
  async confirmMockPayment(@Param("paymentId") paymentId: string, @Headers("x-correlation-id") correlationId?: string) {
    await this.paymentsService.confirmMockPayment(paymentId, correlationId ?? paymentId);
    return { confirmed: true };
  }
}
