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
  useInvestments,
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

// ─── Safe-array extractor — handles nested backend response shapes ───────────
// Tries: direct array → named keys at top → obj.data as array →
// named keys under obj.data → obj.data.data (double-nested paginated)
const extractArray = (d: unknown, ...keys: string[]): any[] => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];
  const obj = d as Record<string, any>;
  for (const k of keys) { if (Array.isArray(obj[k])) return obj[k]; }
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) { if (Array.isArray(obj.data[k])) return obj.data[k]; }
    if (Array.isArray(obj.data.data)) return obj.data.data;
  }
  return [];
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useClientDashboard(): ClientDashboardData {
  // ── Raw queries ──────────────────────────────────────────────────────────
  const { data: overviewRaw, isLoading: overviewLoading }     = useDashboardOverview();
  const { data: walletsRaw, isLoading: walletsLoading }       = useWallets();
  const { data: txRaw, isLoading: txLoading }                 = useRecentTransactions(5);
  const { data: budgetRaw, isLoading: budgetLoading }         = useBudgetProgress();
  const { data: portfolioRaw, isLoading: portfolioLoading }   = useInvestmentPortfolio();
  const { data: investmentsListRaw, isLoading: investmentsListLoading } = useInvestments();
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
    const raw: any = overviewRaw || {};
    // Backend shape: { statistics: { wallets: { totalBalance, count }, transactions: {...}, products: {...} } }
    const stats = raw.statistics || raw;
    const walletStats = stats.wallets || stats;

    const wallets = extractArray(walletsRaw, "wallets");

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
        walletStats.totalBalance ?? stats.totalBalance ?? raw.totalBalance ?? mapped.reduce((s, w) => s + w.balance, 0),
      monthlyIncome: stats.monthlyIncome ?? raw.monthlyIncome ?? 0,
      monthlyExpenses: stats.monthlyExpenses ?? raw.monthlyExpenses ?? 0,
      wallets: mapped,
    };
  }, [overviewRaw, walletsRaw]);

  // ── Recent Transactions (sorted by date DESC via multiKeySort) ──────────
  const recentTransactions = useMemo<TransactionItem[]>(() => {
    const mapped: TransactionItem[] = extractArray(txRaw, "transactions").map((tx: any) => ({
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
    const mapped: BudgetItem[] = extractArray(budgetRaw, "budgets", "categories").map((b: any) => ({
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
    const p: any = portfolioRaw || {};
    const portfolioArr = extractArray(portfolioRaw, "portfolios", "holdings", "assets");
    const allHoldings: HoldingItem[] = (p.holdings || p.assets || portfolioArr).map(
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
    const list = extractArray(loansRaw, "loans");
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
    return extractArray(cardsRaw, "cards")
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
    return extractArray(goalsRaw, "goals", "savingsGoals").slice(0, 3).map((g: any) => {
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
    return extractArray(notifsRaw, "notifications").slice(0, 5).map((n: any) => ({
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
    const insArr: any[] = extractArray(insightsRaw, "insights", "recommendations");
    return insArr.slice(0, 3).map((ins: any) => ({
      id: ins._id || ins.id || "",
      title: ins.title || ins.message || "Insight",
      description: ins.description,
      sentiment: ins.type || ins.sentiment || "info",
    }));
  }, [insightsRaw]);

  // ── Security/Verification ────────────────────────────────────────────────
  const security = useMemo<SecurityStatus>(() => {
    const profile: any = profileRaw || {};
    const userInfo = profile.user || profile;
    const tfa: any = tfaRaw || {};
    const kycStatus = userInfo.kycStatus || profile.kycStatus || "pending";
    return {
      kycVerified: kycStatus === "verified" || kycStatus === "approved",
      kycStatus,
      twoFaEnabled: !!tfa.enabled || !!tfa.isEnabled,
    };
  }, [profileRaw, tfaRaw]);

  // ── Loans Detail Panel (richer view for dedicated section) ───────────────
  const loansDetail = useMemo<ClientLoansDetailData>(() => {
    const list = extractArray(loansRaw, "loans");
    const activeLoans = list.filter(
      (l: any) => l.status === "active" || l.status === "approved" || l.status === "disbursed",
    );
    const overdueLoans = list.filter(
      (l: any) => l.status === "overdue" || l.isOverdue,
    );
    const pendingApps = list.filter(
      (l: any) => l.status === "pending" || l.status === "under_review",
    );
    const totalDisbursed = list.reduce(
      (s: number, l: any) => s + (l.amount || l.principal || 0), 0,
    );
    const totalRepaid = list.reduce(
      (s: number, l: any) => s + (l.totalPaid || l.amountPaid || 0), 0,
    );
    const repaymentRate =
      totalDisbursed > 0 ? Math.min(Math.round((totalRepaid / totalDisbursed) * 100), 100) : 0;

    return {
      totalLoans: list.length,
      activeLoans: activeLoans.length,
      totalDisbursed,
      totalRepaid,
      overdueLoans: overdueLoans.length,
      pendingApplications: pendingApps.length,
      repaymentRate,
      recentLoans: list.slice(0, 5).map((l: any) => ({
        id: l._id || l.id || "",
        type: l.type || l.loanType || "Personal",
        amount: l.amount || l.principal || 0,
        status: l.status || "pending",
      })),
    };
  }, [loansRaw]);

  // ── Investments Detail Panel (richer view for dedicated section) ─────────
  const investmentsDetail = useMemo<ClientInvestmentsDetailData>(() => {
    const list = extractArray(investmentsListRaw, "investments");
    const portfolio: any = portfolioRaw || {};
    const activeInvestments = list.filter((i: any) => i.status === "active").length;
    const totalPortfolioValue =
      portfolio.currentValue || portfolio.totalValue ||
      list.reduce((s: number, i: any) => s + (i.currentValue || i.amount || 0), 0);
    const totalReturns =
      portfolio.totalReturns ||
      list.reduce((s: number, i: any) => s + (i.returns || i.profit || 0), 0);
    const returnRate =
      portfolio.returnPercentage || portfolio.returnPct ||
      (totalPortfolioValue > 0 ? Math.round((totalReturns / totalPortfolioValue) * 100) : 0);

    const topProducts = portfolio.byType
      ? Object.entries(portfolio.byType).map(([name, data]: [string, any]) => ({
          id: name,
          name,
          type: name,
          returnRate: data?.returnPercentage || 0,
        }))
      : list.slice(0, 3).map((i: any) => ({
          id: i._id || i.id || "",
          name: i.name || i.productName || "Investment",
          type: i.type || "Fixed",
          returnRate: i.returnPercentage || 0,
        }));

    return {
      totalPortfolioValue,
      activeInvestments: activeInvestments || 0,
      totalReturns,
      returnRate,
      savingsGoals: savingsGoals.length,
      savingsProgress:
        savingsGoals.length > 0
          ? Math.round(savingsGoals.reduce((s, g) => s + g.percentage, 0) / savingsGoals.length)
          : 0,
      topProducts,
    };
  }, [investmentsListRaw, portfolioRaw, savingsGoals]);

  // ── Cards Detail Panel (richer view for dedicated section) ───────────────
  const cardsDetail = useMemo<ClientCardsDetailData>(() => {
    const all = extractArray(cardsRaw, "cards");
    const active = all.filter((c: any) => c.status === "active" || !c.status);
    const frozen = all.filter((c: any) => c.status === "frozen" || c.status === "blocked");
    const virtual = all.filter((c: any) => !!c.isVirtual || c.type === "virtual");
    const physical = all.filter((c: any) => !c.isVirtual && c.type !== "virtual");
    const totalSpending = all.reduce(
      (s: number, c: any) => s + (c.usedAmount || c.currentSpend || 0), 0,
    );

    return {
      totalCards: all.length,
      activeCards: active.length,
      frozenCards: frozen.length,
      totalSpending,
      virtualCards: virtual.length,
      physicalCards: physical.length,
    };
  }, [cardsRaw]);

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

    loansDetail,
    investmentsDetail,
    cardsDetail,

    isAccountLoading: overviewLoading && walletsLoading,
    isTransactionsLoading: txLoading,
    isBudgetsLoading: budgetLoading,
    isInvestmentsLoading: portfolioLoading || investmentsListLoading,
    isLoansLoading: loansLoading,
    isCardsLoading: cardsLoading,
    isSavingsLoading: goalsLoading,
    isNotificationsLoading: notifsLoading,
    isInsightsLoading: insightsLoading,
    isSecurityLoading: profileLoading && tfaLoading,
  };
}
