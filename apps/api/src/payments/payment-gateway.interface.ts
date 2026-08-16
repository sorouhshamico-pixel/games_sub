export interface CreatePaymentIntentInput {
  paymentId: string;
  amountMinorUnits: number;
  currency: string;
  orderNumber: string;
  description: string;
}

export interface CreatePaymentIntentResult {
  gatewayReference: string;
  /** null when the gateway has no hosted redirect (e.g. the mock gateway, confirmed via API instead) */
  checkoutUrl: string | null;
}

export type ParsedWebhookStatus = "paid" | "authorized" | "failed";

export interface ParsedWebhookEvent {
  externalEventId: string;
  gatewayReference: string;
  status: ParsedWebhookStatus;
  amountMinorUnits: number;
  currency: string;
  failureReason?: string;
}

export interface RefundResult {
  success: boolean;
  providerRefundId?: string;
}

/**
 * One implementation per payment provider. Swapping Moyasar for Tap/HyperPay
 * means writing a new class here — no other module should branch on gateway
 * code. See docs/PAYMENT_INTEGRATION.md.
 */
export interface PaymentGateway {
  readonly code: string;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
  verifyWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean;
  parseWebhookEvent(rawBody: string): ParsedWebhookEvent;
  refund(gatewayReference: string, amountMinorUnits: number): Promise<RefundResult>;
}

export const PAYMENT_GATEWAY = Symbol("PAYMENT_GATEWAY");
