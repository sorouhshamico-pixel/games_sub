export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  openDurationMs: number;
  now?: () => number;
}

/**
 * Per-provider circuit breaker so one struggling provider can't be hammered
 * with retries for every queued item — after `failureThreshold` consecutive
 * failures it opens (fast-fails everything) for `openDurationMs`, then lets
 * a single probe through (half-open) to decide whether to close again.
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;
  private readonly now: () => number;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.now = options.now ?? Date.now;
  }

  canAttempt(): boolean {
    if (this.state === "closed") return true;
    if (this.state === "open") {
      if (this.now() - this.openedAt >= this.options.openDurationMs) {
        this.state = "half-open";
        return true;
      }
      return false;
    }
    // half-open: only one probe allowed at a time by the caller's own coordination
    return true;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = "closed";
  }

  recordFailure(): void {
    this.consecutiveFailures += 1;
    if (this.state === "half-open" || this.consecutiveFailures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = this.now();
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
