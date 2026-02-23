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
    }>>(`${STATISTICS_BASE}/dashboard`);
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
    }>>(`${STATISTICS_BASE}/spending/categories`, { params });
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
};

export default statisticsApi;
