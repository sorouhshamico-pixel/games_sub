import { describe, expect, it } from "vitest";
import { CircuitBreaker } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  it("stays closed while failures are below the threshold", () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 1000 });
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.canAttempt()).toBe(true);
    expect(breaker.getState()).toBe("closed");
  });

  it("opens after reaching the failure threshold and blocks attempts", () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, openDurationMs: 1000 });
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();

    expect(breaker.getState()).toBe("open");
    expect(breaker.canAttempt()).toBe(false);
  });

  it("moves to half-open once openDurationMs has elapsed, then closes on success", () => {
    let now = 0;
    const breaker = new CircuitBreaker({ failureThreshold: 1, openDurationMs: 500, now: () => now });

    breaker.recordFailure();
    expect(breaker.getState()).toBe("open");
    expect(breaker.canAttempt()).toBe(false);

    now = 600;
    expect(breaker.canAttempt()).toBe(true);
    expect(breaker.getState()).toBe("half-open");

    breaker.recordSuccess();
    expect(breaker.getState()).toBe("closed");
  });

  it("re-opens immediately on a failed half-open probe", () => {
    let now = 0;
    const breaker = new CircuitBreaker({ failureThreshold: 1, openDurationMs: 500, now: () => now });

    breaker.recordFailure();
    now = 600;
    breaker.canAttempt(); // transitions to half-open
    breaker.recordFailure();

    expect(breaker.getState()).toBe("open");
  });
});
