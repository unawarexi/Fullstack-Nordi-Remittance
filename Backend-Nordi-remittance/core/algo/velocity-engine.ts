// ============================================================================
// VELOCITY ENGINE — Sliding window rate checks for transaction limits
// Uses Redis for high-performance counters, falls back to MongoDB
// ============================================================================

import Logger from '../../logs/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface VelocityCheckResult {
  allowed: boolean;
  currentCount: number;
  currentAmount: number;
  limit: number;
  windowSeconds: number;
  resetAt: Date;
}

export interface VelocityRule {
  key: string;
  maxCount?: number;
  maxAmount?: number;
  windowSeconds: number;
}

// ============================================================================
// IN-MEMORY SLIDING WINDOW (Redis-free fallback)
// ============================================================================

interface WindowEntry {
  timestamp: number;
  amount: number;
}

const windows = new Map<string, WindowEntry[]>();

/**
 * Sliding window counter — records events and checks limits.
 * Uses in-memory storage; swap to Redis for multi-instance deployments.
 */
export class VelocityEngine {
  /**
   * Record a transaction event and check against velocity rules.
   */
  static check(
    userId: string,
    amount: number,
    rules: VelocityRule[],
  ): { passed: boolean; violations: VelocityCheckResult[] } {
    const violations: VelocityCheckResult[] = [];

    for (const rule of rules) {
      const key = `velocity:${userId}:${rule.key}`;
      const now = Date.now();
      const cutoff = now - rule.windowSeconds * 1000;

      // Get or create window
      let entries = windows.get(key) || [];

      // Prune expired entries
      entries = entries.filter((e) => e.timestamp > cutoff);
      windows.set(key, entries);

      const currentCount = entries.length;
      const currentAmount = entries.reduce((s, e) => s + e.amount, 0);

      // Check count limit
      if (rule.maxCount !== undefined && currentCount >= rule.maxCount) {
        violations.push({
          allowed: false,
          currentCount,
          currentAmount,
          limit: rule.maxCount,
          windowSeconds: rule.windowSeconds,
          resetAt: new Date(entries[0]?.timestamp + rule.windowSeconds * 1000 || now),
        });
        continue;
      }

      // Check amount limit
      if (rule.maxAmount !== undefined && currentAmount + amount > rule.maxAmount) {
        violations.push({
          allowed: false,
          currentCount,
          currentAmount: currentAmount + amount,
          limit: rule.maxAmount,
          windowSeconds: rule.windowSeconds,
          resetAt: new Date(entries[0]?.timestamp + rule.windowSeconds * 1000 || now),
        });
        continue;
      }
    }

    return { passed: violations.length === 0, violations };
  }

  /**
   * Record a successful transaction event.
   */
  static record(userId: string, amount: number, ruleKeys: string[]): void {
    const now = Date.now();
    for (const ruleKey of ruleKeys) {
      const key = `velocity:${userId}:${ruleKey}`;
      const entries = windows.get(key) || [];
      entries.push({ timestamp: now, amount });
      windows.set(key, entries);
    }
  }

  /**
   * Clear velocity windows for a user (e.g., after account verification).
   */
  static clear(userId: string): void {
    const prefix = `velocity:${userId}:`;
    for (const key of windows.keys()) {
      if (key.startsWith(prefix)) windows.delete(key);
    }
  }

  /**
   * Periodic cleanup of expired entries across all windows.
   * Call this from a cron job (e.g., every 5 minutes).
   */
  static cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entries] of windows.entries()) {
      // Find the oldest entry's rule window (conservative: use 24h max)
      const filtered = entries.filter((e) => now - e.timestamp < 24 * 60 * 60 * 1000);
      if (filtered.length === 0) {
        windows.delete(key);
        cleaned++;
      } else if (filtered.length < entries.length) {
        windows.set(key, filtered);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.debug(`[VelocityEngine] Cleaned ${cleaned} windows`);
    }
  }
}

// ============================================================================
// DEFAULT VELOCITY RULES — Use these in transaction processing
// ============================================================================

export const DEFAULT_VELOCITY_RULES: VelocityRule[] = [
  { key: 'tx_per_minute', maxCount: 3, windowSeconds: 60 },
  { key: 'tx_per_hour', maxCount: 20, windowSeconds: 3600 },
  { key: 'tx_per_day', maxCount: 50, windowSeconds: 86400 },
  { key: 'amount_per_hour', maxAmount: 5000, windowSeconds: 3600 },
  { key: 'amount_per_day', maxAmount: 25000, windowSeconds: 86400 },
  { key: 'international_per_day', maxCount: 5, windowSeconds: 86400 },
];
