// ============================================================================
// STATISTICS API - Analytics and dashboard statistics endpoints
// ============================================================================

import apiClient, { ApiResponse } from '../client';

const STATISTICS_BASE = '/statistics';

// ============================================================================
// STATISTICS API FUNCTIONS
// ============================================================================

export const statisticsApi = {
  // ==========================================================================
  // DASHBOARD STATS
  // ==========================================================================

  /**
   * Get dashboard overview
   */
  getDashboardOverview: async (): Promise<ApiResponse<{
    totalBalance: number;
    balanceChange: number;
    balanceChangePercent: number;
    totalTransactions: number;
    transactionsThisMonth: number;
    totalSent: number;
    totalReceived: number;
    pendingTransactions: number;
    activeCards: number;
    activeLoans: number;
    activeInvestments: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      totalBalance: number;
      balanceChange: number;
      balanceChangePercent: number;
      totalTransactions: number;
      transactionsThisMonth: number;
      totalSent: number;
      totalReceived: number;
      pendingTransactions: number;
      activeCards: number;
      activeLoans: number;
      activeInvestments: number;
    }>>(`${STATISTICS_BASE}/user`);
    return response.data;
  },

  // ==========================================================================
  // TRANSACTION STATISTICS
  // ==========================================================================

  /**
   * Get transaction statistics
   */
  getTransactionStats: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    accountId?: string;
  }): Promise<ApiResponse<TransactionStats>> => {
    const response = await apiClient.get<ApiResponse<TransactionStats>>(
      `${STATISTICS_BASE}/transactions`,
      { params }
    );
    return response.data;
  },

  /**
   * Get transaction volume chart data
   */
  getTransactionVolumeChart: async (params?: {
    period?: 'week' | 'month' | '3months' | '6months' | 'year';
    currency?: Currency;
  }): Promise<ApiResponse<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      type: 'income' | 'expense';
    }>;
    summary: {
      totalIncome: number;
      totalExpense: number;
      netFlow: number;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        type: 'income' | 'expense';
      }>;
      summary: {
        totalIncome: number;
        totalExpense: number;
        netFlow: number;
      };
    }>>(`${STATISTICS_BASE}/transactions/chart`, { params });
    return response.data;
  },

  /**
   * Get spending by category
   */
  getSpendingByCategory: async (params?: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
  }): Promise<ApiResponse<{
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
      transactionCount: number;
      trend: number;
    }>;
    totalSpending: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      categories: Array<{
        name: string;
        amount: number;
        percentage: number;
        transactionCount: number;
        trend: number;
      }>;
      totalSpending: number;
    }>>(`${STATISTICS_BASE}/spending`, { params });
    return response.data;
  },

  // ==========================================================================
  // BALANCE STATISTICS
  // ==========================================================================

  /**
   * Get balance history chart
   */
  getBalanceHistory: async (params?: {
    period?: 'week' | 'month' | '3months' | '6months' | 'year';
    accountId?: string;
  }): Promise<ApiResponse<{
    labels: string[];
    data: number[];
    startBalance: number;
    endBalance: number;
    highestBalance: number;
    lowestBalance: number;
    averageBalance: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      labels: string[];
      data: number[];
      startBalance: number;
      endBalance: number;
      highestBalance: number;
      lowestBalance: number;
      averageBalance: number;
    }>>(`${STATISTICS_BASE}/balance/history`, { params });
    return response.data;
  },

  /**
   * Get balance distribution by currency
   */
  getBalanceDistribution: async (): Promise<ApiResponse<{
    balances: Array<{
      currency: Currency;
      balance: number;
      balanceInUSD: number;
      percentage: number;
      accountCount: number;
    }>;
    totalBalanceUSD: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      balances: Array<{
        currency: Currency;
        balance: number;
        balanceInUSD: number;
        percentage: number;
        accountCount: number;
      }>;
      totalBalanceUSD: number;
    }>>(`${STATISTICS_BASE}/balance/distribution`);
    return response.data;
  },

  // ==========================================================================
  // REMITTANCE STATISTICS
  // ==========================================================================

  /**
   * Get remittance statistics
   */
  getRemittanceStats: async (params?: {
    period?: 'month' | '3months' | '6months' | 'year';
  }): Promise<ApiResponse<{
    totalSent: number;
    totalFees: number;
    averageAmount: number;
    transactionCount: number;
    topRecipientCountries: Array<{
      country: string;
      countryCode: string;
      amount: number;
      count: number;
    }>;
    byDeliveryMethod: Array<{
      method: string;
      amount: number;
      count: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      totalSent: number;
      totalFees: number;
      averageAmount: number;
      transactionCount: number;
      topRecipientCountries: Array<{
        country: string;
        countryCode: string;
        amount: number;
        count: number;
      }>;
      byDeliveryMethod: Array<{
        method: string;
        amount: number;
        count: number;
      }>;
      monthlyTrend: Array<{
        month: string;
        amount: number;
        count: number;
      }>;
    }>>(`${STATISTICS_BASE}/remittance`, { params });
    return response.data;
  },

  // ==========================================================================
  // INVESTMENT STATISTICS
  // ==========================================================================

  /**
   * Get investment performance
   */
  getInvestmentPerformance: async (params?: {
    period?: 'month' | '3months' | '6months' | 'year';
  }): Promise<ApiResponse<{
    totalInvested: number;
    currentValue: number;
    totalReturns: number;
    returnPercentage: number;
    performanceHistory: Array<{
      date: string;
      value: number;
      invested: number;
    }>;
    byType: Array<{
      type: string;
      invested: number;
      currentValue: number;
      returns: number;
      percentage: number;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      totalInvested: number;
      currentValue: number;
      totalReturns: number;
      returnPercentage: number;
      performanceHistory: Array<{
        date: string;
        value: number;
        invested: number;
      }>;
      byType: Array<{
        type: string;
        invested: number;
        currentValue: number;
        returns: number;
        percentage: number;
      }>;
    }>>(`${STATISTICS_BASE}/investments`, { params });
    return response.data;
  },

  // ==========================================================================
  // INSIGHTS
  // ==========================================================================

  /**
   * Get financial insights
   */
  getInsights: async (): Promise<ApiResponse<{
    insights: Array<{
      id: string;
      type: 'saving' | 'spending' | 'investment' | 'general';
      title: string;
      description: string;
      actionText?: string;
      actionUrl?: string;
      priority: 'low' | 'medium' | 'high';
      metric?: {
        value: number;
        label: string;
        trend?: 'up' | 'down' | 'stable';
      };
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      insights: Array<{
        id: string;
        type: 'saving' | 'spending' | 'investment' | 'general';
        title: string;
        description: string;
        actionText?: string;
        actionUrl?: string;
        priority: 'low' | 'medium' | 'high';
        metric?: {
          value: number;
          label: string;
          trend?: 'up' | 'down' | 'stable';
        };
      }>;
    }>>(`${STATISTICS_BASE}/insights`);
    return response.data;
  },

  /**
   * Get spending recommendations
   */
  getSpendingRecommendations: async (): Promise<ApiResponse<{
    recommendations: Array<{
      category: string;
      currentSpending: number;
      recommendedBudget: number;
      potentialSavings: number;
      tip: string;
    }>;
    totalPotentialSavings: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      recommendations: Array<{
        category: string;
        currentSpending: number;
        recommendedBudget: number;
        potentialSavings: number;
        tip: string;
      }>;
      totalPotentialSavings: number;
    }>>(`${STATISTICS_BASE}/recommendations`);
    return response.data;
  },

  // ==========================================================================
  // EXTENDED STATISTICS (map to available backend endpoints)
  // ==========================================================================

  /** Net worth history — proxies to /statistics/user */
  getNetWorthHistory: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/user`, { params });
    return response.data;
  },

  /** Transactions grouped by type — proxies to /statistics/transactions */
  getTransactionsByType: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { ...params, groupBy: 'type' } });
    return response.data;
  },

  /** Transactions grouped by status — proxies to /statistics/transactions */
  getTransactionsByStatus: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { ...params, groupBy: 'status' } });
    return response.data;
  },

  /** Spending trends — proxies to /statistics/spending */
  getSpendingTrends: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { ...params, view: 'trends' } });
    return response.data;
  },

  /** Top spending categories — proxies to /statistics/spending */
  getTopSpendingCategories: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { ...params, view: 'top' } });
    return response.data;
  },

  /** Spending vs income comparison — proxies to /statistics/spending */
  getSpendingVsIncome: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { ...params, view: 'vs-income' } });
    return response.data;
  },

  /** Budget progress — proxies to /statistics/spending */
  getBudgetProgress: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { view: 'budget' } });
    return response.data;
  },

  /** Income by source — proxies to /statistics/transactions */
  getIncomeBySource: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { ...params, filter: 'income' } });
    return response.data;
  },

  /** Income trends — proxies to /statistics/transactions */
  getIncomeTrends: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { ...params, filter: 'income', view: 'trends' } });
    return response.data;
  },

  /** Remittance by country — proxies to /statistics/remittance */
  getRemittanceByCountry: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/remittance`, { params: { ...params, groupBy: 'country' } });
    return response.data;
  },

  /** Remittance by recipient — proxies to /statistics/remittance */
  getRemittanceByRecipient: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/remittance`, { params: { ...params, groupBy: 'recipient' } });
    return response.data;
  },

  /** Card spending stats — proxies to /statistics/spending */
  getCardSpendingStats: async (cardId: string, params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { ...params, cardId } });
    return response.data;
  },

  /** Card spending by merchant — proxies to /statistics/spending */
  getCardSpendingByMerchant: async (cardId: string, params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { ...params, cardId, groupBy: 'merchant' } });
    return response.data;
  },

  /** Portfolio allocation — proxies to /statistics/investments */
  getPortfolioAllocation: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/investments`, { params: { view: 'allocation' } });
    return response.data;
  },

  /** Savings progress — proxies to /statistics/user */
  getSavingsProgress: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/user`, { params: { view: 'savings' } });
    return response.data;
  },

  /** Savings rate trend — proxies to /statistics/user */
  getSavingsRateTrend: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/user`, { params: { ...params, view: 'savings-trend' } });
    return response.data;
  },

  /** Financial insights — alias for getInsights */
  getFinancialInsights: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/insights`);
    return response.data;
  },

  /** Spending alerts — proxies to /statistics/spending */
  getSpendingAlerts: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/spending`, { params: { view: 'alerts' } });
    return response.data;
  },

  /** Activity summary — proxies to /statistics/user */
  getActivitySummary: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/user`, { params: { ...params, view: 'activity' } });
    return response.data;
  },

  /** Period comparison — proxies to /statistics/transactions */
  getPeriodComparison: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { ...params, view: 'comparison' } });
    return response.data;
  },

  /** Year over year comparison — proxies to /statistics/transactions */
  getYearOverYearComparison: async (year?: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/transactions`, { params: { year, view: 'yoy' } });
    return response.data;
  },

  /** Available export formats */
  getAvailableExports: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${STATISTICS_BASE}/user`, { params: { view: 'exports' } });
    return response.data;
  },
};

export default statisticsApi;
