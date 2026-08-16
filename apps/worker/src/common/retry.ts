export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Injectable for tests — defaults to Math.random */
  random?: () => number;
}

/** Exponential backoff with full jitter (AWS's recommended formula: random(0, min(max, base * 2^attempt))). */
export function computeBackoffDelayMs(attempt: number, options: Pick<RetryOptions, "baseDelayMs" | "maxDelayMs" | "random">): number {
  const random = options.random ?? Math.random;
  const exponential = options.baseDelayMs * 2 ** attempt;
  const capped = Math.min(options.maxDelayMs, exponential);
  return Math.floor(random() * capped);
}

export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < options.maxAttempts - 1) {
        await sleep(computeBackoffDelayMs(attempt, options));
      }
    }
  }
  throw lastError;
}
