import mongoose from "mongoose";
import { Wallets, LedgerEntries, AccountLimits } from "./accounts.model.js";
import Transactions from "../transactions/transactions.model.js";
import Users from "../users/users.model.js";
import { NotFoundError } from "../../core/errors/AppError.js";

export class AccountAnalyticsService {
  /**
   * Get wallet balance history
   */
  static async getBalanceHistory(
    userId: string,
    walletId: string,
    filters: { startDate?: string; endDate?: string; type?: string },
    pagination: { page: number; limit: number }
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const wallet = await Wallets.findOne({
      _id: walletId,
      user: userId,
    });

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    const query: Record<string, any> = { wallet: wallet._id };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters.type) {
      query.entryType = filters.type;
    }

    const [entries, total] = await Promise.all([
      LedgerEntries.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LedgerEntries.countDocuments(query),
    ]);

    return { entries, total, page, limit };
  }

  /**
   * Get account limits
   */
  static async getAccountLimits(userId: string) {
    const user = await Users.findById(userId).select("kycStatus");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const limits = await AccountLimits.find({
      wallet: {
        $in: await Wallets.find({ user: userId }).distinct("_id"),
      },
    }).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayUsage, monthUsage] = await Promise.all([
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: userId,
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
            initiatedBy: userId,
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

    const todayTransfers = todayUsage.find((u) => u._id === "transfer")?.total || 0;
    const todayWithdrawals = todayUsage.find((u) => u._id === "withdrawal")?.total || 0;
    const monthTransfers = monthUsage.find((u) => u._id === "transfer")?.total || 0;
    const monthWithdrawals = monthUsage.find((u) => u._id === "withdrawal")?.total || 0;

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

    const kycLimits = baseLimits[user.kycStatus as keyof typeof baseLimits] || baseLimits.pending;

    return {
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
            remaining: Math.max(0, kycLimits.dailyWithdrawal - todayWithdrawals),
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
            remaining: Math.max(0, kycLimits.monthlyWithdrawal - monthWithdrawals),
          },
        },
        perTransaction: kycLimits.perTransaction,
      },
      kycStatus: user.kycStatus,
      walletLimits: limits,
    };
  }

  /**
   * Get account summary/dashboard data
   */
  static async getAccountSummary(userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const [wallets, recentTransactions, monthlyStats] = await Promise.all([
      Wallets.find({ user: userId, status: "active" })
        .select("walletNumber balances walletType isPrimary")
        .lean(),
      Transactions.find({ initiatedBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: userId,
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
                $cond: [{ $in: ["$type", ["deposit", "refund"]] }, "$amount", 0],
              },
            },
            totalOutgoing: {
              $sum: {
                $cond: [{ $in: ["$type", ["transfer", "withdrawal", "payment"]] }, "$amount", 0],
              },
            },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    let totalBalance = 0;
    wallets.forEach((w) => {
      if (w.balances) {
        Object.values(Object.fromEntries(w.balances as any)).forEach((balance: any) => {
          totalBalance += balance || 0;
        });
      }
    });

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

    return {
      summary: {
        totalBalance,
        primaryCurrency: "USD",
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
    };
  }
}
