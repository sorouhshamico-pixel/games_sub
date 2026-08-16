import { timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ParsedWebhookEvent,
  PaymentGateway,
  RefundResult,
} from "./payment-gateway.interface";

interface MoyasarConfig {
  secretKey: string;
  webhookSecret: string;
  callbackBaseUrl: string;
}

/**
 * NOT VERIFIED AGAINST A LIVE MOYASAR SANDBOX — built from Moyasar's public
 * API docs (Invoice API for the hosted checkout redirect, webhook payloads
 * carrying a `secret_token` field to compare against your configured
 * webhook secret). Disabled by default via the `payments.moyasar.enabled`
 * feature flag / MOYASAR_ENABLED env var; PaymentsModule only wires this in
 * when that's explicitly turned on. Test every scenario in
 * docs/PAYMENT_INTEGRATION.md against Moyasar's sandbox before enabling in
 * production, and treat this file as a starting point, not a finished
 * integration.
 */
@Injectable()
export class MoyasarPaymentGateway implements PaymentGateway {
  readonly code = "moyasar";

  constructor(private readonly config: MoyasarConfig) {}

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    const response = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.config.secretKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: input.amountMinorUnits,
        currency: input.currency,
        description: input.description,
        callback_url: `${this.config.callbackBaseUrl}/payments/webhook/moyasar`,
        metadata: { payment_id: input.paymentId, order_number: input.orderNumber },
      }),
    });

    if (!response.ok) {
      throw new Error(`Moyasar invoice creation failed with status ${response.status}`);
    }

    const body = (await response.json()) as { id: string; url: string };
    return { gatewayReference: body.id, checkoutUrl: body.url };
  }

  verifyWebhookSignature(rawBody: string): boolean {
    try {
      const payload = JSON.parse(rawBody) as { secret_token?: string };
      const provided = Buffer.from(payload.secret_token ?? "");
      const expected = Buffer.from(this.config.webhookSecret);
      return provided.length === expected.length && timingSafeEqual(provided, expected);
    } catch {
      return false;
    }
  }

  parseWebhookEvent(rawBody: string): ParsedWebhookEvent {
    const payload = JSON.parse(rawBody) as {
      id: string;
      data: { id: string; status: string; amount: number; currency: string; source?: { message?: string } };
    };
    const statusMap: Record<string, ParsedWebhookEvent["status"]> = {
      paid: "paid",
      authorized: "authorized",
      failed: "failed",
    };

    return {
      externalEventId: payload.id,
      gatewayReference: payload.data.id,
      status: statusMap[payload.data.status] ?? "failed",
      amountMinorUnits: payload.data.amount,
      currency: payload.data.currency,
      failureReason: payload.data.source?.message,
    };
  }

  async refund(gatewayReference: string, amountMinorUnits: number): Promise<RefundResult> {
    const response = await fetch(`https://api.moyasar.com/v1/payments/${gatewayReference}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.config.secretKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({ amount: amountMinorUnits }),
    });

    if (!response.ok) return { success: false };
    const body = (await response.json()) as { id: string };
    return { success: true, providerRefundId: body.id };
  }
}
