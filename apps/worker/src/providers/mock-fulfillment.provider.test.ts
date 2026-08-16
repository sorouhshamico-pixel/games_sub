import { describe, expect, it } from "vitest";
import { MockFulfillmentProvider } from "./mock-fulfillment.provider";
import { InsufficientProviderBalanceError, ProviderTimeoutError } from "./fulfillment-provider.interface";

describe("MockFulfillmentProvider.createFulfillment", () => {
  const provider = new MockFulfillmentProvider();

  it("succeeds by default", async () => {
    const result = await provider.createFulfillment({
      idempotencyKey: "k1",
      providerSku: "SKU-1",
      quantity: 1,
      inputValues: { playerId: "123456" },
    });
    expect(result.outcome).toBe("succeeded");
  });

  it("throws InsufficientProviderBalanceError for the 000000 magic value", async () => {
    await expect(
      provider.createFulfillment({ idempotencyKey: "k2", providerSku: "SKU-1", quantity: 1, inputValues: { playerId: "000000" } }),
    ).rejects.toThrow(InsufficientProviderBalanceError);
  });

  it("throws ProviderTimeoutError for the 111111 magic value", async () => {
    await expect(
      provider.createFulfillment({ idempotencyKey: "k3", providerSku: "SKU-1", quantity: 1, inputValues: { playerId: "111111" } }),
    ).rejects.toThrow(ProviderTimeoutError);
  });

  it("returns a failed outcome for the 222222 magic value", async () => {
    const result = await provider.createFulfillment({
      idempotencyKey: "k4",
      providerSku: "SKU-1",
      quantity: 1,
      inputValues: { playerId: "222222" },
    });
    expect(result.outcome).toBe("failed");
    expect(result.failureReason).toBe("rejected_by_provider");
  });

  it("returns an unknown outcome for the 999999 magic value", async () => {
    const result = await provider.createFulfillment({
      idempotencyKey: "k5",
      providerSku: "SKU-1",
      quantity: 1,
      inputValues: { playerId: "999999" },
    });
    expect(result.outcome).toBe("unknown");
  });

  it("produces a stable providerTxnRef derived from the idempotency key", async () => {
    const a = await provider.createFulfillment({ idempotencyKey: "same-key", providerSku: "SKU-1", quantity: 1, inputValues: {} });
    const b = await provider.createFulfillment({ idempotencyKey: "same-key", providerSku: "SKU-1", quantity: 1, inputValues: {} });
    expect(a.providerTxnRef).toBe(b.providerTxnRef);
  });
});
