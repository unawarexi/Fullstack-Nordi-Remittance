import { useMemo } from "react";
import {
  useAdminDashboardStats,
  useAdminAnalytics,
  useFraudSignals,
  usePendingTransactions,
  useTransactionVolumeChart,
  useTransactionsByType,
  useActivitySummary,
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

  return {
    stats,
    revenueData,
    accountDistribution,
    activityData,
    weeklyTransactions,
    alerts,
    pendingApprovals,
    isLoading: statsLoading || analyticsLoading,
    isChartsLoading: volumeLoading || typeLoading || activityLoading,
    isAlertsLoading: alertsLoading || pendingLoading,
  };
}
