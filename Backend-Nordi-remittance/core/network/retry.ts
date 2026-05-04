// ============================================================================
// Nordi-Remittance — Retry Utilities
// Reusable retry strategies for service connections and Redis clients
// ============================================================================

import { createLogger } from "../../logs/logger.js";

const log = createLogger("Retry");

// ============================================================================
// TYPES
// ============================================================================

interface RetryWithBackoffOptions {
  maxRetries?: number;
  baseDelay?: number;
  label?: string;
}

interface RetryStrategyOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  label?: string;
}

// ============================================================================
// RETRY WITH LINEAR BACKOFF
// ============================================================================

/**
 * Retry an async operation with linear backoff.
 *
 * @param fn         - Async function to attempt
 * @param opts.maxRetries  - Maximum number of attempts (default: 5)
 * @param opts.baseDelay   - Base delay in ms, multiplied by attempt number (default: 2000)
 * @param opts.label       - Label for log messages (default: "operation")
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryWithBackoffOptions = {},
): Promise<T> {
  const { maxRetries = 5, baseDelay = 2000, label = "operation" } = opts;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelay * attempt;
      log.warn(
        `${label} attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms`,
        { error: (err as Error).message },
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // TypeScript: unreachable, but satisfies the return type
  throw new Error(`${label} failed after ${maxRetries} attempts`);
}

// ============================================================================
// REDIS-COMPATIBLE RETRY STRATEGY
// ============================================================================

/**
 * Create a Redis-compatible retryStrategy function for ioredis / BullMQ.
 *
 * @param opts.maxRetries  - Give up after this many attempts (return null) (default: 10)
 * @param opts.baseDelay   - Multiplied by attempt number (default: 200)
 * @param opts.maxDelay    - Ceiling for the computed delay (default: 5000)
 * @param opts.label       - Optional label for log messages
 */
export function createRetryStrategy(
  opts: RetryStrategyOptions = {},
): (times: number) => number | null {
  const { maxRetries = 10, baseDelay = 200, maxDelay = 5000, label } = opts;

  return function retryStrategy(times: number): number | null {
    if (times > maxRetries) {
      if (label) log.error(`${label} max retries reached, giving up`);
      return null;
    }
    const delay = Math.min(times * baseDelay, maxDelay);
    if (label) log.warn(`${label} retry #${times} in ${delay}ms`);
    return delay;
  };
}