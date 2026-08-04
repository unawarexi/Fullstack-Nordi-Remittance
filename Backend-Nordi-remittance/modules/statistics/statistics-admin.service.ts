// ============================================================================
// STATISTICS ADMIN SERVICE
// ============================================================================

import Statistics from "./statistics.model.js";
import Transactions from "../transactions/transactions.model.js";
import { Wallets } from "../accounts/accounts.model.js";
import { Loans } from "../loans/loans.model.js";
import { Cards } from "../cards/cards.model.js";
import Users from "../users/users.model.js";
import { getCachedPlatformStats } from "../../services/query-cache.service.js";
import { broadcast } from "../../services/websocket.service.js";

export class StatisticsAdminService {
  // --------------------------------------------------------------------------
  // GET PLATFORM STATISTICS
  // --------------------------------------------------------------------------
  static async getPlatformStatistics() {
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

    broadcast("platform:stats_updated", stats);
    return stats;
  }

  // --------------------------------------------------------------------------
  // GET GROWTH METRICS
  // --------------------------------------------------------------------------
  static async getGrowthMetrics(period: string) {
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

    const [userGrowth, transactionGrowth, transactionTypes] = await Promise.all([
      Users.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transactions.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
            count: { $sum: 1 },
            volume: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transactions.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            volume: { $sum: "$amount" },
          },
        },
        { $sort: { volume: -1 } },
      ]),
    ]);

    return {
      period,
      users: userGrowth,
      transactions: transactionGrowth,
      transactionTypes,
    };
  }

  // --------------------------------------------------------------------------
  // GENERATE DAILY REPORT
  // --------------------------------------------------------------------------
  static async generateDailyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Return existing report if already generated for this date
    let report = await Statistics.findOne({ date: targetDate });

    if (!report) {
      const [
        newUsers,
        activeUsers,
        transactions,
        transactionVolume,
        newLoans,
        loanDisbursements,
        newCards,
      ] = await Promise.all([
        Users.countDocuments({
          createdAt: { $gte: targetDate, $lt: nextDay },
        }),
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
        Loans.countDocuments({
          createdAt: { $gte: targetDate, $lt: nextDay },
        }),
        Loans.aggregate([
          {
            $match: {
              disbursementDate: { $gte: targetDate, $lt: nextDay },
            },
          },
          { $group: { _id: null, total: { $sum: "$principalAmount" } } },
        ]),
        Cards.countDocuments({
          createdAt: { $gte: targetDate, $lt: nextDay },
        }),
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

    return report;
  }
}
