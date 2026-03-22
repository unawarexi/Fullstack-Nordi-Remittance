// ============================================================================
// STATISTICS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import Statistics from "../models/StatisticsModel.js";
import Transactions from "../models/TransactionModel.js";
import { Wallets } from "../models/AccountsModel.js";
import { Loans } from "../models/LoansModel.js";
import { Cards } from "../models/CardsModel.js";
import {
  SavingsGoals,
  InvestmentAccounts,
} from "../models/InvestmentsModel.js";
import Users from "../models/UserModel.js";
import { sendSuccess, sendPaginated } from "../core/helpers/response.helper.js";
import { UnauthorizedError, NotFoundError } from "../core/errors/AppError.js";
import {
  cacheSet,
  cacheGet,
  CACHE_KEYS,
  CACHE_TTL,
} from "../services/redis.service.js";
import { broadcast } from "../services/websocket.service.js";
import { getCachedPlatformStats } from "../services/query-cache.service.js";

// ============================================================================
// USER STATISTICS
// ============================================================================

export async function getUserStatistics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const userId = req.user.userId;
    // Try Redis cache first
    const cacheKey = CACHE_KEYS.USER_STATS(userId);
    const cachedStats = await cacheGet(cacheKey);
    if (cachedStats) {
      sendSuccess(res, { statistics: cachedStats });
      return;
    }
    // ...existing code for stats calculation...
    const wallets = await Wallets.find({ user: userId, status: "active" });
    const getWalletTotalBalance = (wallet: any): number => {
      if (wallet.balances instanceof Map) {
        let total = 0;
        wallet.balances.forEach((value: number) => {
          total += value;
        });
        return total;
      }
      return 0;
    };
    const totalBalance = wallets.reduce(
      (sum, w) => sum + getWalletTotalBalance(w),
      0,
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactionStats = await Transactions.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
          createdAt: { $gte: thirtyDaysAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            direction: {
              $cond: [{ $eq: ["$sender", userId] }, "sent", "received"],
            },
          },
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);
    const spendingByCategory = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: thirtyDaysAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    const dailySpending = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: thirtyDaysAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          spent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const [activeLoans, activeCards, savingsGoals, investmentAccount] =
      await Promise.all([
        Loans.countDocuments({
          user: userId,
          status: { $in: ["active", "disbursed"] },
        }),
        Cards.countDocuments({ user: userId, status: "active" }),
        SavingsGoals.find({ user: userId, status: "active" }).lean(),
        InvestmentAccounts.findOne({ user: userId, status: "active" }).lean(),
      ]);
    const totalSavings = savingsGoals.reduce(
      (sum, g) => sum + g.currentAmount,
      0,
    );
    const stats = {
      wallets: {
        count: wallets.length,
        totalBalance,
        currencies: wallets
          .map((w) => {
            const balances: Array<{ currency: string; balance: number }> = [];
            if (w.balances instanceof Map) {
              w.balances.forEach((balance, currency) => {
                balances.push({ currency, balance });
              });
            }
            return balances;
          })
          .flat(),
      },
      transactions: {
        last30Days: transactionStats,
        byCategory: spendingByCategory,
        dailyTrend: dailySpending,
      },
      products: {
        activeLoans,
        activeCards,
        savingsGoals: savingsGoals.length,
        totalSavings,
        investmentValue: investmentAccount?.currentValue || 0,
      },
    };
    // Cache in Redis
    await cacheSet(cacheKey, stats, CACHE_TTL.ADMIN_STATS);
    sendSuccess(res, { statistics: stats });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TRANSACTION ANALYTICS
// ============================================================================

export async function getTransactionAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const userId = req.user.userId;
    const { period } = req.query; // 'week' | 'month' | 'quarter' | 'year'

    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "quarter":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Income vs Expense
    const incomeExpense = await Transactions.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $project: {
          amount: 1,
          type: {
            $cond: [{ $eq: ["$recipient", userId] }, "income", "expense"],
          },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avg: { $avg: "$amount" },
        },
      },
    ]);

    // Top recipients
    const topRecipients = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$recipient",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          total: 1,
          count: 1,
          name: { $arrayElemAt: ["$user.firstName", 0] },
        },
      },
    ]);

    // Transaction frequency by day of week
    const byDayOfWeek = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Peak hours
    const byHour = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    sendSuccess(res, {
      analytics: {
        period,
        incomeExpense,
        topRecipients,
        byDayOfWeek,
        peakHours: byHour,
        netFlow: incomeExpense.reduce((net, ie) => {
          return ie._id === "income" ? net + ie.total : net - ie.total;
        }, 0),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SPENDING INSIGHTS
// ============================================================================

export async function getSpendingInsights(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const userId = req.user.userId;
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Current month spending
    const currentSpending = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: currentMonth },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Last month spending
    const lastMonthSpending = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: lastMonth, $lt: currentMonth },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Compare and generate insights
    const lastMonthMap = new Map(
      lastMonthSpending.map((l) => [l._id, l.total]),
    );

    const insights: any[] = [];
    let totalCurrentMonth = 0;
    let totalLastMonth = lastMonthSpending.reduce((sum, l) => sum + l.total, 0);

    for (const current of currentSpending) {
      totalCurrentMonth += current.total;
      const lastAmount = lastMonthMap.get(current._id) || 0;
      const change =
        lastAmount > 0
          ? ((current.total - lastAmount) / lastAmount) * 100
          : 100;

      if (Math.abs(change) > 20) {
        insights.push({
          category: current._id || "Other",
          currentMonth: current.total,
          lastMonth: lastAmount,
          changePercent: Math.round(change),
          trend: change > 0 ? "increase" : "decrease",
          message:
            change > 0
              ? `Your ${current._id || "other"} spending increased by ${Math.round(change)}%`
              : `You saved ${Math.round(Math.abs(change))}% on ${current._id || "other"}`,
        });
      }
    }

    // Overall change
    const overallChange =
      totalLastMonth > 0
        ? ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100
        : 0;

    sendSuccess(res, {
      insights: {
        currentMonth: {
          total: totalCurrentMonth,
          byCategory: currentSpending,
        },
        lastMonth: {
          total: totalLastMonth,
          byCategory: lastMonthSpending,
        },
        overallChange: Math.round(overallChange),
        significantChanges: insights,
        recommendations: generateRecommendations(insights, overallChange),
      },
    });
  } catch (error) {
    next(error);
  }
}

function generateRecommendations(
  insights: any[],
  overallChange: number,
): string[] {
  const recommendations: string[] = [];

  if (overallChange > 20) {
    recommendations.push(
      "Consider reviewing your spending habits - overall spending is up significantly.",
    );
  }

  for (const insight of insights) {
    if (insight.trend === "increase" && insight.changePercent > 50) {
      recommendations.push(
        `Review your ${insight.category} expenses - they've increased significantly.`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Great job maintaining consistent spending patterns!");
  }

  return recommendations.slice(0, 3);
}

// ============================================================================
// ADMIN: PLATFORM STATISTICS
// ============================================================================

export async function getPlatformStatistics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    // Cache platform stats for 30 seconds — high-frequency admin endpoint
    const stats = await getCachedPlatformStats(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        newUsersToday,
        newUsersThisMonth,
        activeUsers,
        totalTransactions,
        transactionsToday,
        transactionVolume,
        volumeToday,
        activeWallets,
        totalWalletBalance,
        activeLoans,
        loanVolume,
        activeCards,
      ] = await Promise.all([
        Users.estimatedDocumentCount(),
        Users.countDocuments({ createdAt: { $gte: today } }),
        Users.countDocuments({ createdAt: { $gte: thisMonth } }),
        Users.countDocuments({
          lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
        Transactions.countDocuments({ status: "completed" }),
        Transactions.countDocuments({
          createdAt: { $gte: today },
          status: "completed",
        }),
        Transactions.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transactions.aggregate([
          { $match: { createdAt: { $gte: today }, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Wallets.countDocuments({ status: "active" }),
        Wallets.aggregate([
          { $match: { status: "active" } },
          { $group: { _id: null, total: { $sum: "$balance" } } },
        ]),
        Loans.countDocuments({ status: { $in: ["active", "disbursed"] } }),
        Loans.aggregate([
          { $match: { status: { $in: ["active", "disbursed"] } } },
          { $group: { _id: null, total: { $sum: "$principalAmount" } } },
        ]),
        Cards.countDocuments({ status: "active" }),
      ]);

      return {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
          weeklyActive: activeUsers,
        },
        transactions: {
          total: totalTransactions,
          today: transactionsToday,
          totalVolume: transactionVolume[0]?.total || 0,
          todayVolume: volumeToday[0]?.total || 0,
        },
        wallets: {
          active: activeWallets,
          totalBalance: totalWalletBalance[0]?.total || 0,
        },
        loans: {
          active: activeLoans,
          volume: loanVolume[0]?.total || 0,
        },
        cards: {
          active: activeCards,
        },
      };
    });

    // Broadcast to all clients
    broadcast("platform:stats_updated", stats);
    sendSuccess(res, { statistics: stats });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GROWTH METRICS
// ============================================================================

export async function getGrowthMetrics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { period } = req.query; // 'week' | 'month' | 'quarter' | 'year'

    let startDate = new Date();
    let groupFormat = "%Y-%m-%d";

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "quarter":
        startDate.setMonth(startDate.getMonth() - 3);
        groupFormat = "%Y-%U"; // Week number
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupFormat = "%Y-%m";
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // User growth
    const userGrowth = await Users.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transaction growth
    const transactionGrowth = await Transactions.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          count: { $sum: 1 },
          volume: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transaction type distribution
    const transactionTypes = await Transactions.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: "completed" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          volume: { $sum: "$amount" },
        },
      },
      { $sort: { volume: -1 } },
    ]);

    sendSuccess(res, {
      growth: {
        period,
        users: userGrowth,
        transactions: transactionGrowth,
        transactionTypes,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: DAILY REPORT
// ============================================================================

export async function generateDailyReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if report already exists
    let report = await Statistics.findOne({ date: targetDate });

    if (!report) {
      // Generate report
      const [
        newUsers,
        activeUsers,
        transactions,
        transactionVolume,
        newLoans,
        loanDisbursements,
        newCards,
      ] = await Promise.all([
        Users.countDocuments({ createdAt: { $gte: targetDate, $lt: nextDay } }),
        Users.countDocuments({
          lastActive: { $gte: targetDate, $lt: nextDay },
        }),
        Transactions.countDocuments({
          createdAt: { $gte: targetDate, $lt: nextDay },
          status: "completed",
        }),
        Transactions.aggregate([
          {
            $match: {
              createdAt: { $gte: targetDate, $lt: nextDay },
              status: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Loans.countDocuments({ createdAt: { $gte: targetDate, $lt: nextDay } }),
        Loans.aggregate([
          { $match: { disbursementDate: { $gte: targetDate, $lt: nextDay } } },
          { $group: { _id: null, total: { $sum: "$principalAmount" } } },
        ]),
        Cards.countDocuments({ createdAt: { $gte: targetDate, $lt: nextDay } }),
      ]);

      report = new Statistics({
        date: targetDate,
        period: "daily",
        users: {
          new: newUsers,
          active: activeUsers,
          total: 0,
          suspended: 0,
          kycPending: 0,
          kycVerified: 0,
        },
        transactions: {
          total: transactions,
          volume: transactionVolume[0]?.total || 0,
          currency: "USD",
          byType: {
            deposit: 0,
            withdrawal: 0,
            transfer: 0,
            payment: 0,
          },
          byStatus: {
            completed: transactions,
            pending: 0,
            failed: 0,
          },
          averageAmount: 0,
          fees: 0,
        },
        loans: {
          totalActive: 0,
          totalDisbursed: loanDisbursements[0]?.total || 0,
          totalRepaid: 0,
          outstanding: 0,
          defaulted: 0,
          applications: newLoans,
        },
        cards: {
          totalIssued: newCards,
          active: 0,
          blocked: 0,
          transactions: 0,
          volume: 0,
        },
      });

      await report.save();
    }

    sendSuccess(res, { report });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getUserStatistics,
  getTransactionAnalytics,
  getSpendingInsights,
  getPlatformStatistics,
  getGrowthMetrics,
  generateDailyReport,
};
