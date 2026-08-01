// ============================================================================
// LEDGER ENGINE — Core double-entry accounting with ACID guarantees
// ============================================================================
import mongoose from 'mongoose';
import {
  Wallets,
  AccountBalances,
  LedgerEntries,
  AccountLimits,
} from '../modules/accounts/accounts.model.js';
import Transactions from '../modules/transactions/transactions.model.js';
import RedisService from '../services/redis.service.js';
import { getKafkaService, KafkaTopics } from '../services/kafka.service.js';
import { generateReferenceNumber } from '../core/helpers/generator.js';
import { ledgerGuards, type TransferRequest, type LedgerResult } from './guards.js';

// ============================================================================
// TYPES
// ============================================================================

export interface DebitCreditPair {
  debitWalletId: string;
  creditWalletId: string;
  amount: number;
  currency: string;
  description: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'fee' | 'reversal' | 'exchange';
  meta?: Record<string, unknown>;
  idempotencyKey?: string;
  initiatedBy: string;
  channel?: 'web' | 'mobile' | 'api' | 'branch' | 'atm';
  isInternational?: boolean;
  recipientName?: string;
  recipientAccountNumber?: string;
  recipientBankName?: string;
  exchangeRate?: number;
  fee?: number;
  feeCurrency?: string;
}

export interface PostingResult {
  success: boolean;
  transactionId?: string;
  referenceNumber?: string;
  debitEntry?: string;
  creditEntry?: string;
  error?: string;
  code?: string;
}

// ============================================================================
// LEDGER ENGINE
// ============================================================================

export class LedgerEngine {
  /**
   * Execute a double-entry posting inside a MongoDB session (ACID).
   * Debit from one wallet, credit to another — always balanced.
   */
  static async post(pair: DebitCreditPair): Promise<PostingResult> {
    // ---- Idempotency check ----
    if (pair.idempotencyKey) {
      const existing = await Transactions.findOne({
        referenceNumber: pair.idempotencyKey,
      }).lean();
      if (existing) {
        return {
          success: true,
          transactionId: (existing as any)._id.toString(),
          referenceNumber: pair.idempotencyKey,
          code: 'IDEMPOTENT_DUPLICATE',
        };
      }
    }

    // ---- Distributed lock to prevent race conditions ----
    const lockKey = `ledger:${pair.debitWalletId}:${pair.creditWalletId}`;
    return RedisService.withLock(lockKey, async () => {
      return LedgerEngine.executePosting(pair);
    }, { ttl: 15, retries: 3, retryDelayMs: 200 });
  }

  private static async executePosting(pair: DebitCreditPair): Promise<PostingResult> {
    const session = await mongoose.startSession();
    try {
      let result: PostingResult = { success: false };

      await session.withTransaction(async () => {
        // ---- Load wallets ----
        const [debitWallet, creditWallet] = await Promise.all([
          Wallets.findById(pair.debitWalletId).session(session),
          Wallets.findById(pair.creditWalletId).session(session),
        ]);

        // ---- Pre-flight guards ----
        const guardResult = await ledgerGuards.validateTransfer({
          debitWallet: debitWallet as any,
          creditWallet: creditWallet as any,
          amount: pair.amount,
          currency: pair.currency,
          transactionType: pair.transactionType,
          initiatedBy: pair.initiatedBy,
        }, session);

        if (!guardResult.valid) {
          result = { success: false, error: guardResult.error, code: guardResult.code };
          throw new Error(guardResult.error); // abort transaction
        }

        // ---- Load/create balance records ----
        const [debitBalance, creditBalance] = await Promise.all([
          AccountBalances.findOneAndUpdate(
            { wallet: pair.debitWalletId, currency: pair.currency },
            { $setOnInsert: { wallet: pair.debitWalletId, currency: pair.currency, availableBalance: 0, ledgerBalance: 0, pendingBalance: 0, reservedBalance: 0 } },
            { upsert: true, new: true, session },
          ),
          AccountBalances.findOneAndUpdate(
            { wallet: pair.creditWalletId, currency: pair.currency },
            { $setOnInsert: { wallet: pair.creditWalletId, currency: pair.currency, availableBalance: 0, ledgerBalance: 0, pendingBalance: 0, reservedBalance: 0 } },
            { upsert: true, new: true, session },
          ),
        ]);

        // ---- Insufficient funds check ----
        if (pair.transactionType !== 'deposit' && debitBalance!.availableBalance < pair.amount) {
          result = { success: false, error: 'Insufficient funds', code: 'INSUFFICIENT_FUNDS' };
          throw new Error('Insufficient funds');
        }

        // ---- Create the transaction record ----
        const referenceNumber = pair.idempotencyKey || generateReferenceNumber(pair.transactionType.toUpperCase().slice(0, 3));
        const [transaction] = await Transactions.create([{
          wallet: pair.debitWalletId,
          type: pair.transactionType,
          amount: pair.amount,
          currency: pair.currency,
          status: 'completed',
          description: pair.description,
          referenceNumber,
          initiatedBy: pair.initiatedBy,
          recipientWallet: pair.creditWalletId,
          recipientName: pair.recipientName,
          recipientAccountNumber: pair.recipientAccountNumber,
          recipientBankName: pair.recipientBankName,
          exchangeRate: pair.exchangeRate,
          fee: pair.fee,
          feeCurrency: pair.feeCurrency,
          meta: pair.meta,
          channel: pair.channel || 'api',
          isInternational: pair.isInternational || false,
          completedAt: new Date(),
        }], { session });

        // ---- Create the balanced ledger entries ----
        const now = new Date();
        const newDebitLedgerBalance = debitBalance!.ledgerBalance - pair.amount;
        const newCreditLedgerBalance = creditBalance!.ledgerBalance + pair.amount;

        const [debitEntry, creditEntry] = await LedgerEntries.create([
          {
            transaction: transaction._id,
            wallet: pair.debitWalletId,
            entryType: 'debit',
            amount: pair.amount,
            currency: pair.currency,
            balance: newDebitLedgerBalance,
            description: `DEBIT: ${pair.description}`,
            accountingDate: now,
          },
          {
            transaction: transaction._id,
            wallet: pair.creditWalletId,
            entryType: 'credit',
            amount: pair.amount,
            currency: pair.currency,
            balance: newCreditLedgerBalance,
            description: `CREDIT: ${pair.description}`,
            accountingDate: now,
          },
        ], { session });

        // ---- Update balances atomically ----
        await Promise.all([
          AccountBalances.updateOne(
            { _id: debitBalance!._id },
            { $inc: { availableBalance: -pair.amount, ledgerBalance: -pair.amount }, $set: { lastUpdated: now } },
            { session },
          ),
          AccountBalances.updateOne(
            { _id: creditBalance!._id },
            { $inc: { availableBalance: pair.amount, ledgerBalance: pair.amount }, $set: { lastUpdated: now } },
            { session },
          ),
        ]);

        // ---- Update wallet balances map ----
        await Promise.all([
          Wallets.updateOne(
            { _id: pair.debitWalletId },
            {
              $inc: { [`balances.${pair.currency}`]: -pair.amount },
              $set: { lastTransactionAt: now },
              $push: { transactionHistory: transaction._id },
            },
            { session },
          ),
          Wallets.updateOne(
            { _id: pair.creditWalletId },
            {
              $inc: { [`balances.${pair.currency}`]: pair.amount },
              $set: { lastTransactionAt: now },
              $push: { transactionHistory: transaction._id },
            },
            { session },
          ),
        ]);

        // ---- Fee entry (if applicable) ----
        if (pair.fee && pair.fee > 0) {
          await LedgerEngine.postFee(
            pair.debitWalletId,
            pair.fee,
            pair.feeCurrency || pair.currency,
            transaction._id.toString(),
            session,
          );
        }

        result = {
          success: true,
          transactionId: transaction._id.toString(),
          referenceNumber,
          debitEntry: debitEntry._id.toString(),
          creditEntry: creditEntry._id.toString(),
        };
      });

      // ---- Post-commit: async events (outside transaction) ----
      if (result.success) {
        await Promise.allSettled([
          RedisService.invalidateTransactionCache(pair.initiatedBy),
          RedisService.invalidateAccountCache(pair.initiatedBy),
          Promise.resolve(getKafkaService()).then(kafka =>
            kafka.publish(KafkaTopics.TRANSACTION_COMPLETED, {
              transactionId: result.transactionId,
              referenceNumber: result.referenceNumber,
              debitWallet: pair.debitWalletId,
              creditWallet: pair.creditWalletId,
              amount: pair.amount,
              currency: pair.currency,
              type: pair.transactionType,
            }),
          ),
        ]);
      }

      return result;
    } catch (err: any) {
      // If result was already set with an error (guard failure), return that
      if (err.message === 'Insufficient funds' || err.message?.startsWith('GUARD:')) {
        return { success: false, error: err.message, code: 'GUARD_FAILURE' };
      }
      return { success: false, error: err.message || 'Ledger posting failed', code: 'INTERNAL_ERROR' };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Post a fee as a separate ledger entry (deducted from sender).
   */
  private static async postFee(
    walletId: string,
    amount: number,
    currency: string,
    transactionId: string,
    session: mongoose.ClientSession,
  ): Promise<void> {
    const balance = await AccountBalances.findOne(
      { wallet: walletId, currency },
    ).session(session);
    if (!balance) return;

    const newBalance = balance.ledgerBalance - amount;
    await LedgerEntries.create([{
      transaction: transactionId,
      wallet: walletId,
      entryType: 'debit',
      amount,
      currency,
      balance: newBalance,
      description: `FEE: Transaction ${transactionId}`,
      accountingDate: new Date(),
    }], { session });

    await AccountBalances.updateOne(
      { _id: balance._id },
      { $inc: { availableBalance: -amount, ledgerBalance: -amount } },
      { session },
    );
  }

  /**
   * Reverse a completed transaction — creates mirror entries.
   */
  static async reverse(
    transactionId: string,
    reason: string,
    reversedBy: string,
  ): Promise<PostingResult> {
    const original = await Transactions.findById(transactionId);
    if (!original) return { success: false, error: 'Transaction not found', code: 'NOT_FOUND' };
    if ((original as any).status === 'reversed') return { success: false, error: 'Already reversed', code: 'ALREADY_REVERSED' };
    if ((original as any).status !== 'completed') return { success: false, error: 'Only completed transactions can be reversed', code: 'INVALID_STATE' };

    const tx = original as any;
    return LedgerEngine.post({
      debitWalletId: tx.recipientWallet?.toString() || tx.wallet.toString(),
      creditWalletId: tx.wallet.toString(),
      amount: tx.amount,
      currency: tx.currency,
      description: `REVERSAL: ${reason}`,
      transactionType: 'reversal',
      meta: { originalTransactionId: transactionId, reason },
      initiatedBy: reversedBy,
      channel: tx.channel,
    });
  }

  /**
   * Hold/reserve funds (for pending authorizations like card holds).
   */
  static async hold(
    walletId: string,
    amount: number,
    currency: string,
    description: string,
  ): Promise<{ success: boolean; error?: string }> {
    const balance = await AccountBalances.findOne({ wallet: walletId, currency });
    if (!balance) return { success: false, error: 'Balance record not found' };
    if (balance.availableBalance < amount) return { success: false, error: 'Insufficient available balance' };

    await AccountBalances.updateOne(
      { _id: balance._id },
      { $inc: { availableBalance: -amount, reservedBalance: amount } },
    );
    return { success: true };
  }

  /**
   * Release a previously held amount.
   */
  static async releaseHold(
    walletId: string,
    amount: number,
    currency: string,
  ): Promise<{ success: boolean; error?: string }> {
    const balance = await AccountBalances.findOne({ wallet: walletId, currency });
    if (!balance) return { success: false, error: 'Balance record not found' };
    if (balance.reservedBalance < amount) return { success: false, error: 'Reserved balance insufficient' };

    await AccountBalances.updateOne(
      { _id: balance._id },
      { $inc: { availableBalance: amount, reservedBalance: -amount } },
    );
    return { success: true };
  }

  /**
   * Get the running balance for a wallet in a specific currency.
   */
  static async getBalance(walletId: string, currency: string) {
    const balance = await AccountBalances.findOne({ wallet: walletId, currency }).lean();
    if (!balance) return { available: 0, ledger: 0, pending: 0, reserved: 0 };
    return {
      available: balance.availableBalance,
      ledger: balance.ledgerBalance,
      pending: balance.pendingBalance,
      reserved: balance.reservedBalance,
    };
  }
}
