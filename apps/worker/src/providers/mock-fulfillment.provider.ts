import { randomUUID } from "node:crypto";
import type {
  CreateFulfillmentInput,
  CreateFulfillmentResult,
  FulfillmentProvider,
  FulfillmentStatusResult,
} from "./fulfillment-provider.interface";
import { InsufficientProviderBalanceError, ProviderTimeoutError } from "./fulfillment-provider.interface";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic, no-network provider for dev/test and demo fulfillment.
 * Behavior is driven by "magic" input values (the same pattern real payment
 * sandboxes use, e.g. Stripe's test card numbers) so every scenario the
 * master prompt asks for is reachable on demand rather than left to chance:
 *
 *   any input value === "000000"  -> insufficient provider balance
 *   any input value === "111111"  -> provider timeout
 *   any input value === "222222"  -> rejected by provider
 *   any input value === "999999"  -> unknown/ambiguous result (needs manual review)
 *   anything else                 -> succeeds after a small simulated delay
 */
export class MockFulfillmentProvider implements FulfillmentProvider {
  readonly code = "mock";

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    await delay(5);
    return { healthy: true, latencyMs: Date.now() - start };
  }

  async getBalance(): Promise<{ balanceMinorUnits: number; currency: string }> {
    return Promise.resolve({ balanceMinorUnits: 100_000_00, currency: "SAR" });
  }

  async syncCatalog(): Promise<Array<{ providerSku: string; costMinorUnits: number; currency: string; available: boolean }>> {
    return Promise.resolve([]);
  }

  async getQuote(_providerSku: string, quantity: number): Promise<{ costMinorUnits: number; currency: string }> {
    return Promise.resolve({ costMinorUnits: 100 * quantity, currency: "SAR" });
  }

  async validateAccount(): Promise<{ valid: boolean; displayName?: string }> {
    return Promise.resolve({ valid: true, displayName: "Demo Player" });
  }

  async createFulfillment(input: CreateFulfillmentInput): Promise<CreateFulfillmentResult> {
    const scenario = this.pickScenario(input.inputValues);
    const providerTxnRef = `mock_txn_${input.idempotencyKey}`;

    await delay(scenario === "unknown" ? 20 : 10);

    switch (scenario) {
      case "insufficient_balance":
        throw new InsufficientProviderBalanceError(this.code);
      case "timeout":
        throw new ProviderTimeoutError(this.code);
      case "rejected":
        return { providerTxnRef, outcome: "failed", failureReason: "rejected_by_provider" };
      case "unknown":
        return { providerTxnRef, outcome: "unknown" };
      case "succeed":
      default:
        return { providerTxnRef, outcome: "succeeded" };
    }
  }

  async getFulfillmentStatus(providerTxnRef: string): Promise<FulfillmentStatusResult> {
    return Promise.resolve({ outcome: providerTxnRef.length > 0 ? "succeeded" : "unknown" });
  }

  async cancelFulfillment(): Promise<{ cancelled: boolean }> {
    return Promise.resolve({ cancelled: true });
  }

  parseWebhook(rawBody: string): FulfillmentStatusResult & { providerTxnRef: string } {
    const payload = JSON.parse(rawBody) as { providerTxnRef?: string; outcome?: FulfillmentStatusResult["outcome"] };
    return {
      providerTxnRef: payload.providerTxnRef ?? randomUUID(),
      outcome: payload.outcome ?? "unknown",
    };
  }

  private pickScenario(
    inputValues: Record<string, string>,
  ): "insufficient_balance" | "timeout" | "rejected" | "unknown" | "succeed" {
    const values = Object.values(inputValues);
    if (values.includes("000000")) return "insufficient_balance";
    if (values.includes("111111")) return "timeout";
    if (values.includes("222222")) return "rejected";
    if (values.includes("999999")) return "unknown";
    return "succeed";
  }
}
