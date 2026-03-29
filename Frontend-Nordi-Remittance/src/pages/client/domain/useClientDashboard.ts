// ============================================================================
// useClientDashboard — Single aggregator hook for the client dashboard
//
// Mirrors the admin's useAdminDashboard pattern:
//  • Calls every query hook the dashboard needs in ONE place
//  • Normalises raw API responses into typed domain objects via useMemo
//  • Exposes granular isLoading flags so each section can skeleton independently
//  • Components receive data as props — no direct hook calls in the view layer
//  • Uses @core/algo for sorting, top-K selection & data masking
// ============================================================================

import { useMemo } from "react";
import {
  useDashboardOverview,
  useWallets,
  useRecentTransactions,
  useBudgetProgress,
  useInvestmentPortfolio,
  useLoans,
  useCards,
  useSavingsGoals,
  useUnreadNotifications,
  useUnreadNotificationsCount,
  useFinancialInsights,
  useTwoFactorStatus,
} from "@hooks/queries";
import { useUserProfile } from "@hooks/queries/useUsers";
import { multiKeySort, topK } from "@core/algo";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Tiny safe-array helper ──────────────────────────────────────────────────
const toArray = (d: unknown): any[] =>
  Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useClientDashboard(): ClientDashboardData {
  // ── Raw queries ──────────────────────────────────────────────────────────
  const { data: overviewRaw, isLoading: overviewLoading }     = useDashboardOverview();
  const { data: walletsRaw, isLoading: walletsLoading }       = useWallets();
  const { data: txRaw, isLoading: txLoading }                 = useRecentTransactions(5);
  const { data: budgetRaw, isLoading: budgetLoading }         = useBudgetProgress();
  const { data: portfolioRaw, isLoading: portfolioLoading }   = useInvestmentPortfolio();
  const { data: loansRaw, isLoading: loansLoading }           = useLoans();
  const { data: cardsRaw, isLoading: cardsLoading }           = useCards();
  const { data: goalsRaw, isLoading: goalsLoading }           = useSavingsGoals();
  const { data: notifsRaw, isLoading: notifsLoading }         = useUnreadNotifications(5);
  const { data: countRaw }                                     = useUnreadNotificationsCount();
  const { data: insightsRaw, isLoading: insightsLoading }     = useFinancialInsights();
  const { data: profileRaw, isLoading: profileLoading }       = useUserProfile();
  const { data: tfaRaw, isLoading: tfaLoading }               = useTwoFactorStatus();

  // ── Account Summary ──────────────────────────────────────────────────────
  const account = useMemo<AccountSummaryData>(() => {
    const stats: any = overviewRaw || {};
    const wallets = toArray(walletsRaw);

    const mapped: WalletItem[] = wallets.map((w: any) => ({
      id: w._id || w.id || "",
      name: w.name || w.accountName || "Account",
      accountNumber: w.accountNumber || w.number || "0000",
      type: (w.type || w.accountType || "default").toLowerCase(),
      balance: w.balance || 0,
      currency: w.currency || "USD",
    }));

    return {
      totalBalance:
        stats.totalBalance ?? mapped.reduce((s, w) => s + w.balance, 0),
      monthlyIncome: stats.monthlyIncome ?? 0,
      monthlyExpenses: stats.monthlyExpenses ?? 0,
      wallets: mapped,
    };
  }, [overviewRaw, walletsRaw]);

  // ── Recent Transactions (sorted by date DESC via multiKeySort) ──────────
  const recentTransactions = useMemo<TransactionItem[]>(() => {
    const mapped: TransactionItem[] = toArray(txRaw).map((tx: any) => ({
      id: tx._id || tx.id || "",
      title: tx.description || tx.title || tx.recipientName || "Transaction",
      description: tx.category || tx.type || "",
      amount: tx.amount || 0,
      currency: tx.currency || "USD",
      type:
        tx.type === "credit" || tx.type === "deposit"
          ? "credit"
          : tx.type === "transfer"
            ? "transfer"
            : "debit",
      status: tx.status || "completed",
      category: tx.category,
      date: tx.createdAt || tx.date || new Date().toISOString(),
    }));

    return multiKeySort(mapped, [
      { getter: (t) => new Date(t.date), direction: "desc" },
    ]).slice(0, 5);
  }, [txRaw]);

  // ── Budgets (sorted by usage ratio DESC — highest pressure first) ──────
  const budgets = useMemo<BudgetItem[]>(() => {
    const mapped: BudgetItem[] = toArray(budgetRaw).map((b: any) => ({
      id: b._id || b.category || b.name || "",
      category: b.category || b.name || "Budget",
      spent: b.spent || b.current || 0,
      limit: b.limit || b.budget || b.target || 1,
    }));

    return multiKeySort(mapped, [
      { getter: (b) => b.spent / b.limit, direction: "desc" },
    ]).slice(0, 4);
  }, [budgetRaw]);

  // ── Investment Snapshot (topK holdings by abs change) ──────────────────
  const investments = useMemo<InvestmentSnapshot>(() => {
    const p: any = (portfolioRaw as any)?.data || portfolioRaw || {};
    const allHoldings: HoldingItem[] = (p.holdings || p.assets || []).map(
      (h: any) => ({
        id: h._id || h.id || h.symbol || "",
        name: h.name || h.symbol || "Asset",
        change: h.change || 0,
      }),
    );

    const holdings = topK(
      allHoldings,
      3,
      (a, b) => Math.abs(b.change) - Math.abs(a.change),
    );

    return {
      totalValue: p.totalValue || p.total || 0,
      totalReturn: p.totalReturn || p.returns || 0,
      returnPct: p.returnPercentage || p.returnPct || 0,
      holdings,
    };
  }, [portfolioRaw]);

  // ── Loans Snapshot (sorted by outstanding DESC) ────────────────────────
  const loans = useMemo<LoansSnapshot>(() => {
    const list = toArray(loansRaw);
    const active = list.filter(
      (l: any) => l.status === "active" || l.status === "approved",
    );
    const totalOutstanding = active.reduce(
      (s: number, l: any) =>
        s + (l.remainingAmount || l.outstanding || l.amount || 0),
      0,
    );
    const allLoans: LoanItem[] = active.map((l: any) => ({
      id: l._id || l.id || "",
      type: l.type || l.name || "Loan",
      monthlyPayment: l.monthlyPayment || l.emi || 0,
      outstanding: l.remainingAmount || l.outstanding || l.amount || 0,
      status: l.status || "active",
    }));

    const mapped = multiKeySort(allLoans, [
      { getter: (l) => l.outstanding, direction: "desc" },
    ]).slice(0, 2);

    return { activeCount: active.length, totalOutstanding, loans: mapped };
  }, [loansRaw]);

  // ── Cards ────────────────────────────────────────────────────────────────
  const cards = useMemo<CardItem[]>(() => {
    return toArray(cardsRaw)
      .filter((c: any) => c.status === "active" || !c.status)
      .slice(0, 2)
      .map((c: any) => ({
        id: c._id || c.id || "",
        name: c.name || c.cardName || "Card",
        lastFour: c.lastFour || c.cardNumber?.slice(-4) || "••••",
        isVirtual: !!c.isVirtual || c.type === "virtual",
        status: c.status || "active",
        expiryDate: c.expiryDate || c.expiry || "••/••",
        spendLimit: c.spendLimit || c.limit || 0,
        usedAmount: c.usedAmount || c.currentSpend || 0,
      }));
  }, [cardsRaw]);

  // ── Savings Goals ────────────────────────────────────────────────────────
  const savingsGoals = useMemo<SavingsGoalItem[]>(() => {
    return toArray(goalsRaw).slice(0, 3).map((g: any) => {
      const current = g.currentAmount || g.saved || 0;
      const target = g.targetAmount || g.target || 1;
      return {
        id: g._id || g.id || "",
        name: g.name || g.title || "Goal",
        currentAmount: current,
        targetAmount: target,
        percentage: Math.min((current / target) * 100, 100),
      };
    });
  }, [goalsRaw]);

  // ── Notifications ────────────────────────────────────────────────────────
  const notifications = useMemo<NotificationItem[]>(() => {
    return toArray(notifsRaw).slice(0, 5).map((n: any) => ({
      id: n._id || n.id || "",
      title: n.title || n.message || "Notification",
      type: n.type || "info",
      date: n.createdAt
        ? new Date(n.createdAt).toLocaleDateString()
        : "Just now",
    }));
  }, [notifsRaw]);

  const unreadCount = (countRaw as any)?.count || 0;

  // ── Insights ─────────────────────────────────────────────────────────────
  const insights = useMemo<InsightItem[]>(() => {
    const raw: any[] = (insightsRaw as any)?.data || insightsRaw || [];
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 3).map((ins: any) => ({
      id: ins._id || ins.id || "",
      title: ins.title || ins.message || "Insight",
      description: ins.description,
      sentiment: ins.type || ins.sentiment || "info",
    }));
  }, [insightsRaw]);

  // ── Security/Verification ────────────────────────────────────────────────
  const security = useMemo<SecurityStatus>(() => {
    const profile: any = profileRaw || {};
    const tfa: any = tfaRaw || {};
    const kycStatus = profile.kycStatus || "pending";
    return {
      kycVerified: kycStatus === "verified" || kycStatus === "approved",
      kycStatus,
      twoFaEnabled: !!tfa.enabled || !!tfa.isEnabled,
    };
  }, [profileRaw, tfaRaw]);

  // ── Return ───────────────────────────────────────────────────────────────
  return {
    account,
    recentTransactions,
    budgets,
    investments,
    loans,
    cards,
    savingsGoals,
    notifications,
    unreadCount,
    insights,
    security,

    isAccountLoading: overviewLoading && walletsLoading,
    isTransactionsLoading: txLoading,
    isBudgetsLoading: budgetLoading,
    isInvestmentsLoading: portfolioLoading,
    isLoansLoading: loansLoading,
    isCardsLoading: cardsLoading,
    isSavingsLoading: goalsLoading,
    isNotificationsLoading: notifsLoading,
    isInsightsLoading: insightsLoading,
    isSecurityLoading: profileLoading && tfaLoading,
  };
}
