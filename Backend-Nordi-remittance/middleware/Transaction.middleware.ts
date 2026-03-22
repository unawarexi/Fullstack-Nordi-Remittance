// ============================================================================
// TRANSACTION MIDDLEWARE
// ============================================================================

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { TransactionType } from '../types/index.js';
import { Wallets, AccountBalances } from '../models/AccountsModel.js';
import Transactions from '../models/TransactionModel.js';
import { 
  ValidationError, 
  InsufficientBalanceError, 
  TransactionLimitExceededError,
  DuplicateTransactionError,
  WalletNotFoundError,
  WalletSuspendedError,
  WalletFrozenError
} from '../core/errors/AppError.js';
import { validateTransferData, isValidAmount, isValidCurrency } from '../core/helpers/validation.helper.js';
import { constants } from '../config/env.config.js';

// ============================================================================
// IDEMPOTENCY KEY HANDLING
// ============================================================================

const idempotencyStore = new Map<string, { response: any; timestamp: number }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.timestamp < cutoff) {
      idempotencyStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Handle idempotency for transaction requests
 */
export function idempotencyMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const idempotencyKey = req.headers['x-idempotency-key'] as string;

  if (!idempotencyKey) {
    return next();
  }

  const cacheKey = `${req.user?.userId}:${idempotencyKey}`;
  const cached = idempotencyStore.get(cacheKey);

  if (cached) {
    res.setHeader('X-Idempotency-Replay', 'true');
    res.status(200).json(cached.response);
    return;
  }

  // Store the original json function
  const originalJson = res.json.bind(res);

  // Override json to cache the response
  res.json = function (body: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(cacheKey, {
        response: body,
        timestamp: Date.now(),
      });
    }
    return originalJson(body);
  };

  next();
}

// ============================================================================
// TRANSACTION VALIDATION
// ============================================================================

/**
 * Validate transaction request data
 */
export function validateTransactionRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const { amount, currency, type } = req.body;

  const errors: string[] = [];

  // Validate amount
  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
  } else if (!isValidAmount(parseFloat(amount))) {
    errors.push(`Amount must be between ${constants.MIN_TRANSACTION_AMOUNT} and ${constants.MAX_TRANSACTION_AMOUNT}`);
  }

  // Validate currency
  if (!currency) {
    errors.push('Currency is required');
  } else if (!isValidCurrency(currency)) {
    errors.push(`Currency '${currency}' is not supported`);
  }

  // Validate type
  const validTypes: TransactionType[] = [
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.TRANSFER,
    TransactionType.PAYMENT,
    TransactionType.REFUND,
    TransactionType.FEE,
    TransactionType.REVERSAL,
    TransactionType.EXCHANGE
  ];
  if (!type) {
    errors.push('Transaction type is required');
  } else if (!validTypes.includes(type)) {
    errors.push(`Invalid transaction type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ValidationError('Transaction validation failed', { errors }));
  }

  // Normalize amount
  req.body.amount = parseFloat(amount);
  req.body.currency = currency.toUpperCase();

  next();
}

/**
 * Validate transfer-specific data
 */
export function validateTransferRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const validation = validateTransferData(req.body);

  if (!validation.isValid) {
    return next(new ValidationError('Transfer validation failed', { 
      errors: validation.errors 
    }));
  }

  next();
}

// ============================================================================
// BALANCE VERIFICATION
// ============================================================================

/**
 * Check if user has sufficient balance for the transaction
 */
export async function checkSufficientBalance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, currency, type, fromWalletId } = req.body;
    const userId = req.user?.userId;

    // Only check balance for debit transactions
    const debitTypes: TransactionType[] = [
      TransactionType.WITHDRAWAL,
      TransactionType.TRANSFER,
      TransactionType.PAYMENT
    ];
    if (!debitTypes.includes(type)) {
      return next();
    }

    // Find user's wallet
    const wallet = await Wallets.findOne({
      $or: [
        { _id: fromWalletId },
        { user: userId, isPrimary: true }
      ]
    }).lean();

    if (!wallet) {
      return next(new WalletNotFoundError());
    }

    // Check wallet status
    if (wallet.status === 'suspended') {
      return next(new WalletSuspendedError(wallet.freezeReason));
    }

    if (wallet.status === 'closed') {
      return next(new WalletFrozenError('Wallet is closed'));
    }

    // Get balance for the currency
    const balance = await AccountBalances.findOne({
      wallet: wallet._id,
      currency: currency.toUpperCase(),
    }).lean();

    const availableBalance = balance?.availableBalance || 0;

    if (availableBalance < amount) {
      return next(new InsufficientBalanceError(amount, availableBalance));
    }

    // Attach wallet to request for later use
    req.body.sourceWallet = wallet;

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TRANSACTION LIMITS
// ============================================================================

/**
 * Check transaction limits (daily, monthly, per-transaction)
 */
export async function checkTransactionLimits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, type, sourceWallet } = req.body;
    const userId = req.user?.userId;

    // Skip for credit transactions
    const debitTypes: TransactionType[] = [
      TransactionType.WITHDRAWAL,
      TransactionType.TRANSFER,
      TransactionType.PAYMENT
    ];
    if (!debitTypes.includes(type)) {
      return next();
    }

    const wallet = sourceWallet || await Wallets.findOne({ user: userId, isPrimary: true }).lean();

    if (!wallet) {
      return next(new WalletNotFoundError());
    }

    // Check per-transaction limit
    if (wallet.limits?.perTransaction && amount > wallet.limits.perTransaction) {
      return next(new TransactionLimitExceededError(
        'per-transaction',
        wallet.limits.perTransaction,
        amount
      ));
    }

    // Calculate today's transactions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyTotal = await Transactions.aggregate([
      {
        $match: {
          wallet: wallet._id,
          type: { $in: debitTypes },
          status: { $in: ['completed', 'pending'] },
          createdAt: { $gte: startOfDay },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentDailyTotal = dailyTotal[0]?.total || 0;

    if (wallet.limits?.daily && (currentDailyTotal + amount) > wallet.limits.daily) {
      return next(new TransactionLimitExceededError(
        'daily',
        wallet.limits.daily,
        currentDailyTotal + amount
      ));
    }

    // Calculate monthly transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTotal = await Transactions.aggregate([
      {
        $match: {
          wallet: wallet._id,
          type: { $in: debitTypes },
          status: { $in: ['completed', 'pending'] },
          createdAt: { $gte: startOfMonth },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentMonthlyTotal = monthlyTotal[0]?.total || 0;

    if (wallet.limits?.monthly && (currentMonthlyTotal + amount) > wallet.limits.monthly) {
      return next(new TransactionLimitExceededError(
        'monthly',
        wallet.limits.monthly,
        currentMonthlyTotal + amount
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * Detect potential duplicate transactions
 */
export async function detectDuplicateTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, type, recipientWalletId, recipientAccountNumber } = req.body;
    const userId = req.user?.userId;

    // Check for similar transaction in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const similarTransaction = await Transactions.findOne({
      initiatedBy: userId,
      type,
      amount,
      ...(recipientWalletId && { recipientWallet: recipientWalletId }),
      ...(recipientAccountNumber && { recipientAccountNumber }),
      createdAt: { $gte: fiveMinutesAgo },
      status: { $in: ['pending', 'completed'] },
    }).lean();

    if (similarTransaction) {
      return next(new DuplicateTransactionError(similarTransaction.referenceNumber));
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// FRAUD CHECKS (Basic)
// ============================================================================

/**
 * Basic fraud detection checks
 */
export async function basicFraudCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, type, isInternational } = req.body;
    const userId = req.user?.userId;

    // Get user's transaction history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentTransactions = await Transactions.find({
      initiatedBy: userId,
      createdAt: { $gte: thirtyDaysAgo },
      status: 'completed',
    }).lean();

    // Calculate average transaction amount
    const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = recentTransactions.length > 0 ? totalAmount / recentTransactions.length : 0;

    // Flag if transaction is significantly larger than average
    if (avgAmount > 0 && amount > avgAmount * 5) {
      req.body.requiresReview = true;
      req.body.reviewReason = 'Transaction amount significantly higher than average';
    }

    // Flag international transactions for new users
    if (isInternational) {
      const user = await Transactions.countDocuments({ initiatedBy: userId });
      if (user < 5) {
        req.body.requiresReview = true;
        req.body.reviewReason = 'International transaction from new user';
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  idempotencyMiddleware,
  validateTransactionRequest,
  validateTransferRequest,
  checkSufficientBalance,
  checkTransactionLimits,
  detectDuplicateTransaction,
  basicFraudCheck,
};