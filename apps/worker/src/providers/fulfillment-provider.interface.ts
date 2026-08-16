/**
 * One implementation per fulfillment provider (top-up API, code reseller,
 * ...). See docs/PROVIDER_INTEGRATION.md for how to add a real one — every
 * method here is called through ProviderRouter, which never branches on
 * provider identity itself.
 */
export interface FulfillmentProvider {
  readonly code: string;

  healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;

  getBalance(): Promise<{ balanceMinorUnits: number; currency: string }>;

  /** Pulls the provider's current product/price list — used by an admin sync job, not the hot path. */
  syncCatalog(): Promise<Array<{ providerSku: string; costMinorUnits: number; currency: string; available: boolean }>>;

  getQuote(providerSku: string, quantity: number): Promise<{ costMinorUnits: number; currency: string }>;

  /** Optional pre-check for providers that support it (e.g. confirming a game account exists) before charging. */
  validateAccount(providerSku: string, inputValues: Record<string, string>): Promise<{ valid: boolean; displayName?: string }>;

  createFulfillment(input: CreateFulfillmentInput): Promise<CreateFulfillmentResult>;

  getFulfillmentStatus(providerTxnRef: string): Promise<FulfillmentStatusResult>;

  cancelFulfillment(providerTxnRef: string): Promise<{ cancelled: boolean }>;

  parseWebhook(rawBody: string): FulfillmentStatusResult & { providerTxnRef: string };
}

export interface CreateFulfillmentInput {
  idempotencyKey: string;
  providerSku: string;
  quantity: number;
  inputValues: Record<string, string>;
}

export type FulfillmentOutcome = "succeeded" | "failed" | "pending" | "unknown";

export interface CreateFulfillmentResult {
  providerTxnRef: string;
  outcome: FulfillmentOutcome;
  failureReason?: string;
}

export interface FulfillmentStatusResult {
  outcome: FulfillmentOutcome;
  failureReason?: string;
}

export class ProviderTimeoutError extends Error {
  constructor(providerCode: string) {
    super(`Provider ${providerCode} timed out`);
    this.name = "ProviderTimeoutError";
  }
}

export class InsufficientProviderBalanceError extends Error {
  constructor(providerCode: string) {
    super(`Provider ${providerCode} has insufficient balance`);
    this.name = "InsufficientProviderBalanceError";
  }
}
