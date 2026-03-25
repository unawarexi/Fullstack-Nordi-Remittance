// ============================================================================
// JOURNAL — Structured journal entries for audit, reporting, end-of-day
// ============================================================================
import mongoose from 'mongoose';
import { LedgerEntries, AccountBalances, Wallets } from '../models/AccountsModel.js';
import Transactions from '../models/TransactionModel.js';

// ============================================================================
// TYPES
// ============================================================================

export interface JournalSummary {
  date: string;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  entryCount: number;
  currencies: Record<string, { debits: number; credits: number }>;
}

export interface TrialBalance {
  asOf: Date;
  accounts: Array<{
    walletId: string;
    currency: string;
    debitTotal: number;
    creditTotal: number;
    netBalance: number;
  }>;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export interface AccountStatement {
  walletId: string;
  currency: string;
  from: Date;
  to: Date;
  openingBalance: number;
  closingBalance: number;
  entries: Array<{
    date: Date;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    reference: string;
  }>;
  totalDebits: number;
  totalCredits: number;
}

// ============================================================================
// JOURNAL SERVICE
// ============================================================================

export class Journal {
  /**
   * Daily journal summary — ensures debits == credits for the day.
   */
  static async dailySummary(date: Date): Promise<JournalSummary> {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86_400_000);

    const pipeline = [
      { $match: { accountingDate: { $gte: dayStart, $lt: dayEnd } } },
      {
        $group: {
          _id: { currency: '$currency', entryType: '$entryType' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ];

    const results = await LedgerEntries.aggregate(pipeline);

    const currencies: Record<string, { debits: number; credits: number }> = {};
    let totalDebits = 0, totalCredits = 0, entryCount = 0;

    for (const row of results) {
      const cur = row._id.currency;
      if (!currencies[cur]) currencies[cur] = { debits: 0, credits: 0 };
      if (row._id.entryType === 'debit') {
        currencies[cur].debits += row.total;
        totalDebits += row.total;
      } else {
        currencies[cur].credits += row.total;
        totalCredits += row.total;
      }
      entryCount += row.count;
    }

    // Check balance per currency
    const isBalanced = Object.values(currencies).every(
      (c) => Math.abs(c.debits - c.credits) < 0.01,
    );

    return {
      date: dayStart.toISOString().slice(0, 10),
      totalDebits: round2(totalDebits),
      totalCredits: round2(totalCredits),
      isBalanced,
      entryCount,
      currencies,
    };
  }

  /**
   * Trial balance — snapshot of all accounts at a point in time.
   */
  static async trialBalance(asOf: Date = new Date()): Promise<TrialBalance> {
    const pipeline = [
      { $match: { accountingDate: { $lte: asOf } } },
      {
        $group: {
          _id: { wallet: '$wallet', currency: '$currency' },
          debitTotal: {
            $sum: { $cond: [{ $eq: ['$entryType', 'debit'] }, '$amount', 0] },
          },
          creditTotal: {
            $sum: { $cond: [{ $eq: ['$entryType', 'credit'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { '_id.wallet': 1, '_id.currency': 1 } as Record<string, 1 | -1> },
    ];

    const results = await LedgerEntries.aggregate(pipeline as any[]);

    let totalDebits = 0, totalCredits = 0;
    const accounts = results.map((row: any) => {
      totalDebits += row.debitTotal;
      totalCredits += row.creditTotal;
      return {
        walletId: row._id.wallet.toString(),
        currency: row._id.currency,
        debitTotal: round2(row.debitTotal),
        creditTotal: round2(row.creditTotal),
        netBalance: round2(row.creditTotal - row.debitTotal),
      };
    });

    return {
      asOf,
      accounts,
      totalDebits: round2(totalDebits),
      totalCredits: round2(totalCredits),
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }

  /**
   * Account statement — like a bank statement for a given wallet.
   */
  static async statement(
    walletId: string,
    currency: string,
    from: Date,
    to: Date,
  ): Promise<AccountStatement> {
    const entries = await LedgerEntries.find({
      wallet: walletId,
      currency,
      accountingDate: { $gte: from, $lte: to },
    })
      .sort({ accountingDate: 1, createdAt: 1 })
      .populate('transaction', 'referenceNumber type')
      .lean();

    // Opening balance: last entry before `from`
    const priorEntry = await LedgerEntries.findOne({
      wallet: walletId,
      currency,
      accountingDate: { $lt: from },
    })
      .sort({ accountingDate: -1, createdAt: -1 })
      .lean();

    const openingBalance = priorEntry ? (priorEntry as any).balance : 0;
    let totalDebits = 0, totalCredits = 0;

    const rows = entries.map((e: any) => {
      const debit = e.entryType === 'debit' ? e.amount : 0;
      const credit = e.entryType === 'credit' ? e.amount : 0;
      totalDebits += debit;
      totalCredits += credit;
      return {
        date: e.accountingDate,
        description: e.description,
        debit,
        credit,
        balance: e.balance,
        reference: (e.transaction as any)?.referenceNumber || '',
      };
    });

    return {
      walletId,
      currency,
      from,
      to,
      openingBalance,
      closingBalance: rows.length > 0 ? rows[rows.length - 1].balance : openingBalance,
      entries: rows,
      totalDebits: round2(totalDebits),
      totalCredits: round2(totalCredits),
    };
  }

  /**
   * Verify that AccountBalances match the running ledger totals.
   * Returns any discrepancies found.
   */
  static async verifyBalances(): Promise<Array<{
    walletId: string;
    currency: string;
    expected: number;
    actual: number;
    diff: number;
  }>> {
    const balances = await AccountBalances.find().lean();
    const discrepancies: Array<{
      walletId: string;
      currency: string;
      expected: number;
      actual: number;
      diff: number;
    }> = [];

    for (const bal of balances) {
      const b = bal as any;
      // Sum all ledger entries for this wallet+currency
      const agg = await LedgerEntries.aggregate([
        {
          $match: {
            wallet: b.wallet,
            currency: b.currency,
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
      ]);

      const expected = agg.length > 0 ? round2(agg[0].credits - agg[0].debits) : 0;
      const actual = round2(b.ledgerBalance);

      if (Math.abs(expected - actual) > 0.01) {
        discrepancies.push({
          walletId: b.wallet.toString(),
          currency: b.currency,
          expected,
          actual,
          diff: round2(expected - actual),
        });
      }
    }

    return discrepancies;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
