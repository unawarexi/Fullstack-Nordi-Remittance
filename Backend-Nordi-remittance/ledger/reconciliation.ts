// ============================================================================
// RECONCILIATION ENGINE — End-of-day balancing, gap detection, auto-healing
// ============================================================================
import mongoose from 'mongoose';
import {
  LedgerEntries,
  AccountBalances,
  Wallets,
} from '../modules/accounts/accounts.model.js';
import Transactions from '../modules/transactions/transactions.model.js';
import { Journal } from './journal.js';
import logger from '../logs/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface ReconciliationReport {
  runAt: Date;
  period: { from: Date; to: Date };
  journalBalance: { isBalanced: boolean; totalDebits: number; totalCredits: number };
  balanceDiscrepancies: Array<{
    walletId: string;
    currency: string;
    expected: number;
    actual: number;
    diff: number;
  }>;
  orphanedEntries: number;
  staleTransactions: number;
  status: 'clean' | 'discrepancies_found' | 'critical';
}

// ============================================================================
// RECONCILIATION SERVICE
// ============================================================================

export class ReconciliationEngine {
  /**
   * Full end-of-day reconciliation.
   */
  static async runDaily(date: Date = new Date()): Promise<ReconciliationReport> {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86_400_000);

    logger.info(`[Reconciliation] Starting daily reconciliation for ${dayStart.toISOString().slice(0, 10)}`);

    // 1. Journal balance check
    const journalSummary = await Journal.dailySummary(dayStart);

    // 2. Balance verification (ledger entries vs AccountBalances)
    const discrepancies = await Journal.verifyBalances();

    // 3. Orphaned ledger entries (entries without a valid transaction)
    const orphaned = await LedgerEntries.aggregate([
      {
        $match: {
          accountingDate: { $gte: dayStart, $lt: dayEnd },
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'transaction',
          foreignField: '_id',
          as: 'tx',
        },
      },
      { $match: { tx: { $size: 0 } } },
      { $count: 'total' },
    ]);
    const orphanedEntries = orphaned[0]?.total || 0;

    // 4. Stale pending transactions (pending > 24 hours)
    const staleCutoff = new Date(Date.now() - 86_400_000);
    const staleTransactions = await Transactions.countDocuments({
      status: 'pending',
      createdAt: { $lt: staleCutoff },
    });

    // 5. Determine status
    let status: 'clean' | 'discrepancies_found' | 'critical' = 'clean';
    if (discrepancies.length > 0 || orphanedEntries > 0) status = 'discrepancies_found';
    if (!journalSummary.isBalanced || discrepancies.some(d => Math.abs(d.diff) > 100)) {
      status = 'critical';
    }

    const report: ReconciliationReport = {
      runAt: new Date(),
      period: { from: dayStart, to: dayEnd },
      journalBalance: {
        isBalanced: journalSummary.isBalanced,
        totalDebits: journalSummary.totalDebits,
        totalCredits: journalSummary.totalCredits,
      },
      balanceDiscrepancies: discrepancies,
      orphanedEntries,
      staleTransactions,
      status,
    };

    if (status === 'critical') {
      logger.error('[Reconciliation] CRITICAL — Journal imbalance or large discrepancy detected', report);
    } else if (status === 'discrepancies_found') {
      logger.warn('[Reconciliation] Discrepancies found', report);
    } else {
      logger.info('[Reconciliation] Clean — all balanced');
    }

    return report;
  }

  /**
   * Auto-expire stale pending transactions by marking them failed.
   */
  static async expirePending(maxAgeMs = 86_400_000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const result = await Transactions.updateMany(
      { status: 'pending', createdAt: { $lt: cutoff } },
      {
        $set: {
          status: 'failed',
          failedReason: 'Auto-expired: exceeded pending timeout',
          updatedAt: new Date(),
        },
      },
    );
    const modifiedCount = result.modifiedCount || 0;
    if (modifiedCount > 0) {
      logger.info(`[Reconciliation] Expired ${modifiedCount} stale pending transactions`);
    }
    return modifiedCount;
  }

  /**
   * Recalculate an AccountBalance from scratch using ledger entries.
   * Use when a discrepancy is detected.
   */
  static async recalculateBalance(walletId: string, currency: string): Promise<void> {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const agg = await LedgerEntries.aggregate([
          {
            $match: {
              wallet: new mongoose.Types.ObjectId(walletId),
              currency,
              isReversed: { $ne: true },
            },
          },
          {
            $group: {
              _id: null,
              credits: {
                $sum: { $cond: [{ $eq: ['$entryType', 'credit'] }, '$amount', 0] },
              },
              debits: {
                $sum: { $cond: [{ $eq: ['$entryType', 'debit'] }, '$amount', 0] },
              },
            },
          },
        ]).session(session);

        const ledgerBalance = agg.length > 0
          ? Math.round((agg[0].credits - agg[0].debits) * 100) / 100
          : 0;

        // Pending balance: sum of amount for pending transactions
        const pendingAgg = await Transactions.aggregate([
          {
            $match: {
              wallet: new mongoose.Types.ObjectId(walletId),
              currency,
              status: 'pending',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).session(session);

        const pendingBalance = pendingAgg[0]?.total || 0;

        await AccountBalances.findOneAndUpdate(
          { wallet: walletId, currency },
          {
            $set: {
              ledgerBalance,
              availableBalance: ledgerBalance - pendingBalance,
              pendingBalance,
              lastUpdated: new Date(),
            },
          },
          { upsert: true, session },
        );

        // Also update the Wallets.balances map
        await Wallets.updateOne(
          { _id: walletId },
          { $set: { [`balances.${currency}`]: ledgerBalance } },
          { session },
        );

        logger.info(`[Reconciliation] Recalculated balance for wallet=${walletId} currency=${currency}: ${ledgerBalance}`);
      });
    } finally {
      await session.endSession();
    }
  }
}
