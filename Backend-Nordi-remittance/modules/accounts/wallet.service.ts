import mongoose from "mongoose";
import { Wallets, LedgerEntries, AccountLimits } from "./accounts.model.js";
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

    const wallets = await Wallets.find({ user: userId })
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

    const existingWallets = await Wallets.countDocuments({ user: userId });
    if (existingWallets >= 5) {
      throw new ForbiddenError("Maximum wallet limit reached (5 wallets per user)");
    }

    if (type !== "savings") {
      await Wallets.findOne({
        user: userId,
        walletType: { $ne: "savings" },
      });
    }

    const walletCurrency = currency?.toUpperCase() || "USD";
    const wallet = new Wallets({
      user: userId,
      walletNumber: generateWalletNumber(),
      balances: new Map([[walletCurrency, 0]]),
      status: "active",
      walletType: type || "personal",
      isPrimary: existingWallets === 0,
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
   * Close/Deactivate wallet
   */
  static async closeWallet(userId: string, walletId: string) {
    const wallet = await Wallets.findOne({ _id: walletId, user: userId });
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (wallet.isPrimary) {
      throw new ForbiddenError("Cannot close primary wallet");
    }

    let hasBalance = false;
    if (wallet.balances) {
      wallet.balances.forEach((balance) => {
        if (balance > 0) hasBalance = true;
      });
    }

    if (hasBalance) {
      throw new ValidationError("Please transfer or withdraw remaining balance before closing wallet");
    }

    const pendingTransactions = await Transactions.countDocuments({
      wallet: wallet._id,
      status: { $in: ["pending"] },
    });

    if (pendingTransactions > 0) {
      throw new ValidationError("Cannot close wallet with pending transactions");
    }

    wallet.status = "closed";
    wallet.closedAt = new Date();
    wallet.updatedAt = new Date();
    await wallet.save();

    await Promise.all([
      cacheDelete(`${CACHE_KEYS.USER_WALLETS}${userId}`),
      cacheDelete(`${CACHE_KEYS.WALLET}${userId}:${walletId}`),
    ]);

    emitToUser(userId, WS_EVENTS.WALLET_CLOSED, {
      walletId: wallet._id,
      walletNumber: wallet.walletNumber,
      message: "Wallet closed successfully",
      timestamp: new Date().toISOString(),
    });

    return { wallet };
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
      throw new ValidationError("Invalid status");
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
