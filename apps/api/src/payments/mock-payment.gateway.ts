import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ParsedWebhookEvent,
  PaymentGateway,
  RefundResult,
} from "./payment-gateway.interface";

/**
 * Deterministic, no-network gateway for dev/test and demo checkout. Never
 * reachable in production unless `payments.moyasar.enabled` stays off — see
 * PaymentsModule. Confirmation happens via PaymentsController's
 * `/payments/mock/:paymentId/confirm` endpoint rather than a real webhook,
 * since there's no external service to call one back.
 */
@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  readonly code = "mock";

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    return Promise.resolve({
      gatewayReference: `mock_${input.paymentId}_${randomUUID().slice(0, 8)}`,
      checkoutUrl: null,
    });
  }

  verifyWebhookSignature(): boolean {
    return true;
  }

  parseWebhookEvent(rawBody: string): ParsedWebhookEvent {
    const payload = JSON.parse(rawBody) as ParsedWebhookEvent;
    return payload;
  }

  async refund(gatewayReference: string, amountMinorUnits: number): Promise<RefundResult> {
    return Promise.resolve({ success: true, providerRefundId: `mock_refund_${gatewayReference}_${amountMinorUnits}` });
  }
}
