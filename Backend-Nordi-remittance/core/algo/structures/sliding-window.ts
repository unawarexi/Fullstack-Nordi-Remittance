// ============================================================================
// SLIDING WINDOW COUNTER — Time-bucketed event counting
// Used for: rate limiting, velocity tracking, throughput monitoring
// ============================================================================

interface Bucket {
  timestamp: number;
  count: number;
  amount: number;
}

export class SlidingWindowCounter {
  private buckets: Bucket[] = [];

  constructor(
    /** Window size in milliseconds */
    private readonly windowMs: number,
    /** Bucket granularity in milliseconds (default = window / 10) */
    private readonly bucketMs: number = Math.max(windowMs / 10, 1000),
  ) {}

  /** Record an event with an optional amount (for monetary velocity). */
  record(amount = 0, now = Date.now()): void {
    this.prune(now);
    const bucketKey = Math.floor(now / this.bucketMs) * this.bucketMs;
    const last = this.buckets[this.buckets.length - 1];
    if (last && last.timestamp === bucketKey) {
      last.count++;
      last.amount += amount;
    } else {
      this.buckets.push({ timestamp: bucketKey, count: 1, amount });
    }
  }

  /** Get the event count within the current window. */
  getCount(now = Date.now()): number {
    this.prune(now);
    return this.buckets.reduce((sum, b) => sum + b.count, 0);
  }

  /** Get the total amount within the current window. */
  getAmount(now = Date.now()): number {
    this.prune(now);
    return this.buckets.reduce((sum, b) => sum + b.amount, 0);
  }

  /** Get stats: count, amount, rate per second. */
  getStats(now = Date.now()): { count: number; amount: number; ratePerSec: number } {
    this.prune(now);
    const count = this.buckets.reduce((s, b) => s + b.count, 0);
    const amount = this.buckets.reduce((s, b) => s + b.amount, 0);
    return {
      count,
      amount,
      ratePerSec: count / (this.windowMs / 1000),
    };
  }

  reset(): void {
    this.buckets = [];
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.buckets.length > 0 && this.buckets[0].timestamp < cutoff) {
      this.buckets.shift();
    }
  }
}
