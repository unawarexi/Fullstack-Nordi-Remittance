// ============================================================================
// ACCOUNTS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  Wallets,
  AccountBalances,
  LedgerEntries,
  AccountLimits,
} from "../models/AccountsModel.js";
import Users from "../models/UserModel.js";
import Transactions from "../models/TransactionModel.js";
import { generateWalletNumber } from "../core/helpers/generator.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNotFound,
} from "../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../core/errors/AppError.js";
import { constants } from "../config/env.config.js";

// Redis caching imports
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  CACHE_KEYS,
  CACHE_TTL,
  cacheUserWallets,
  getCachedUserWallets,
} from "../services/redis.service.js";

// WebSocket imports for real-time notifications
import {
  emitToUser,
  broadcast,
  emitToRoom,
} from "../services/websocket.service.js";

// WebSocket event constants
const WS_EVENTS = {
  WALLET_CREATED: "wallet:created",
  WALLET_UPDATED: "wallet:updated",
  WALLET_CLOSED: "wallet:closed",
  WALLET_STATUS_CHANGED: "wallet:status_changed",
  BALANCE_UPDATED: "balance:updated",
  BENEFICIARY_ADDED: "beneficiary:added",
  BENEFICIARY_REMOVED: "beneficiary:removed",
  ACCOUNT_LIMITS_UPDATED: "account:limits_updated",
} as const;

// ============================================================================
// GET USER WALLETS
// ============================================================================

/**
 * Get user's wallets
 * GET /accounts/wallets
 */
export async function getWallets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;

    // Try to get from Redis cache first
    const cacheKey = `${CACHE_KEYS.USER_WALLETS}${userId}`;
    const cachedWallets = await cacheGet(cacheKey);

    if (cachedWallets) {
      sendSuccess(res, { wallets: cachedWallets, cached: true });
      return;
    }

    const wallets = await Wallets.find({ user: userId })
      .select("-__v")
      .sort({ walletType: 1, createdAt: 1 });

    const walletsWithStats = await Promise.all(
      wallets.map(async (wallet) => {
        // Get recent transactions count
        const recentTransactions = await Transactions.countDocuments({
          wallet: wallet._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });

        return {
          ...wallet.toObject(),
          recentTransactionsCount: recentTransactions,
        };
      }),
    );

    // Cache the wallets data
    await cacheSet(cacheKey, walletsWithStats, CACHE_TTL.ACCOUNT);

    sendSuccess(res, { wallets: walletsWithStats });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific wallet
 * GET /accounts/wallets/:id
 */
export async function getWalletById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const userId = req.user.userId;

    // Try cache first for individual wallet
    const cacheKey = `${CACHE_KEYS.WALLET}${userId}:${id}`;
    const cachedWallet = await cacheGet<Record<string, unknown>>(cacheKey);

    if (cachedWallet) {
      sendSuccess(res, { ...cachedWallet, cached: true });
      return;
    }

    const wallet = await Wallets.findOne({
      $or: [
        { _id: id, user: userId },
        { walletNumber: id, user: userId },
      ],
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    // Get limits
    const limits = await AccountLimits.findOne({ wallet: wallet._id });

    // Get recent ledger entries
    const recentEntries = await LedgerEntries.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const walletData = {
      wallet,
      limits,
      recentEntries,
    };

    // Cache wallet details
    await cacheSet(cacheKey, walletData, CACHE_TTL.ACCOUNT);

    sendSuccess(res, {
      wallet,
      limits,
      recentEntries,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CREATE WALLET
// ============================================================================

/**
 * Create new wallet
 * POST /accounts/wallets
 */
export async function createWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;
    const { currency, type, name } = req.body;

    // Validate currency
    const supportedCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "NGN",
      "KES",
      "GHS",
      "ZAR",
      "CAD",
      "AUD",
    ];
    if (currency && !supportedCurrencies.includes(currency.toUpperCase())) {
      throw new ValidationError(
        `Unsupported currency. Supported: ${supportedCurrencies.join(", ")}`,
      );
    }

    // Check wallet limit per user
    const existingWallets = await Wallets.countDocuments({ user: userId });
    if (existingWallets >= 5) {
      throw new ForbiddenError(
        "Maximum wallet limit reached (5 wallets per user)",
      );
    }

    // Check for duplicate currency wallet (unless it's a savings wallet)
    if (type !== "savings") {
      const existingCurrencyWallet = await Wallets.findOne({
        user: userId,
        walletType: { $ne: "savings" },
      });

      // Note: Wallet uses balances Map, so we check differently
    }

    const walletCurrency = currency?.toUpperCase() || "USD";
    const wallet = new Wallets({
      user: userId,
      walletNumber: generateWalletNumber(),
      balances: new Map([[walletCurrency, 0]]),
      status: "active",
      walletType: type || "personal",
      isPrimary: existingWallets === 0, // First wallet is primary
    });

    await wallet.save();

    // Create default limits
    await AccountLimits.create({
      wallet: wallet._id,
      limitType: "daily",
      category: "all",
      amount: 5000,
      currency: walletCurrency,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Invalidate user wallets cache
    await cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`);

    // Emit WebSocket event for wallet creation
    emitToUser(userId, WS_EVENTS.WALLET_CREATED, {
      wallet: wallet.toObject(),
      message: "New wallet created successfully",
      timestamp: new Date().toISOString(),
    });

    sendCreated(res, { wallet }, "Wallet created successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE WALLET
// ============================================================================

/**
 * Update wallet settings
 * PATCH /accounts/wallets/:id
 */
export async function updateWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;
    const { id } = req.params;
    const { name, isDefault } = req.body;

    const wallet = await Wallets.findOne({
      _id: id,
      user: userId,
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (name) {
      // Store name in notes field since Wallet schema doesn't have a name field
      wallet.notes = name;
    }

    if (isDefault === true) {
      // Unset other wallets as primary
      await Wallets.updateMany(
        { user: userId, _id: { $ne: wallet._id } },
        { isPrimary: false },
      );
      wallet.isPrimary = true;
    }

    wallet.updatedAt = new Date();
    await wallet.save();

    // Invalidate caches
    await Promise.all([
      cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`),
      cacheDelete(`${CACHE_KEYS.WALLET}${userId}:${id}`),
    ]);

    // Emit WebSocket event for wallet update
    emitToUser(userId, WS_EVENTS.WALLET_UPDATED, {
      walletId: wallet._id,
      updates: { name, isDefault },
      message: "Wallet updated successfully",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { wallet }, "Wallet updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CLOSE WALLET
// ============================================================================

/**
 * Close/Deactivate wallet
 * POST /accounts/wallets/:id/close
 */
export async function closeWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;
    const { id } = req.params;

    const wallet = await Wallets.findOne({
      _id: id,
      user: userId,
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (wallet.isPrimary) {
      throw new ForbiddenError("Cannot close primary wallet");
    }

    // Check if wallet has any balance
    let hasBalance = false;
    if (wallet.balances) {
      wallet.balances.forEach((balance) => {
        if (balance > 0) hasBalance = true;
      });
    }

    if (hasBalance) {
      throw new ValidationError(
        "Please transfer or withdraw remaining balance before closing wallet",
      );
    }

    // Check for pending transactions
    const pendingTransactions = await Transactions.countDocuments({
      wallet: wallet._id,
      status: { $in: ["pending"] },
    });

    if (pendingTransactions > 0) {
      throw new ValidationError(
        "Cannot close wallet with pending transactions",
      );
    }

    wallet.status = "closed";
    wallet.closedAt = new Date();
    wallet.updatedAt = new Date();
    await wallet.save();

    // Invalidate caches
    await Promise.all([
      cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`),
      cacheDelete(`${CACHE_KEYS.WALLET}${userId}:${id}`),
    ]);

    // Emit WebSocket event for wallet closure
    emitToUser(userId, WS_EVENTS.WALLET_CLOSED, {
      walletId: wallet._id,
      walletNumber: wallet.walletNumber,
      message: "Wallet closed successfully",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { wallet }, "Wallet closed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET WALLET BALANCE HISTORY
// ============================================================================

/**
 * Get wallet balance history
 * GET /accounts/wallets/:id/history
 */
export async function getBalanceHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const wallet = await Wallets.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    const filter: Record<string, any> = { wallet: wallet._id };

    // Date filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Type filter
    if (req.query.type) {
      filter.entryType = req.query.type;
    }

    const [entries, total] = await Promise.all([
      LedgerEntries.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LedgerEntries.countDocuments(filter),
    ]);

    sendPaginated(
      res,
      entries,
      { page, limit, total },
      "Balance history retrieved",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET ACCOUNT LIMITS
// ============================================================================

/**
 * Get account limits
 * GET /accounts/limits
 */
export async function getAccountLimits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await Users.findById(req.user.userId).select("kycStatus");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get limits for all wallets
    const limits = await AccountLimits.find({
      wallet: {
        $in: await Wallets.find({ user: req.user.userId }).distinct("_id"),
      },
    }).lean();

    // Calculate used amounts for today/month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const [todayUsage, monthUsage] = await Promise.all([
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            status: "completed",
            createdAt: { $gte: today },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            status: "completed",
            createdAt: { $gte: firstDayOfMonth },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // Parse usage
    const todayTransfers =
      todayUsage.find((u) => u._id === "transfer")?.total || 0;
    const todayWithdrawals =
      todayUsage.find((u) => u._id === "withdrawal")?.total || 0;
    const monthTransfers =
      monthUsage.find((u) => u._id === "transfer")?.total || 0;
    const monthWithdrawals =
      monthUsage.find((u) => u._id === "withdrawal")?.total || 0;

    // Base limits based on KYC status
    const baseLimits = {
      pending: {
        dailyTransfer: 500,
        monthlyTransfer: 2000,
        dailyWithdrawal: 200,
        monthlyWithdrawal: 1000,
        perTransaction: 200,
      },
      approved: {
        dailyTransfer: 50000,
        monthlyTransfer: 200000,
        dailyWithdrawal: 10000,
        monthlyWithdrawal: 50000,
        perTransaction: 25000,
      },
    };

    const kycLimits =
      baseLimits[user.kycStatus as keyof typeof baseLimits] ||
      baseLimits.pending;

    sendSuccess(res, {
      limits: {
        daily: {
          transfer: {
            limit: kycLimits.dailyTransfer,
            used: todayTransfers,
            remaining: Math.max(0, kycLimits.dailyTransfer - todayTransfers),
          },
          withdrawal: {
            limit: kycLimits.dailyWithdrawal,
            used: todayWithdrawals,
            remaining: Math.max(
              0,
              kycLimits.dailyWithdrawal - todayWithdrawals,
            ),
          },
        },
        monthly: {
          transfer: {
            limit: kycLimits.monthlyTransfer,
            used: monthTransfers,
            remaining: Math.max(0, kycLimits.monthlyTransfer - monthTransfers),
          },
          withdrawal: {
            limit: kycLimits.monthlyWithdrawal,
            used: monthWithdrawals,
            remaining: Math.max(
              0,
              kycLimits.monthlyWithdrawal - monthWithdrawals,
            ),
          },
        },
        perTransaction: kycLimits.perTransaction,
      },
      kycStatus: user.kycStatus,
      walletLimits: limits,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET ACCOUNT SUMMARY
// ============================================================================

/**
 * Get account summary/dashboard data
 * GET /accounts/summary
 */
export async function getAccountSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const [wallets, recentTransactions, monthlyStats] = await Promise.all([
      // Get all wallets
      Wallets.find({ user: req.user.userId, status: "active" })
        .select("walletNumber balances walletType isPrimary")
        .lean(),

      // Recent transactions
      Transactions.find({
        initiatedBy: req.user.userId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Monthly stats
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            status: "completed",
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalIncoming: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["deposit", "refund"]] },
                  "$amount",
                  0,
                ],
              },
            },
            totalOutgoing: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["transfer", "withdrawal", "payment"]] },
                  "$amount",
                  0,
                ],
              },
            },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Calculate total balance across all wallets
    let totalBalance = 0;
    wallets.forEach((w) => {
      if (w.balances) {
        Object.values(Object.fromEntries(w.balances as any)).forEach(
          (balance: any) => {
            totalBalance += balance || 0;
          },
        );
      }
    });
    const primaryWallet = wallets.find((w) => w.isPrimary);

    // Format recent transactions
    const formattedTransactions = recentTransactions.map((tx) => ({
      id: tx._id,
      reference: tx.referenceNumber,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      direction: tx.type === "deposit" || tx.type === "refund" ? "in" : "out",
      createdAt: tx.createdAt,
    }));

    const stats = monthlyStats[0] || {
      totalIncoming: 0,
      totalOutgoing: 0,
      transactionCount: 0,
    };

    sendSuccess(res, {
      summary: {
        totalBalance,
        primaryCurrency: "USD", // Primary currency is derived from balances
        walletsCount: wallets.length,
        monthlyStats: {
          incoming: stats.totalIncoming,
          outgoing: stats.totalOutgoing,
          netFlow: stats.totalIncoming - stats.totalOutgoing,
          transactionCount: stats.transactionCount,
        },
      },
      wallets,
      recentTransactions: formattedTransactions,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BENEFICIARIES
// ============================================================================

/**
 * Get saved beneficiaries
 * GET /accounts/beneficiaries
 */
export async function getBeneficiaries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await Users.findById(req.user.userId)
      .select("beneficiaries")
      .lean();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    sendSuccess(res, { beneficiaries: user.beneficiaries || [] });
  } catch (error) {
    next(error);
  }
}

/**
 * Add beneficiary
 * POST /accounts/beneficiaries
 */
export async function addBeneficiary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { accountNumber, email, name, nickname, bankName, bankCode, type } =
      req.body;

    if (!accountNumber && !email) {
      throw new ValidationError("Account number or email is required");
    }

    // Verify beneficiary exists if internal
    if (accountNumber) {
      const beneficiaryUser = await Users.findOne({ accountNumber }).select(
        "firstName lastName accountNumber",
      );

      if (!beneficiaryUser) {
        throw new NotFoundError("Beneficiary not found");
      }
    }

    const beneficiary = {
      id: new mongoose.Types.ObjectId(),
      accountNumber,
      email,
      name: name || "Unknown",
      nickname: nickname || name,
      bankName,
      bankCode,
      type: type || "internal",
      createdAt: new Date(),
    };

    await Users.updateOne(
      { _id: req.user.userId },
      { $push: { beneficiaries: beneficiary } },
    );

    // Emit WebSocket event for beneficiary added
    emitToUser(req.user.userId, WS_EVENTS.BENEFICIARY_ADDED, {
      beneficiary,
      message: "Beneficiary added successfully",
      timestamp: new Date().toISOString(),
    });

    sendCreated(res, { beneficiary }, "Beneficiary added successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Remove beneficiary
 * DELETE /accounts/beneficiaries/:id
 */
export async function removeBeneficiary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;

    const idStr = Array.isArray(id) ? id[0] : id;
    await Users.updateOne(
      { _id: req.user.userId },
      { $pull: { beneficiaries: { id: new mongoose.Types.ObjectId(idStr) } } },
    );

    // Emit WebSocket event for beneficiary removed
    emitToUser(req.user.userId, WS_EVENTS.BENEFICIARY_REMOVED, {
      beneficiaryId: idStr,
      message: "Beneficiary removed successfully",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Beneficiary removed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL WALLETS
// ============================================================================

/**
 * Get all wallets (admin)
 * GET /accounts/admin/wallets
 */
export async function getAllWallets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.user = req.query.userId;

    const [wallets, total] = await Promise.all([
      Wallets.find(filter)
        .populate("user", "firstName lastName email accountNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Wallets.countDocuments(filter),
    ]);

    sendPaginated(res, wallets, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

/**
 * Update wallet status (admin)
 * PATCH /accounts/admin/wallets/:id/status
 */
export async function updateWalletStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ["active", "frozen", "suspended", "closed"];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError("Invalid status");
    }

    const wallet = await Wallets.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
        ...(status === "suspended" && { freezeReason: reason }),
        ...(status === "closed" && { closedAt: new Date() }),
      },
      { new: true },
    );

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    emitToUser(String(wallet.user), WS_EVENTS.WALLET_STATUS_CHANGED, {
      walletId: wallet._id,
      status,
      reason: reason || undefined,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { wallet }, `Wallet status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getWallets,
  getWalletById,
  createWallet,
  updateWallet,
  closeWallet,
  getBalanceHistory,
  getAccountLimits,
  getAccountSummary,
  getBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  getAllWallets,
  updateWalletStatus,
};
