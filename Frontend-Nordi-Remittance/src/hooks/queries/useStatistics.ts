import { statisticsApi } from '../../core/api/endpoints/statistics.api';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// STATISTICS HOOKS - TanStack Query hooks for analytics and dashboard
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  period?: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
}

interface StatisticsFilters extends DateRangeParams {
  accountId?: UUID;
  currency?: string;
}

// ============================================================================
// QUERIES - DASHBOARD
// ============================================================================

/**
 * Get dashboard overview
 */
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: queryKeys.statistics.dashboard(),
    queryFn: async () => {
      const response = await statisticsApi.getDashboardOverview();
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

/**
 * Get account balance history
 */
export const useBalanceHistory = (params?: StatisticsFilters) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "balance-history", params],
    queryFn: async () => {
      const response = await statisticsApi.getBalanceHistory(params);
      return response.data;
    },
  });
};

/**
 * Get net worth over time
 */
export const useNetWorthHistory = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "net-worth", params],
    queryFn: async () => {
      const response = await statisticsApi.getNetWorthHistory(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - TRANSACTIONS ANALYTICS
// ============================================================================

/**
 * Get transaction statistics
 */
export const useTransactionStats = (params?: StatisticsFilters) => {
  return useQuery({
    queryKey: queryKeys.statistics.transactions(params),
    queryFn: async () => {
      const response = await statisticsApi.getTransactionStats(params);
      return response.data;
    },
  });
};

/**
 * Get transaction volume chart data
 */
export const useTransactionVolumeChart = (
  params?: DateRangeParams & { groupBy?: "day" | "week" | "month" },
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.transactions(), "volume-chart", params],
    queryFn: async () => {
      const response = await statisticsApi.getTransactionVolumeChart(params);
      return response.data;
    },
  });
};

/**
 * Get transaction count by type
 */
export const useTransactionsByType = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.transactions(), "by-type", params],
    queryFn: async () => {
      const response = await statisticsApi.getTransactionsByType(params);
      return response.data;
    },
  });
};

/**
 * Get transaction count by status
 */
export const useTransactionsByStatus = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.transactions(), "by-status", params],
    queryFn: async () => {
      const response = await statisticsApi.getTransactionsByStatus(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - SPENDING ANALYTICS
// ============================================================================

/**
 * Get spending by category
 */
export const useSpendingByCategory = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.statistics.spending(params),
    queryFn: async () => {
      const response = await statisticsApi.getSpendingByCategory(params);
      return response.data;
    },
  });
};

/**
 * Get spending trends
 */
export const useSpendingTrends = (
  params?: DateRangeParams & { categoryId?: string },
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.spending(), "trends", params],
    queryFn: async () => {
      const response = await statisticsApi.getSpendingTrends(params);
      return response.data;
    },
  });
};

/**
 * Get top spending categories
 */
export const useTopSpendingCategories = (
  params?: DateRangeParams & { limit?: number },
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.spending(), "top-categories", params],
    queryFn: async () => {
      const response = await statisticsApi.getTopSpendingCategories(params);
      return response.data;
    },
  });
};

/**
 * Get spending vs income
 */
export const useSpendingVsIncome = (
  params?: DateRangeParams & { groupBy?: "day" | "week" | "month" },
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "spending-vs-income", params],
    queryFn: async () => {
      const response = await statisticsApi.getSpendingVsIncome(params);
      return response.data;
    },
  });
};

/**
 * Get budget progress
 */
export const useBudgetProgress = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "budget-progress"],
    queryFn: async () => {
      const response = await statisticsApi.getBudgetProgress();
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - INCOME ANALYTICS
// ============================================================================

/**
 * Get income by source
 */
export const useIncomeBySource = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.statistics.income(params),
    queryFn: async () => {
      const response = await statisticsApi.getIncomeBySource(params);
      return response.data;
    },
  });
};

/**
 * Get income trends
 */
export const useIncomeTrends = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.income(), "trends", params],
    queryFn: async () => {
      const response = await statisticsApi.getIncomeTrends(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - REMITTANCE ANALYTICS
// ============================================================================

/**
 * Get remittance statistics
 */
export const useRemittanceStats = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "remittance", params],
    queryFn: async () => {
      const response = await statisticsApi.getRemittanceStats(params);
      return response.data;
    },
  });
};

/**
 * Get remittance by country
 */
export const useRemittanceByCountry = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "remittance-by-country", params],
    queryFn: async () => {
      const response = await statisticsApi.getRemittanceByCountry(params);
      return response.data;
    },
  });
};

/**
 * Get remittance by recipient
 */
export const useRemittanceByRecipient = (
  params?: DateRangeParams & { limit?: number },
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "remittance-by-recipient", params],
    queryFn: async () => {
      const response = await statisticsApi.getRemittanceByRecipient(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - CARD ANALYTICS
// ============================================================================

/**
 * Get card spending statistics
 */
export const useCardSpendingStats = (
  cardId?: UUID,
  params?: DateRangeParams,
) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "card-spending", cardId, params],
    queryFn: async () => {
      const response = await statisticsApi.getCardSpendingStats(cardId, params);
      return response.data;
    },
  });
};

/**
 * Get card spending by merchant category
 */
export const useCardSpendingByMerchant = (
  cardId?: UUID,
  params?: DateRangeParams,
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.statistics.all,
      "card-spending-by-merchant",
      cardId,
      params,
    ],
    queryFn: async () => {
      const response = await statisticsApi.getCardSpendingByMerchant(
        cardId,
        params,
      );
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - INVESTMENT ANALYTICS
// ============================================================================

/**
 * Get investment performance stats
 */
export const useInvestmentPerformanceStats = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "investment-performance", params],
    queryFn: async () => {
      const response = await statisticsApi.getInvestmentPerformance(params);
      return response.data;
    },
  });
};

/**
 * Get portfolio allocation
 */
export const usePortfolioAllocation = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "portfolio-allocation"],
    queryFn: async () => {
      const response = await statisticsApi.getPortfolioAllocation();
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - SAVINGS ANALYTICS
// ============================================================================

/**
 * Get savings progress
 */
export const useSavingsProgress = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "savings-progress"],
    queryFn: async () => {
      const response = await statisticsApi.getSavingsProgress();
      return response.data;
    },
  });
};

/**
 * Get savings rate over time
 */
export const useSavingsRateTrend = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "savings-rate", params],
    queryFn: async () => {
      const response = await statisticsApi.getSavingsRateTrend(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - ACCOUNT INSIGHTS
// ============================================================================

/**
 * Get financial insights
 */
export const useFinancialInsights = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "insights"],
    queryFn: async () => {
      const response = await statisticsApi.getFinancialInsights();
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};

/**
 * Get spending alerts/warnings
 */
export const useSpendingAlerts = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "spending-alerts"],
    queryFn: async () => {
      const response = await statisticsApi.getSpendingAlerts();
      return response.data;
    },
  });
};

/**
 * Get account activity summary
 */
export const useActivitySummary = (params?: DateRangeParams) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "activity-summary", params],
    queryFn: async () => {
      const response = await statisticsApi.getActivitySummary(params);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - COMPARISONS
// ============================================================================

/**
 * Compare periods (e.g., this month vs last month)
 */
export const usePeriodComparison = (params: {
  currentPeriod: { startDate: string; endDate: string };
  previousPeriod: { startDate: string; endDate: string };
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "period-comparison", params],
    queryFn: async () => {
      const response = await statisticsApi.getPeriodComparison(params);
      return response.data;
    },
    enabled: !!params.currentPeriod && !!params.previousPeriod,
  });
};

/**
 * Get year-over-year comparison
 */
export const useYearOverYearComparison = (year?: number) => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "yoy-comparison", year],
    queryFn: async () => {
      const response = await statisticsApi.getYearOverYearComparison(year);
      return response.data;
    },
  });
};

// ============================================================================
// QUERIES - EXPORT
// ============================================================================

/**
 * Get available analytics exports
 */
export const useAvailableExports = () => {
  return useQuery({
    queryKey: [...queryKeys.statistics.all, "available-exports"],
    queryFn: async () => {
      const response = await statisticsApi.getAvailableExports();
      return response.data;
    },
    staleTime: Infinity,
  });
};
