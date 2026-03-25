// ============================================================================
// FRAUD DETECTION — Client-side anomaly detection & risk scoring
// ============================================================================

export interface TransactionSignal {
  amount: number;
  currency: string;
  timestamp: Date | string;
  recipientId: string;
  recipientCountry?: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface RiskScore {
  score: number; // 0–100 (0 = safe, 100 = highest risk)
  flags: string[];
  level: "low" | "medium" | "high" | "critical";
}

/**
 * Velocity check — detects unusually frequent transactions.
 * Returns true if the user exceeded the threshold within the time window.
 */
export function velocityCheck(
  transactions: TransactionSignal[],
  windowMs: number,
  maxCount: number,
): { exceeded: boolean; count: number } {
  const now = Date.now();
  const recentCount = transactions.filter(
    (tx) => now - new Date(tx.timestamp).getTime() <= windowMs,
  ).length;

  return { exceeded: recentCount >= maxCount, count: recentCount };
}

/**
 * Amount anomaly detection using statistical z-score.
 * Flags transactions that deviate significantly from the user's average.
 */
export function amountAnomaly(
  amount: number,
  historicalAmounts: number[],
  zThreshold = 2.5,
): { isAnomaly: boolean; zScore: number } {
  if (historicalAmounts.length < 3) return { isAnomaly: false, zScore: 0 };

  const mean = historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
  const variance =
    historicalAmounts.reduce((sum, v) => sum + (v - mean) ** 2, 0) / historicalAmounts.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return { isAnomaly: amount !== mean, zScore: amount !== mean ? Infinity : 0 };

  const zScore = Math.abs((amount - mean) / stdDev);
  return { isAnomaly: zScore > zThreshold, zScore: Math.round(zScore * 100) / 100 };
}

/**
 * Rule-based risk scoring for a transaction.
 * Combines multiple heuristics into a 0–100 risk score.
 */
export function calculateRiskScore(
  tx: TransactionSignal,
  history: TransactionSignal[],
  config?: {
    highAmountThreshold?: number;
    velocityWindowMs?: number;
    velocityMaxCount?: number;
    highRiskCountries?: string[];
  },
): RiskScore {
  const {
    highAmountThreshold = 5000,
    velocityWindowMs = 3600000, // 1 hour
    velocityMaxCount = 5,
    highRiskCountries = [],
  } = config || {};

  let score = 0;
  const flags: string[] = [];

  // High amount
  if (tx.amount >= highAmountThreshold) {
    score += 25;
    flags.push(`High amount: ${tx.amount}`);
  }

  // Velocity
  const vel = velocityCheck(history, velocityWindowMs, velocityMaxCount);
  if (vel.exceeded) {
    score += 30;
    flags.push(`Velocity exceeded: ${vel.count} txns in window`);
  }

  // Amount anomaly
  const historicalAmounts = history.map((h) => h.amount);
  const anomaly = amountAnomaly(tx.amount, historicalAmounts);
  if (anomaly.isAnomaly) {
    score += 20;
    flags.push(`Amount anomaly: z-score ${anomaly.zScore}`);
  }

  // High-risk country
  if (tx.recipientCountry && highRiskCountries.includes(tx.recipientCountry.toUpperCase())) {
    score += 15;
    flags.push(`High-risk country: ${tx.recipientCountry}`);
  }

  // New recipient
  const knownRecipients = new Set(history.map((h) => h.recipientId));
  if (!knownRecipients.has(tx.recipientId)) {
    score += 10;
    flags.push("New recipient");
  }

  score = Math.min(100, score);

  const level: RiskScore["level"] =
    score >= 70 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  return { score, flags, level };
}

/**
 * Detect duplicate/repeated transactions (potential double-submit).
 * Uses amount + recipient + timestamp proximity as a fingerprint.
 */
export function detectDuplicateTransaction(
  tx: TransactionSignal,
  recentTransactions: TransactionSignal[],
  windowMs = 60000, // 1 minute
): boolean {
  const txTime = new Date(tx.timestamp).getTime();

  return recentTransactions.some(
    (recent) =>
      recent.amount === tx.amount &&
      recent.recipientId === tx.recipientId &&
      recent.currency === tx.currency &&
      Math.abs(new Date(recent.timestamp).getTime() - txTime) <= windowMs,
  );
}
