// ============================================================================
// LEDGER GUARDS — Pre-flight validation before every posting
// ============================================================================
import mongoose from 'mongoose';
import { AccountLimits } from '../modules/accounts/accounts.model.js';
import Transactions from '../modules/transactions/transactions.model.js';

// ============================================================================
// TYPES
// ============================================================================

export interface TransferRequest {
  debitWallet: { _id: any; status: string; user: any } | null;
  creditWallet: { _id: any; status: string; user: any } | null;
  amount: number;
  currency: string;
  transactionType: string;
  initiatedBy: string;
}

export interface GuardResult {
  valid: boolean;
  error?: string;
  code?: string;
}

export interface LedgerResult {
  success: boolean;
  error?: string;
  code?: string;
}

// ============================================================================
// GUARDS
// ============================================================================

export const ledgerGuards = {
  async validateTransfer(req: TransferRequest, session?: mongoose.ClientSession): Promise<GuardResult> {
    // 1. Wallet existence
    if (!req.debitWallet) return { valid: false, error: 'Source wallet not found', code: 'WALLET_NOT_FOUND' };
    if (!req.creditWallet) return { valid: false, error: 'Destination wallet not found', code: 'WALLET_NOT_FOUND' };

    // 2. Wallet status
    if (req.debitWallet.status !== 'active') {
      return { valid: false, error: `Source wallet is ${req.debitWallet.status}`, code: 'WALLET_INACTIVE' };
    }
    if (req.creditWallet.status !== 'active' && req.transactionType !== 'reversal') {
      return { valid: false, error: `Destination wallet is ${req.creditWallet.status}`, code: 'WALLET_INACTIVE' };
    }

    // 3. Amount validation
    if (!Number.isFinite(req.amount) || req.amount <= 0) {
      return { valid: false, error: 'Amount must be a positive finite number', code: 'INVALID_AMOUNT' };
    }
    // Precision check: no more than 2 decimal places
    if (Math.round(req.amount * 100) !== req.amount * 100) {
      return { valid: false, error: 'Amount precision exceeds 2 decimal places', code: 'INVALID_PRECISION' };
    }

    // 4. Self-transfer prevention (except for fee postings)
    if (
      req.debitWallet._id.toString() === req.creditWallet._id.toString() &&
      req.transactionType !== 'fee'
    ) {
      return { valid: false, error: 'Cannot transfer to the same wallet', code: 'SELF_TRANSFER' };
    }

    // 5. Transaction limits (skip for reversals)
    if (req.transactionType !== 'reversal') {
      const limitCheck = await checkLimits(
        req.debitWallet._id.toString(),
        req.amount,
        req.currency,
        req.transactionType,
        session,
      );
      if (!limitCheck.valid) return limitCheck;
    }

    return { valid: true };
  },
};

// ============================================================================
// LIMIT CHECKING
// ============================================================================

async function checkLimits(
  walletId: string,
  amount: number,
  currency: string,
  transactionType: string,
  session?: mongoose.ClientSession,
): Promise<GuardResult> {
  const category = mapTypeToCategory(transactionType);
  const limits = await AccountLimits.find({
    wallet: walletId,
    currency,
    isActive: true,
    $or: [{ category }, { category: 'all' }],
  }).session(session || null).lean();

  if (limits.length === 0) return { valid: true }; // no limits configured

  const now = new Date();

  for (const limit of limits) {
    const windowStart = getWindowStart(limit.limitType as string, now);

    // Calculate usage in current period
    const usage = await Transactions.aggregate([
      {
        $match: {
          wallet: new mongoose.Types.ObjectId(walletId),
          currency,
          status: { $in: ['completed', 'pending'] },
          createdAt: { $gte: windowStart },
          ...(category !== 'all' ? { type: category } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).session(session || null);

    const used = usage[0]?.total || 0;

    if (used + amount > (limit as any).amount) {
      return {
        valid: false,
        error: `${limit.limitType} ${category} limit exceeded (${used + amount} > ${(limit as any).amount} ${currency})`,
        code: 'LIMIT_EXCEEDED',
      };
    }
  }

  return { valid: true };
}

function mapTypeToCategory(type: string): string {
  switch (type) {
    case 'withdrawal': return 'withdrawal';
    case 'transfer':
    case 'payment': return 'transfer';
    default: return 'all';
  }
}

function getWindowStart(limitType: string, now: Date): Date {
  switch (limitType) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    case 'per_transaction':
      return new Date(0); // per-tx limits checked differently
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}
