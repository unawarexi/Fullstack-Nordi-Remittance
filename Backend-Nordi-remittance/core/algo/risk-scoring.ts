// ============================================================================
// RISK SCORING ENGINE — Multi-factor weighted risk assessment
// Combines signals into actionable risk decisions
// ============================================================================

import { BehaviorProfiles } from '../../modules/fraud-security/fraud-security.model.js';
import Transactions from '../../modules/transactions/transactions.model.js';
import Logger from '../../logs/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface RiskFactors {
  accountAge: number;           // days since registration
  kycLevel: string;             // none | basic | standard | enhanced
  totalTransactions: number;
  averageAmount: number;
  currentAmount: number;
  isNewRecipient: boolean;
  isInternational: boolean;
  isNewDevice: boolean;
  isNewIp: boolean;
  hourOfDay: number;
  failedTxLast24h: number;
  recipientCountry?: string;
}

export interface RiskAssessment {
  totalScore: number;           // 0–100
  factors: RiskFactorResult[];
  tier: 'minimal' | 'low' | 'elevated' | 'high' | 'severe';
  requiredAction: 'none' | 'monitor' | 'challenge' | 'manual_review' | 'block';
  limits: { requireOtp: boolean; requireManualApproval: boolean };
}

export interface RiskFactorResult {
  factor: string;
  weight: number;
  score: number;
  contribution: number;
  detail: string;
}

// ============================================================================
// FACTOR WEIGHTS (must sum to 1.0)
// ============================================================================

const FACTOR_WEIGHTS = {
  accountMaturity: 0.10,
  kycLevel: 0.12,
  amountDeviation: 0.18,
  recipientRisk: 0.15,
  channelRisk: 0.10,
  velocityRisk: 0.12,
  deviceRisk: 0.10,
  temporalRisk: 0.05,
  internationalRisk: 0.08,
} as const;

// ============================================================================
// HIGH-RISK JURISDICTIONS (FATF grey/blacklist — simplified)
// ============================================================================

const HIGH_RISK_COUNTRIES = new Set([
  'IR', 'KP', 'MM', 'SY', 'YE', 'AF', 'PK', 'LY', 'IQ', 'VE',
  'SD', 'SS', 'BI', 'CF', 'CD', 'SO', 'ML', 'HT', 'NI',
]);

const MEDIUM_RISK_COUNTRIES = new Set([
  'NG', 'KE', 'PH', 'BD', 'VN', 'UA', 'BY', 'RU', 'CN', 'IN',
  'TZ', 'GH', 'CM', 'UG', 'MZ', 'SN', 'ZW',
]);

// ============================================================================
// RISK SCORING ENGINE
// ============================================================================

export class RiskScoringEngine {
  /**
   * Compute a comprehensive risk assessment for a transaction.
   */
  static async assess(factors: RiskFactors): Promise<RiskAssessment> {
    const results: RiskFactorResult[] = [];

    // Account maturity
    results.push(this.assessAccountMaturity(factors));
    // KYC level
    results.push(this.assessKycLevel(factors));
    // Amount deviation
    results.push(this.assessAmountDeviation(factors));
    // Recipient risk
    results.push(this.assessRecipientRisk(factors));
    // Channel risk (device + IP)
    results.push(this.assessChannelRisk(factors));
    // Velocity risk
    results.push(this.assessVelocityRisk(factors));
    // Device risk
    results.push(this.assessDeviceRisk(factors));
    // Temporal risk
    results.push(this.assessTemporalRisk(factors));
    // International risk
    results.push(this.assessInternationalRisk(factors));

    const totalScore = Math.min(100, Math.round(
      results.reduce((sum, r) => sum + r.contribution, 0),
    ));

    const tier = this.computeTier(totalScore);
    const requiredAction = this.computeAction(totalScore);
    const limits = {
      requireOtp: totalScore >= 30,
      requireManualApproval: totalScore >= 60,
    };

    return { totalScore, factors: results, tier, requiredAction, limits };
  }

  // ==========================================================================
  // INDIVIDUAL FACTOR ASSESSMENTS
  // ==========================================================================

  private static assessAccountMaturity(f: RiskFactors): RiskFactorResult {
    let score: number;
    let detail: string;

    if (f.accountAge < 1) { score = 100; detail = 'Account < 1 day old'; }
    else if (f.accountAge < 7) { score = 70; detail = 'Account < 1 week old'; }
    else if (f.accountAge < 30) { score = 40; detail = 'Account < 1 month old'; }
    else if (f.accountAge < 90) { score = 20; detail = 'Account < 3 months old'; }
    else { score = 5; detail = 'Established account'; }

    const weight = FACTOR_WEIGHTS.accountMaturity;
    return { factor: 'accountMaturity', weight, score, contribution: score * weight, detail };
  }

  private static assessKycLevel(f: RiskFactors): RiskFactorResult {
    const scores: Record<string, number> = { none: 95, basic: 60, standard: 25, enhanced: 5 };
    const score = scores[f.kycLevel] ?? 80;
    const weight = FACTOR_WEIGHTS.kycLevel;
    return { factor: 'kycLevel', weight, score, contribution: score * weight, detail: `KYC level: ${f.kycLevel}` };
  }

  private static assessAmountDeviation(f: RiskFactors): RiskFactorResult {
    let score: number;
    let detail: string;

    if (f.averageAmount === 0) {
      score = f.currentAmount > 500 ? 70 : 30;
      detail = 'No transaction history';
    } else {
      const ratio = f.currentAmount / f.averageAmount;
      if (ratio > 10) { score = 95; detail = `Amount is ${ratio.toFixed(1)}x average`; }
      else if (ratio > 5) { score = 75; detail = `Amount is ${ratio.toFixed(1)}x average`; }
      else if (ratio > 3) { score = 50; detail = `Amount is ${ratio.toFixed(1)}x average`; }
      else if (ratio > 2) { score = 25; detail = `Amount is ${ratio.toFixed(1)}x average`; }
      else { score = 5; detail = 'Amount within normal range'; }
    }

    const weight = FACTOR_WEIGHTS.amountDeviation;
    return { factor: 'amountDeviation', weight, score, contribution: score * weight, detail };
  }

  private static assessRecipientRisk(f: RiskFactors): RiskFactorResult {
    let score = 0;
    const details: string[] = [];

    if (f.isNewRecipient) { score += 40; details.push('New recipient'); }
    if (f.recipientCountry && HIGH_RISK_COUNTRIES.has(f.recipientCountry)) {
      score += 50; details.push(`High-risk country: ${f.recipientCountry}`);
    } else if (f.recipientCountry && MEDIUM_RISK_COUNTRIES.has(f.recipientCountry)) {
      score += 25; details.push(`Medium-risk country: ${f.recipientCountry}`);
    }

    score = Math.min(100, score);
    const weight = FACTOR_WEIGHTS.recipientRisk;
    return { factor: 'recipientRisk', weight, score, contribution: score * weight, detail: details.join('; ') || 'Known recipient' };
  }

  private static assessChannelRisk(f: RiskFactors): RiskFactorResult {
    let score = 0;
    if (f.isNewIp) score += 50;
    score = Math.min(100, score);
    const weight = FACTOR_WEIGHTS.channelRisk;
    return { factor: 'channelRisk', weight, score, contribution: score * weight, detail: f.isNewIp ? 'New IP address' : 'Known channel' };
  }

  private static assessVelocityRisk(f: RiskFactors): RiskFactorResult {
    let score: number;
    let detail: string;

    if (f.failedTxLast24h >= 5) { score = 90; detail = `${f.failedTxLast24h} failed txns in 24h`; }
    else if (f.failedTxLast24h >= 3) { score = 60; detail = `${f.failedTxLast24h} failed txns in 24h`; }
    else if (f.failedTxLast24h >= 1) { score = 25; detail = `${f.failedTxLast24h} failed txns in 24h`; }
    else { score = 0; detail = 'No recent failures'; }

    const weight = FACTOR_WEIGHTS.velocityRisk;
    return { factor: 'velocityRisk', weight, score, contribution: score * weight, detail };
  }

  private static assessDeviceRisk(f: RiskFactors): RiskFactorResult {
    const score = f.isNewDevice ? 70 : 5;
    const weight = FACTOR_WEIGHTS.deviceRisk;
    return { factor: 'deviceRisk', weight, score, contribution: score * weight, detail: f.isNewDevice ? 'Unrecognized device' : 'Known device' };
  }

  private static assessTemporalRisk(f: RiskFactors): RiskFactorResult {
    // High-risk hours: 0–5 UTC
    const score = (f.hourOfDay >= 0 && f.hourOfDay <= 5) ? 60 : 5;
    const weight = FACTOR_WEIGHTS.temporalRisk;
    return { factor: 'temporalRisk', weight, score, contribution: score * weight, detail: `Hour: ${f.hourOfDay} UTC` };
  }

  private static assessInternationalRisk(f: RiskFactors): RiskFactorResult {
    const score = f.isInternational ? 40 : 0;
    const weight = FACTOR_WEIGHTS.internationalRisk;
    return { factor: 'internationalRisk', weight, score, contribution: score * weight, detail: f.isInternational ? 'International transfer' : 'Domestic' };
  }

  // ==========================================================================
  // TIER & ACTION MAPPING
  // ==========================================================================

  private static computeTier(score: number): RiskAssessment['tier'] {
    if (score >= 80) return 'severe';
    if (score >= 60) return 'high';
    if (score >= 35) return 'elevated';
    if (score >= 15) return 'low';
    return 'minimal';
  }

  private static computeAction(score: number): RiskAssessment['requiredAction'] {
    if (score >= 80) return 'block';
    if (score >= 60) return 'manual_review';
    if (score >= 35) return 'challenge';
    if (score >= 15) return 'monitor';
    return 'none';
  }

  // ==========================================================================
  // BEHAVIOR PROFILE UPDATE — call after successful transactions
  // ==========================================================================

  static async updateBehaviorProfile(userId: string): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const transactions = await Transactions.find({
        initiatedBy: userId,
        status: 'completed',
        createdAt: { $gte: thirtyDaysAgo },
      })
        .select('amount createdAt recipientWallet')
        .lean();

      if (transactions.length === 0) return;

      const amounts = transactions.map((t) => t.amount);
      const hours = transactions.map((t) => new Date(t.createdAt).getUTCHours());
      const days = transactions.map((t) => new Date(t.createdAt).getUTCDay());

      await BehaviorProfiles.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            averageTransactionAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
            averageMonthlyTransactions: transactions.length,
            typicalTransactionHours: [...new Set(hours)],
            typicalDaysOfWeek: [...new Set(days)],
            lastUpdated: new Date(),
          },
        },
        { upsert: true },
      );
    } catch (error) {
      Logger.error('[RiskEngine] Failed to update behavior profile', { error, userId });
    }
  }
}
