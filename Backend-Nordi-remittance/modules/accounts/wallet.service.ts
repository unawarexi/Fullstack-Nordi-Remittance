// @ts-nocheck
import mongoose from "mongoose";
import { Wallets, LedgerEntries, AccountLimits, AccountStatusHistories } from "./accounts.model.js";
import { Cards } from "../cards/cards.model.js";
import Transactions from "../transactions/transactions.model.js";
import { generateWalletNumber } from "../../core/helpers/generator.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  CACHE_KEYS,
  CACHE_TTL,
} from "../../services/redis.service.js";
import { emitToUser } from "../../services/websocket.service.js";
import { DEFAULT_ACCOUNT_POLICIES } from "./wallet-lifecycle.service.js";

// WebSocket event constants for wallet
const WS_EVENTS = {
  WALLET_CREATED: "wallet:created",
  WALLET_UPDATED: "wallet:updated",
  WALLET_CLOSED: "wallet:closed",
  WALLET_STATUS_CHANGED: "wallet:status_changed",
} as const;

export class WalletService {
  /**
   * Get user's wallets
   */
  static async getWallets(userId: string) {
    const cacheKey = `${CACHE_KEYS.USER_WALLETS}${userId}`;
    const cachedWallets = await cacheGet(cacheKey);

    if (cachedWallets) {
      return { wallets: cachedWallets, cached: true };
    }

    const wallets = await Wallets.find({ user: userId, isDeleted: { $ne: true } })
      .select("-__v")
      .sort({ walletType: 1, createdAt: 1 });

    const walletsWithStats = await Promise.all(
      wallets.map(async (wallet) => {
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

    await cacheSet(cacheKey, walletsWithStats, CACHE_TTL.ACCOUNT);
    return { wallets: walletsWithStats };
  }

  /**
   * Get specific wallet
   */
  static async getWalletById(userId: string, walletId: string) {
    const cacheKey = `${CACHE_KEYS.WALLET}${userId}:${walletId}`;
    const cachedWallet = await cacheGet<Record<string, unknown>>(cacheKey);

    if (cachedWallet) {
      return { ...cachedWallet, cached: true };
    }

    const wallet = await Wallets.findOne({
      $or: [
        { _id: walletId, user: userId },
        { walletNumber: walletId, user: userId },
      ],
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    const limits = await AccountLimits.findOne({ wallet: wallet._id });
    const recentEntries = await LedgerEntries.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const walletData = { wallet, limits, recentEntries };
    await cacheSet(cacheKey, walletData, CACHE_TTL.ACCOUNT);

    return walletData;
  }

  /**
   * Create new wallet
   */
  static async createWallet(userId: string, data: { currency?: string; type?: string; name?: string }) {
    const { currency, type } = data;
    const supportedCurrencies = ["USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR", "CAD", "AUD"];

    if (currency && !supportedCurrencies.includes(currency.toUpperCase())) {
      throw new ValidationError(`Unsupported currency. Supported: ${supportedCurrencies.join(", ")}`);
    }

    const existingWallets = await Wallets.countDocuments({ user: userId, isDeleted: { $ne: true } });
    if (existingWallets >= 10) {
      throw new ForbiddenError("Maximum wallet limit reached (10 wallets per user)");
    }

    if (type !== "savings") {
      await Wallets.findOne({
        user: userId,
        walletType: { $ne: "savings" },
      });
    }

    const walletCurrency = currency?.toUpperCase() || "USD";
    const walletType = type || "personal";
    const policies = DEFAULT_ACCOUNT_POLICIES[walletType] || DEFAULT_ACCOUNT_POLICIES.personal;

    const wallet = new Wallets({
      user: userId,
      walletNumber: generateWalletNumber(),
      balances: new Map([[walletCurrency, 0]]),
      status: "active",
      walletType,
      isPrimary: existingWallets === 0,
      isDeleted: false,
      accountPolicies: { ...policies },
      // Set withdrawal counter reset for savings
      ...(walletType === "savings" && {
        withdrawalCount: 0,
        withdrawalCountResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      }),
    });

    await wallet.save();

    await AccountLimits.create({
      wallet: wallet._id,
      limitType: "daily",
      category: "all",
      amount: 5000,
      currency: walletCurrency,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`);

    emitToUser(userId, WS_EVENTS.WALLET_CREATED, {
      wallet: wallet.toObject(),
      message: "New wallet created successfully",
      timestamp: new Date().toISOString(),
    });

    return { wallet };
  }

  /**
   * Update wallet settings
   */
  static async updateWallet(userId: string, walletId: string, data: { name?: string; isDefault?: boolean; }) {
    const { name, isDefault } = data;

    const wallet = await Wallets.findOne({ _id: walletId, user: userId });
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (name) {
      wallet.notes = name;
    }

    if (isDefault === true) {
      await Wallets.updateMany(
        { user: userId, _id: { $ne: wallet._id } },
        { isPrimary: false },
      );
      wallet.isPrimary = true;
    }

    wallet.updatedAt = new Date();
    await wallet.save();

    await Promise.all([
      cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`),
      cacheDelete(`${CACHE_KEYS.WALLET}${userId}:${walletId}`),
    ]);

    emitToUser(userId, WS_EVENTS.WALLET_UPDATED, {
      walletId: wallet._id,
      updates: { name, isDefault },
      message: "Wallet updated successfully",
      timestamp: new Date().toISOString(),
    });

    return { wallet };
  }

  /**
   * Close/Deactivate wallet — SOFT DELETE
   * Transfers remaining balance and re-links cards to successor wallet.
   * Loan/investment data remains attached for audit continuity.
   */
  static async closeWallet(userId: string, walletId: string, successorWalletId?: string) {
    const wallet = await Wallets.findOne({ _id: walletId, user: userId, isDeleted: { $ne: true } });
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (wallet.isPrimary) {
      throw new ForbiddenError("Cannot close primary wallet. Designate another wallet as primary first.");
    }

    // Check for active loans
    if (wallet.linkedLoans && wallet.linkedLoans.length > 0) {
      const { Loans } = await import("../loans/loans.model.js");
      const activeLoans = await Loans.countDocuments({
        _id: { $in: wallet.linkedLoans },
        status: { $in: ["active", "pending"] },
      });
      if (activeLoans > 0) {
        throw new ValidationError("Cannot close wallet with active loans. Pay off outstanding loans first.");
      }
    }

    const pendingTransactions = await Transactions.countDocuments({
      wallet: wallet._id,
      status: { $in: ["pending"] },
    });
    if (pendingTransactions > 0) {
      throw new ValidationError("Cannot close wallet with pending transactions");
    }

    // Find successor wallet (user's primary, or specified)
    let successor;
    if (successorWalletId) {
      successor = await Wallets.findOne({ _id: successorWalletId, user: userId, isDeleted: { $ne: true }, status: "active" });
    }
    if (!successor) {
      successor = await Wallets.findOne({ user: userId, isPrimary: true, isDeleted: { $ne: true }, _id: { $ne: wallet._id } });
    }
    if (!successor) {
      successor = await Wallets.findOne({ user: userId, isDeleted: { $ne: true }, status: "active", _id: { $ne: wallet._id } });
    }

    // Transfer remaining balances to successor
    if (successor && wallet.balances) {
      wallet.balances.forEach((balance: number, currency: string) => {
        if (balance > 0) {
          const successorBalance = successor.balances?.get(currency) || 0;
          successor.balances?.set(currency, successorBalance + balance);
          wallet.balances?.set(currency, 0);
        }
      });
      successor.updatedAt = new Date();
      await successor.save();
    }

    // Re-link cards to successor
    if (successor) {
      const cardsOnThisWallet = await Cards.find({ wallet: wallet._id });
      for (const card of cardsOnThisWallet) {
        card.wallet = successor._id as any;
        if (card.fundingSource?.toString() === wallet._id.toString()) {
          card.fundingSource = successor._id as any;
        }
        card.updatedAt = new Date();
        await card.save();
      }

      // Add linked cards to successor
      if (!successor.linkedCards) successor.linkedCards = [];
      for (const cardId of (wallet.linkedCards || [])) {
        if (!successor.linkedCards.some((c: any) => c.toString() === cardId.toString())) {
          successor.linkedCards.push(cardId);
        }
      }
      await successor.save();
    }

    // Soft delete the wallet
    wallet.status = "closed";
    wallet.isDeleted = true;
    wallet.deletedAt = new Date();
    wallet.closedAt = new Date();
    wallet.closureReason = "User requested closure";
    wallet.migratedToWallet = successor?._id as any;
    wallet.updatedAt = new Date();
    await wallet.save();

    // Record status change in history
    await AccountStatusHistories.create({
      wallet: wallet._id,
      previousStatus: "active",
      newStatus: "closed",
      reason: "User requested closure",
      changedBy: userId,
      metadata: {
        successorWallet: successor?._id,
        balancesTransferred: true,
        cardsRelinked: true,
      },
      effectiveDate: new Date(),
    });

    await Promise.all([
      cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`),
      cacheDelete(`${CACHE_KEYS.WALLET}${userId}:${walletId}`),
    ]);

    emitToUser(userId, WS_EVENTS.WALLET_CLOSED, {
      walletId: wallet._id,
      walletNumber: wallet.walletNumber,
      successorWallet: successor?._id,
      message: "Wallet closed. Balances and cards transferred.",
      timestamp: new Date().toISOString(),
    });

    return { wallet, successor };
  }

  /**
   * Get user's closed/deleted wallets (for history viewing)
   */
  static async getClosedWallets(userId: string) {
    const closedWallets = await Wallets.find({ user: userId, isDeleted: true })
      .select("-__v")
      .sort({ deletedAt: -1 });
    return { wallets: closedWallets };
  }

  /**
   * Get all wallets (admin)
   */
  static async getAllWallets(filters: { status?: string; userId?: string }, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.user = filters.userId;

    const [wallets, total] = await Promise.all([
      Wallets.find(query)
        .populate("user", "firstName lastName email accountNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Wallets.countDocuments(query),
    ]);

    return { wallets, total, page, limit };
  }

  /**
   * Update wallet status (admin)
   */
  static async updateWalletStatus(walletId: string, status: string, reason?: string) {
    const validStatuses = ["active", "frozen", "suspended", "closed"];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError("Invalid status. Valid: " + validStatuses.join(", "));
    }

    const wallet = await Wallets.findByIdAndUpdate(
      walletId,
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

    return { wallet };
  }
}
