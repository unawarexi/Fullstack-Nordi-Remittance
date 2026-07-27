// ============================================================================
// Nordi-Remittance — Production Resilience & Retry Utilities
// Exponential backoff with full jitter, error classification, & timeouts
// ============================================================================

import { createLogger } from '../../logs/logger.js';

const log = createLogger('Retry');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RetryWithBackoffOptions {
  /** Maximum number of retry attempts (default: 5) */
  maxRetries?: number;
  /** Base delay in ms for exponential calculation (default: 500) */
  baseDelay?: number;
  /** Maximum cap for delay in ms (default: 10000) */
  maxDelay?: number;
  /** Label for logging purposes (default: "operation") */
  label?: string;
  /** Whether to apply randomized jitter to prevent retry storms (default: true) */
  jitter?: boolean;
  /** Custom function to determine if an error is transient and retryable */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface RetryStrategyOptions {
  /** Maximum attempts before giving up (returns null) (default: 10) */
  maxRetries?: number;
  /** Base delay in ms (default: 200) */
  baseDelay?: number;
  /** Maximum delay cap in ms (default: 5000) */
  maxDelay?: number;
  /** Optional label for logging purposes */
  label?: string;
  /** Whether to add jitter to reconnection attempts (default: true) */
  jitter?: boolean;
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

/**
 * Determines whether an error is temporary/retryable or permanent/non-retryable.
 * Permanent failures (e.g. validation, authentication, syntax, 4xx HTTP errors)
 * should fail fast without wasting system retry budgets.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return true;

  const err = error as Record<string, unknown>;

  // Explicit retryability flags (e.g. from AppError or custom domain errors)
  if (typeof err.isRetryable === 'boolean') {
    return err.isRetryable;
  }

  // HTTP status code classification: do not retry permanent client errors (400, 401, 403, 404, 422)
  if (typeof err.statusCode === 'number' || typeof err.status === 'number') {
    const code = Number(err.statusCode || err.status);
    if (code >= 400 && code < 500 && code !== 429 && code !== 408) {
      return false;
    }
  }

  // Known permanent database or validation error messages/codes
  const message = String(err.message || '').toLowerCase();
  if (
    message.includes('validation') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('duplicate key') ||
    message.includes('syntax error') ||
    err.code === 11000 // MongoDB duplicate key exception
  ) {
    return false;
  }

  // Network timeouts, 5xx server errors, rate limit throttles (429/408), connection resets are retryable
  return true;
}

// ============================================================================
// EXPONENTIAL BACKOFF WITH FULL JITTER
// ============================================================================

/**
 * Retry an async operation using exponential backoff with full jitter.
 * Prevents thundering herd and synchronized retry storms across cluster nodes.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryWithBackoffOptions = {},
): Promise<T> {
  const {
    maxRetries = 5,
    baseDelay = 500,
    maxDelay = 10000,
    label = 'operation',
    jitter = true,
    shouldRetry = (err) => isRetryableError(err),
  } = opts;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Fail immediately if error is classified as non-retryable or attempts exhausted
      if (attempt === maxRetries || !shouldRetry(err, attempt)) {
        if (attempt === maxRetries) {
          log.error(`${label} failed permanently after ${maxRetries} attempts`, {
            error: err instanceof Error ? err.message : String(err),
          });
        } else {
          log.warn(`${label} encountered non-retryable error, failing fast on attempt ${attempt}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
        throw err;
      }

      // Calculate exponential backoff: baseDelay * 2^(attempt - 1) capped at maxDelay
      const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1));
      
      // Full Jitter: randomize delay between 50% and 100% of calculated exponential interval
      const delay = jitter
        ? Math.floor(exponentialDelay * (0.5 + Math.random() * 0.5))
        : Math.floor(exponentialDelay);

      log.warn(`${label} attempt ${attempt}/${maxRetries} failed (retryable), backing off for ${delay}ms`, {
        error: err instanceof Error ? err.message : String(err),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${label} failed after ${maxRetries} attempts`);
}

// ============================================================================
// TIMEOUT BUDGETS (WITH TIMEOUT)
// ============================================================================

/**
 * Enforces a strict timeout budget on any asynchronous operation.
 * Prevents resource exhaustion from hanging network calls or deadlocked queries.
 *
 * @param promise   - Async operation to monitor
 * @param timeoutMs - Max execution budget in milliseconds
 * @param label     - Operation label for timeout reporting
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string = 'Operation',
): Promise<T> {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} exceeded timeout budget of ${timeoutMs}ms`);
      (err as unknown as Record<string, unknown>).isTimeout = true;
      reject(err);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (error) {
    clearTimeout(timer!);
    throw error;
  }
}

// ============================================================================
// REDIS-COMPATIBLE RETRY STRATEGY WITH JITTER
// ============================================================================

/**
 * Create a Redis-compatible retryStrategy function for ioredis / BullMQ / node-redis.
 * Incorporates connection jitter to protect Redis from synchronized reconnection storms.
 */
export function createRetryStrategy(
  opts: RetryStrategyOptions = {},
): (times: number) => number | null {
  const { maxRetries = 10, baseDelay = 200, maxDelay = 5000, label, jitter = true } = opts;

  return function retryStrategy(times: number): number | null {
    if (times > maxRetries) {
      if (label) log.error(`${label} max reconnection retries (${maxRetries}) reached, giving up`);
      return null;
    }
    const linearDelay = Math.min(times * baseDelay, maxDelay);
    // Add ±20% jitter to prevent client connection stampedes on server reboot
    const delay = jitter
      ? Math.floor(linearDelay * (0.8 + Math.random() * 0.4))
      : linearDelay;

    if (label) log.warn(`${label} reconnection attempt #${times} scheduled in ${delay}ms`);
    return delay;
  };
}
