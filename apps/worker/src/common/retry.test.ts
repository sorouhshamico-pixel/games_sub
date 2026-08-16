import { describe, expect, it, vi } from "vitest";
import { computeBackoffDelayMs, retryWithBackoff } from "./retry";

describe("computeBackoffDelayMs", () => {
  it("grows exponentially but never exceeds maxDelayMs", () => {
    const alwaysMax = () => 1 - Number.EPSILON;
    expect(computeBackoffDelayMs(0, { baseDelayMs: 100, maxDelayMs: 10_000, random: alwaysMax })).toBeLessThanOrEqual(100);
    expect(computeBackoffDelayMs(10, { baseDelayMs: 100, maxDelayMs: 10_000, random: alwaysMax })).toBeLessThanOrEqual(10_000);
  });

  it("is zero when random() returns 0 (full jitter can go all the way down)", () => {
    expect(computeBackoffDelayMs(3, { baseDelayMs: 100, maxDelayMs: 10_000, random: () => 0 })).toBe(0);
  });
});

describe("retryWithBackoff", () => {
  it("returns the result on first success without sleeping", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockResolvedValue("ok");

    const result = await retryWithBackoff(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 }, sleep);

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries up to maxAttempts then throws the last error", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockRejectedValue(new Error("boom"));

    await expect(retryWithBackoff(fn, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 }, sleep)).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2); // sleeps between attempts, not after the last one
  });

  it("succeeds on a later attempt without exhausting retries", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("first fails"))
      .mockResolvedValueOnce("recovered");

    const result = await retryWithBackoff(fn, { maxAttempts: 5, baseDelayMs: 10, maxDelayMs: 100 }, sleep);

    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
