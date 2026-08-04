// ============================================================================
// STATISTICS USER SERVICE
// ============================================================================
import Transactions from '../transactions/transactions.model.js';
import { Wallets } from '../accounts/accounts.model.js';
import { Loans } from '../loans/loans.model.js';
import { Cards } from '../cards/cards.model.js';
import { SavingsGoals, InvestmentAccounts } from '../investments/investments.model.js';
import { cacheSet, cacheGet, CACHE_KEYS, CACHE_TTL } from '../../services/redis.service.js';

// ============================================================================
// HELPERS
// ============================================================================

function getWalletTotalBalance(wallet: any): number {
  if (wallet.balances instanceof Map) {
    let total = 0;
    wallet.balances.forEach((value: number) => {
      total += value;
    });
    return total;
  }
  return 0;
}

function generateRecommendations(insights: any[], overallChange: number): string[] {
  const recommendations: string[] = [];

  if (overallChange > 20) {
    recommendations.push(
      'Consider reviewing your spending habits - overall spending is up significantly.',
    );
  }

  for (const insight of insights) {
    if (insight.trend === 'increase' && insight.changePercent > 50) {
      recommendations.push(
        `Review your ${insight.category} expenses - they've increased significantly.`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job maintaining consistent spending patterns!');
  }

  return recommendations.slice(0, 3);
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class StatisticsUserService {
  // --------------------------------------------------------------------------
  // GET USER STATISTICS
  // --------------------------------------------------------------------------
  static async getUserStatistics(userId: string) {
    const cacheKey = CACHE_KEYS.USER_STATS(userId);
    const cachedStats = await cacheGet(cacheKey);
    if (cachedStats) return cachedStats;

    const wallets = await Wallets.find({ user: userId, status: 'active' });
    const totalBalance = wallets.reduce((sum, w) => sum + getWalletTotalBalance(w), 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const transactionStats = await Transactions.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            type: '$type',
            direction: {
              $cond: [{ $eq: ['$sender', userId] }, 'sent', 'received'],
            },
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spendingByCategory = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
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
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          spent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const [activeLoans, activeCards, savingsGoals, investmentAccount] = await Promise.all([
      Loans.countDocuments({
        user: userId,
        status: { $in: ['active', 'disbursed'] },
      }),
      Cards.countDocuments({ user: userId, status: 'active' }),
      SavingsGoals.find({ user: userId, status: 'active' }).lean(),
      InvestmentAccounts.findOne({ user: userId, status: 'active' }).lean(),
    ]);

    const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

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

    await cacheSet(cacheKey, stats, CACHE_TTL.ADMIN_STATS);
    return stats;
  }

  // --------------------------------------------------------------------------
  // GET TRANSACTION ANALYTICS
  // --------------------------------------------------------------------------
  static async getTransactionAnalytics(userId: string, period: string) {
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const incomeExpense = await Transactions.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
          createdAt: { $gte: startDate },
          status: 'completed',
        },
      },
      {
        $project: {
          amount: 1,
          type: {
            $cond: [{ $eq: ['$recipient', userId] }, 'income', 'expense'],
          },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
        },
      },
    ]);

    const topRecipients = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$recipient',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          total: 1,
          count: 1,
          name: { $arrayElemAt: ['$user.firstName', 0] },
        },
      },
    ]);

    const byDayOfWeek = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byHour = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: startDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const netFlow = incomeExpense.reduce((net, ie) => {
      return ie._id === 'income' ? net + ie.total : net - ie.total;
    }, 0);

    return {
      period,
      incomeExpense,
      topRecipients,
      byDayOfWeek,
      peakHours: byHour,
      netFlow,
    };
  }

  // --------------------------------------------------------------------------
  // GET SPENDING INSIGHTS
  // --------------------------------------------------------------------------
  static async getSpendingInsights(userId: string) {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentSpending = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: currentMonth },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const lastMonthSpending = await Transactions.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: lastMonth, $lt: currentMonth },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthMap = new Map(lastMonthSpending.map((l) => [l._id, l.total]));

    const significantChanges: any[] = [];
    let totalCurrentMonth = 0;
    const totalLastMonth = lastMonthSpending.reduce((sum, l) => sum + l.total, 0);

    for (const current of currentSpending) {
      totalCurrentMonth += current.total;
      const lastAmount = lastMonthMap.get(current._id) || 0;
      const change = lastAmount > 0 ? ((current.total - lastAmount) / lastAmount) * 100 : 100;

      if (Math.abs(change) > 20) {
        significantChanges.push({
          category: current._id || 'Other',
          currentMonth: current.total,
          lastMonth: lastAmount,
          changePercent: Math.round(change),
          trend: change > 0 ? 'increase' : 'decrease',
          message:
            change > 0
              ? `Your ${current._id || 'other'} spending increased by ${Math.round(change)}%`
              : `You saved ${Math.round(Math.abs(change))}% on ${current._id || 'other'}`,
        });
      }
    }

    const overallChange =
      totalLastMonth > 0 ? ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

    return {
      currentMonth: {
        total: totalCurrentMonth,
        byCategory: currentSpending,
      },
      lastMonth: {
        total: totalLastMonth,
        byCategory: lastMonthSpending,
      },
      overallChange: Math.round(overallChange),
      significantChanges,
      recommendations: generateRecommendations(significantChanges, overallChange),
    };
  }
}
