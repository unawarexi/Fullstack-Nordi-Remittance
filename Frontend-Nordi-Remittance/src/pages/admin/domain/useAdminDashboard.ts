import { useMemo } from "react";
import {
  useAdminDashboardStats,
  useAdminAnalytics,
  useFraudSignals,
  useFraudCases,
  useFraudAnalytics,
  usePendingTransactions,
  useTransactionVolumeChart,
  useTransactionsByType,
  useActivitySummary,
  useLoans,
  useInvestments,
  useInvestmentPortfolio,
  useCards,
  useDashboardOverview,
} from "@hooks/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAdminDashboard — Aggregates all admin dashboard data in one hook
// ============================================================================

export function useAdminDashboard() {
  const { data: statsRaw, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: analyticsRaw, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: fraudSignalsRaw, isLoading: alertsLoading } = useFraudSignals();
  const { data: pendingTxRaw, isLoading: pendingLoading } = usePendingTransactions({ limit: 5 });
  const { data: volumeRaw, isLoading: volumeLoading } = useTransactionVolumeChart({ groupBy: "month" });
  const { data: txByTypeRaw, isLoading: typeLoading } = useTransactionsByType();
  const { data: activityRaw, isLoading: activityLoading } = useActivitySummary({ period: "1M" });

  // New data hooks for expanded dashboard
  const { data: loansRaw, isLoading: loansLoading } = useLoans({ limit: 10 });
  const { data: investmentsRaw, isLoading: investmentsLoading } = useInvestments({ limit: 10 });
  const { data: portfolioRaw } = useInvestmentPortfolio();
  const { data: cardsRaw, isLoading: cardsLoading } = useCards({ limit: 50 });
  const { data: fraudCasesRaw, isLoading: fraudCasesLoading } = useFraudCases();
  const { data: fraudAnalyticsRaw } = useFraudAnalytics();
  const { data: overviewRaw } = useDashboardOverview();

  const stats = useMemo(() => {
    const s: any = statsRaw || {};
    return {
      totalUsers: s.totalUsers ?? 0,
      totalTransactions: s.totalTransactions ?? 0,
      totalRevenue: s.totalRevenue ?? 0,
      growthRate: s.growthRate ?? 0,
      activeUsers: s.activeUsers ?? 0,
      successRate: s.successRate ?? 0,
      avgResponseTime: s.avgResponseTime ?? 0,
      countriesActive: s.countriesActive ?? 0,
      usersChange: s.usersChange ?? null,
      transactionsChange: s.transactionsChange ?? null,
      revenueChange: s.revenueChange ?? null,
    };
  }, [statsRaw]);

  const revenueData = useMemo(() => {
    const raw: any[] = Array.isArray(volumeRaw)
      ? volumeRaw
      : Array.isArray((volumeRaw as any)?.data)
        ? (volumeRaw as any).data
        : [];
    return raw.map((item: any) => ({
      name: item.period || item.month || item.label || "",
      value: item.amount || item.total || item.volume || 0,
    }));
  }, [volumeRaw]);

  const accountDistribution = useMemo(() => {
    const raw: any[] = Array.isArray(txByTypeRaw)
      ? txByTypeRaw
      : Array.isArray((txByTypeRaw as any)?.data)
        ? (txByTypeRaw as any).data
        : [];
    return raw.map((item: any) => ({
      name: item.type || item.name || item.category || "",
      value: item.count || item.total || item.amount || 0,
    }));
  }, [txByTypeRaw]);

  const activityData = useMemo(() => {
    const raw: any = activityRaw || {};
    const channels: any[] = raw.channels || raw.data || [];
    return Array.isArray(channels) ? channels : [];
  }, [activityRaw]);

  const alerts = useMemo(() => {
    const raw: any[] = Array.isArray(fraudSignalsRaw) ? fraudSignalsRaw : [];
    return raw.slice(0, 5).map((signal: any) => ({
      id: signal._id || signal.id,
      title: signal.description || signal.title || signal.type || "Alert",
      severity: signal.severity || signal.riskLevel || "medium",
      time: signal.createdAt || signal.detectedAt || "",
    }));
  }, [fraudSignalsRaw]);

  const pendingApprovals = useMemo(() => {
    const raw: any[] = Array.isArray(pendingTxRaw)
      ? pendingTxRaw
      : Array.isArray((pendingTxRaw as any)?.data)
        ? (pendingTxRaw as any).data
        : [];
    return raw.slice(0, 5).map((tx: any) => ({
      id: tx._id || tx.id,
      user: tx.userName || tx.senderName || tx.user?.name || "User",
      type: tx.type || tx.category || "Transaction",
      time: tx.createdAt || tx.date || "",
    }));
  }, [pendingTxRaw]);

  const analytics = useMemo(() => {
    const a: any = analyticsRaw || {};
    return {
      weeklyTransactions: a.weeklyTransactions || a.transactionVolume || [],
    };
  }, [analyticsRaw]);

  const weeklyTransactions = useMemo(() => {
    const raw: any[] = Array.isArray(analytics.weeklyTransactions)
      ? analytics.weeklyTransactions
      : [];
    return raw.map((item: any) => ({
      name: item.day || item.period || item.label || "",
      value: item.count || item.total || item.amount || 0,
    }));
  }, [analytics.weeklyTransactions]);

  // ============================================================================
  // LOANS DATA
  // ============================================================================
  const loansData = useMemo(() => {
    const list: any[] = Array.isArray(loansRaw)
      ? loansRaw
      : Array.isArray((loansRaw as any)?.data)
        ? (loansRaw as any).data
        : [];
    const activeLoans = list.filter((l: any) => l.status === "active" || l.status === "disbursed").length;
    const overdueLoans = list.filter((l: any) => l.status === "overdue" || l.isOverdue).length;
    const pendingApplications = list.filter((l: any) => l.status === "pending" || l.status === "under_review").length;
    const totalDisbursed = list.reduce((sum: number, l: any) => sum + (l.amount || l.principal || 0), 0);
    const totalRepaid = list.reduce((sum: number, l: any) => sum + (l.totalPaid || l.amountPaid || 0), 0);
    const repaymentRate = totalDisbursed > 0 ? Math.round((totalRepaid / totalDisbursed) * 100) : 0;

    return {
      totalLoans: list.length,
      activeLoans,
      totalDisbursed,
      totalRepaid,
      overdueLoans,
      pendingApplications,
      repaymentRate: Math.min(repaymentRate, 100),
      recentLoans: list.slice(0, 5).map((l: any) => ({
        id: l._id || l.id,
        user: l.borrowerName || l.userName || l.user?.name || "Applicant",
        type: l.type || l.loanType || "Personal",
        amount: l.amount || l.principal || 0,
        status: l.status || "pending",
      })),
    };
  }, [loansRaw]);

  // ============================================================================
  // INVESTMENTS DATA
  // ============================================================================
  const investmentsData = useMemo(() => {
    const list: any[] = Array.isArray(investmentsRaw)
      ? investmentsRaw
      : Array.isArray((investmentsRaw as any)?.data)
        ? (investmentsRaw as any).data
        : [];
    const portfolio: any = portfolioRaw || {};
    const activeInvestments = list.filter((i: any) => i.status === "active").length;
    const totalPortfolioValue = portfolio.currentValue || portfolio.totalValue || list.reduce((sum: number, i: any) => sum + (i.currentValue || i.amount || 0), 0);
    const totalReturns = portfolio.totalReturns || list.reduce((sum: number, i: any) => sum + (i.returns || i.profit || 0), 0);
    const returnRate = portfolio.returnPercentage || (totalPortfolioValue > 0 ? Math.round((totalReturns / totalPortfolioValue) * 100) : 0);
    const overview: any = overviewRaw || {};

    return {
      totalPortfolioValue,
      activeInvestments: activeInvestments || overview.activeInvestments || 0,
      totalReturns,
      returnRate,
      savingsGoals: portfolio.savingsGoals || 0,
      savingsProgress: portfolio.savingsProgress || 0,
      topProducts: (portfolio.byType ? Object.entries(portfolio.byType).map(([name, data]: [string, any]) => ({
        id: name,
        name,
        type: name,
        investors: data?.count || 0,
        returnRate: data?.returnPercentage || 0,
      })) : list.slice(0, 3).map((i: any) => ({
        id: i._id || i.id,
        name: i.name || i.productName || "Investment",
        type: i.type || "Fixed",
        investors: 0,
        returnRate: i.returnPercentage || 0,
      }))),
    };
  }, [investmentsRaw, portfolioRaw, overviewRaw]);

  // ============================================================================
  // CARDS DATA
  // ============================================================================
  const cardsData = useMemo(() => {
    const list: any[] = Array.isArray(cardsRaw)
      ? cardsRaw
      : Array.isArray((cardsRaw as any)?.data)
        ? (cardsRaw as any).data
        : [];
    const overview: any = overviewRaw || {};
    const activeCards = list.filter((c: any) => c.status === "active").length || overview.activeCards || 0;
    const frozenCards = list.filter((c: any) => c.status === "frozen" || c.isFrozen).length;
    const virtualCards = list.filter((c: any) => c.type === "virtual").length;
    const physicalCards = list.filter((c: any) => c.type === "physical").length;
    const totalSpending = list.reduce((sum: number, c: any) => sum + (c.totalSpent || c.spending || 0), 0);

    return {
      totalCards: list.length,
      activeCards,
      frozenCards,
      totalSpending,
      virtualCards,
      physicalCards,
      recentCardActivity: list.slice(0, 3).map((c: any) => ({
        id: c._id || c.id,
        cardHolder: c.cardHolderName || c.userName || c.user?.name || "Card Holder",
        action: c.lastAction || "Issued",
        type: c.type || "virtual",
        status: c.status || "active",
        time: c.updatedAt || c.createdAt || "",
      })),
    };
  }, [cardsRaw, overviewRaw]);

  // ============================================================================
  // FRAUD DATA
  // ============================================================================
  const fraudData = useMemo(() => {
    const cases: any[] = Array.isArray(fraudCasesRaw)
      ? fraudCasesRaw
      : Array.isArray((fraudCasesRaw as any)?.data)
        ? (fraudCasesRaw as any).data
        : [];
    const analytics: any = fraudAnalyticsRaw || {};
    const signals: any[] = Array.isArray(fraudSignalsRaw) ? fraudSignalsRaw : [];
    const openCases = cases.filter((c: any) => c.status === "open" || c.status === "investigating").length;
    const resolvedCases = cases.filter((c: any) => c.status === "resolved" || c.status === "closed").length;
    const highRiskUsers = signals.filter((s: any) => s.riskLevel === "high" || s.severity === "critical").length;

    return {
      totalCases: cases.length,
      openCases,
      resolvedCases,
      blockedTransactions: analytics.blockedTransactions || 0,
      highRiskUsers,
      riskScore: analytics.riskScore || analytics.overallRiskScore || Math.min(openCases * 10, 100),
      recentCases: cases.slice(0, 5).map((c: any) => ({
        id: c._id || c.id,
        title: c.title || c.description || "Fraud Case",
        type: c.type || c.category || "Suspicious Activity",
        severity: c.severity || c.riskLevel || "medium",
        status: c.status || "open",
        time: c.createdAt || c.detectedAt || "",
      })),
    };
  }, [fraudCasesRaw, fraudAnalyticsRaw, fraudSignalsRaw]);

  // ============================================================================
  // TRANSFER STATS (for Transfer Section sidebar)
  // ============================================================================
  const transferStats = useMemo(() => {
    const s: any = statsRaw || {};
    const a: any = analyticsRaw || {};
    const pendingList: any[] = Array.isArray(pendingTxRaw)
      ? pendingTxRaw
      : Array.isArray((pendingTxRaw as any)?.data)
        ? (pendingTxRaw as any).data
        : [];

    return {
      todayVolume: a.todayVolume || s.todayVolume || 0,
      todayCount: a.todayCount || s.todayTransactions || 0,
      avgTransferSize: a.avgTransferSize || (s.totalRevenue && s.totalTransactions ? Math.round(s.totalRevenue / s.totalTransactions) : 0),
      successRate: s.successRate || 95,
      pendingCount: pendingList.length,
      failedCount: a.failedTransactions || 0,
    };
  }, [statsRaw, analyticsRaw, pendingTxRaw]);

  return {
    stats,
    revenueData,
    accountDistribution,
    activityData,
    weeklyTransactions,
    alerts,
    pendingApprovals,
    loansData,
    investmentsData,
    cardsData,
    fraudData,
    transferStats,
    isLoading: statsLoading || analyticsLoading,
    isChartsLoading: volumeLoading || typeLoading || activityLoading,
    isAlertsLoading: alertsLoading || pendingLoading,
    isLoansLoading: loansLoading,
    isInvestmentsLoading: investmentsLoading,
    isCardsLoading: cardsLoading,
    isFraudLoading: fraudCasesLoading,
  };
}
