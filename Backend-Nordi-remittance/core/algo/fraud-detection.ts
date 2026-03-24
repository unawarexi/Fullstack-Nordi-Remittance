// ============================================================================
// FRAUD DETECTION ENGINE — Real-time rule-based fraud detection
// Evaluates signals, checks velocity rules, and scores risk
// ============================================================================

import { FraudSignals, VelocityRules, BehaviorProfiles } from '../../models/FraudSecurityModel.js';
import Transactions from '../../models/TransactionModel.js';
import Logger from '../../logs/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface FraudEvaluation {
  riskScore: number;                // 0–100
  severity: 'low' | 'medium' | 'high' | 'critical';
  signals: DetectedSignal[];
  recommendedAction: 'allow' | 'challenge' | 'review' | 'block';
  evaluatedAt: Date;
}

export interface DetectedSignal {
  signalType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  riskContribution: number;
  metadata?: Record<string, unknown>;
}

export interface TransactionContext {
  userId: string;
  amount: number;
  currency: string;
  recipientId?: string;
  recipientCountry?: string;
  transactionType: string;
  channel: string;
  ipAddress: string;
  deviceId?: string;
  userAgent: string;
}

// ============================================================================
// SIGNAL WEIGHTS — contribution to overall risk score
// ============================================================================

const SIGNAL_WEIGHTS: Record<string, number> = {
  velocity: 20,
  amount: 20,
  behavior: 15,
  location: 15,
  device: 12,
  pattern: 10,
  blacklist: 30,
};

// ============================================================================
// FRAUD DETECTION ENGINE
// ============================================================================

export class FraudDetectionEngine {
  /**
   * Evaluate a transaction for fraud risk.
   * Runs all detection checks in parallel and aggregates results.
   */
  static async evaluate(ctx: TransactionContext): Promise<FraudEvaluation> {
    const startTime = Date.now();
    const signals: DetectedSignal[] = [];

    try {
      // Run all checks in parallel for speed
      const [velocitySignals, amountSignals, behaviorSignals, patternSignals] =
        await Promise.all([
          this.checkVelocity(ctx),
          this.checkAmount(ctx),
          this.checkBehavior(ctx),
          this.checkPatterns(ctx),
        ]);

      signals.push(...velocitySignals, ...amountSignals, ...behaviorSignals, ...patternSignals);

      // Aggregate risk score (capped at 100)
      const riskScore = Math.min(
        100,
        signals.reduce((sum, s) => sum + s.riskContribution, 0),
      );

      const severity = this.scoreSeverity(riskScore);
      const recommendedAction = this.scoreAction(riskScore);

      const evaluation: FraudEvaluation = {
        riskScore,
        severity,
        signals,
        recommendedAction,
        evaluatedAt: new Date(),
      };

      Logger.info(`[FraudEngine] Evaluated tx for user=${ctx.userId} score=${riskScore} action=${recommendedAction} in ${Date.now() - startTime}ms`);

      // Persist high-risk signals to DB
      if (riskScore >= 30) {
        await this.persistSignals(ctx, signals, riskScore, severity);
      }

      return evaluation;
    } catch (error) {
      Logger.error('[FraudEngine] Evaluation failed', { error, userId: ctx.userId });
      // Fail-open: allow transaction but flag for review
      return {
        riskScore: 0,
        severity: 'low',
        signals: [],
        recommendedAction: 'allow',
        evaluatedAt: new Date(),
      };
    }
  }

  // ==========================================================================
  // VELOCITY CHECKS — transaction count/amount in time windows
  // ==========================================================================

  private static async checkVelocity(ctx: TransactionContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    const rules = await VelocityRules.find({ isActive: true }).lean();

    for (const rule of rules) {
      const windowStart = new Date(Date.now() - rule.timeWindow * 1000);

      if (rule.ruleType === 'transaction_count') {
        const count = await Transactions.countDocuments({
          initiatedBy: ctx.userId,
          createdAt: { $gte: windowStart },
          status: { $in: ['pending', 'completed'] },
        });

        if (count >= rule.threshold) {
          signals.push({
            signalType: 'velocity',
            severity: rule.severity as DetectedSignal['severity'],
            description: `${count} transactions in ${rule.timeWindow}s (threshold: ${rule.threshold})`,
            riskContribution: SIGNAL_WEIGHTS.velocity * (rule.severity === 'high' ? 1.5 : 1),
            metadata: { rule: rule.name, count, threshold: rule.threshold, window: rule.timeWindow },
          });
        }
      }

      if (rule.ruleType === 'transaction_amount') {
        const result = await Transactions.aggregate([
          {
            $match: {
              initiatedBy: ctx.userId,
              createdAt: { $gte: windowStart },
              status: { $in: ['pending', 'completed'] },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalAmount = (result[0]?.total || 0) + ctx.amount;

        if (totalAmount >= rule.threshold) {
          signals.push({
            signalType: 'velocity',
            severity: rule.severity as DetectedSignal['severity'],
            description: `Total amount ${totalAmount} ${ctx.currency} in ${rule.timeWindow}s (threshold: ${rule.threshold})`,
            riskContribution: SIGNAL_WEIGHTS.velocity * (rule.severity === 'high' ? 1.5 : 1),
            metadata: { rule: rule.name, totalAmount, threshold: rule.threshold },
          });
        }
      }
    }

    return signals;
  }

  // ==========================================================================
  // AMOUNT CHECKS — unusual amounts relative to user history
  // ==========================================================================

  private static async checkAmount(ctx: TransactionContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    // Get user's historical transaction amounts (last 90 days)
    const history = await Transactions.find({
      initiatedBy: ctx.userId,
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    })
      .select('amount')
      .lean();

    if (history.length < 5) return signals; // Not enough data

    const amounts = history.map((t) => t.amount);
    const stats = computeStats(amounts);

    // Z-score anomaly detection
    if (stats.stdDev > 0) {
      const zScore = Math.abs((ctx.amount - stats.mean) / stats.stdDev);

      if (zScore > 3) {
        signals.push({
          signalType: 'amount',
          severity: 'high',
          description: `Amount ${ctx.amount} is ${zScore.toFixed(1)} std deviations from mean (${stats.mean.toFixed(2)})`,
          riskContribution: SIGNAL_WEIGHTS.amount * 1.5,
          metadata: { zScore, mean: stats.mean, stdDev: stats.stdDev },
        });
      } else if (zScore > 2) {
        signals.push({
          signalType: 'amount',
          severity: 'medium',
          description: `Unusual amount: ${zScore.toFixed(1)} std deviations from mean`,
          riskContribution: SIGNAL_WEIGHTS.amount,
          metadata: { zScore, mean: stats.mean },
        });
      }
    }

    // Absolute high amount check
    if (ctx.amount > stats.max * 2 && ctx.amount > 1000) {
      signals.push({
        signalType: 'amount',
        severity: 'high',
        description: `Amount ${ctx.amount} is >2x user's max (${stats.max})`,
        riskContribution: SIGNAL_WEIGHTS.amount,
        metadata: { amount: ctx.amount, historicalMax: stats.max },
      });
    }

    return signals;
  }

  // ==========================================================================
  // BEHAVIOR CHECKS — deviations from established user patterns
  // ==========================================================================

  private static async checkBehavior(ctx: TransactionContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    const profile = await BehaviorProfiles.findOne({ user: ctx.userId }).lean();
    if (!profile) return signals;

    // Unusual hour
    const hour = new Date().getUTCHours();
    if (profile.typicalTransactionHours.length > 0 && !profile.typicalTransactionHours.includes(hour)) {
      signals.push({
        signalType: 'behavior',
        severity: 'low',
        description: `Transaction at unusual hour (${hour}:00 UTC)`,
        riskContribution: SIGNAL_WEIGHTS.behavior * 0.5,
        metadata: { hour, typicalHours: profile.typicalTransactionHours },
      });
    }

    // Unusual day
    const day = new Date().getUTCDay();
    if (profile.typicalDaysOfWeek.length > 0 && !profile.typicalDaysOfWeek.includes(day)) {
      signals.push({
        signalType: 'behavior',
        severity: 'low',
        description: `Transaction on unusual day (${day})`,
        riskContribution: SIGNAL_WEIGHTS.behavior * 0.3,
      });
    }

    // New country
    if (ctx.recipientCountry && profile.commonCountries.length > 0) {
      if (!profile.commonCountries.includes(ctx.recipientCountry)) {
        signals.push({
          signalType: 'behavior',
          severity: 'medium',
          description: `New recipient country: ${ctx.recipientCountry}`,
          riskContribution: SIGNAL_WEIGHTS.behavior,
          metadata: { country: ctx.recipientCountry, knownCountries: profile.commonCountries },
        });
      }
    }

    // Device change
    if (ctx.deviceId && profile.commonDevices.length > 0) {
      const knownDeviceIds = profile.commonDevices.map((d) => d.deviceId);
      if (!knownDeviceIds.includes(ctx.deviceId)) {
        signals.push({
          signalType: 'device',
          severity: 'medium',
          description: 'Transaction from unrecognized device',
          riskContribution: SIGNAL_WEIGHTS.device,
          metadata: { deviceId: ctx.deviceId },
        });
      }
    }

    return signals;
  }

  // ==========================================================================
  // PATTERN CHECKS — structural transaction patterns
  // ==========================================================================

  private static async checkPatterns(ctx: TransactionContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    // Round amount pattern (potential structuring)
    if (ctx.amount >= 1000 && ctx.amount % 1000 === 0) {
      const recentRound = await Transactions.countDocuments({
        initiatedBy: ctx.userId,
        amount: { $mod: [1000, 0] },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      if (recentRound >= 3) {
        signals.push({
          signalType: 'pattern',
          severity: 'high',
          description: `Potential structuring: ${recentRound + 1} round-amount transactions in 7 days`,
          riskContribution: SIGNAL_WEIGHTS.pattern * 1.5,
          metadata: { roundCount: recentRound + 1 },
        });
      }
    }

    // Smurfing: many small transactions just under reporting threshold
    const smurfWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const smallTxCount = await Transactions.countDocuments({
      initiatedBy: ctx.userId,
      amount: { $gte: 900, $lt: 1000 },
      createdAt: { $gte: smurfWindow },
    });

    if (smallTxCount >= 5) {
      signals.push({
        signalType: 'pattern',
        severity: 'critical',
        description: `Potential smurfing: ${smallTxCount} near-threshold transactions in 24h`,
        riskContribution: SIGNAL_WEIGHTS.pattern * 2,
        metadata: { count: smallTxCount },
      });
    }

    return signals;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private static scoreSeverity(score: number): FraudEvaluation['severity'] {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  private static scoreAction(score: number): FraudEvaluation['recommendedAction'] {
    if (score >= 70) return 'block';
    if (score >= 50) return 'review';
    if (score >= 25) return 'challenge';
    return 'allow';
  }

  private static async persistSignals(
    ctx: TransactionContext,
    signals: DetectedSignal[],
    totalScore: number,
    severity: string,
  ): Promise<void> {
    try {
      const docs = signals.map((s) => ({
        user: ctx.userId,
        signalType: s.signalType,
        severity: s.severity,
        description: s.description,
        riskScore: totalScore,
        status: 'open',
        metadata: { ...s.metadata, transactionAmount: ctx.amount, channel: ctx.channel },
      }));

      await FraudSignals.insertMany(docs, { ordered: false });
    } catch (error) {
      Logger.error('[FraudEngine] Failed to persist signals', { error });
    }
  }
}

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

interface Stats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
}

export function computeStats(values: number[]): Stats {
  if (values.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, median: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;

  return {
    mean,
    stdDev: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[n - 1],
    median: n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)],
  };
}
