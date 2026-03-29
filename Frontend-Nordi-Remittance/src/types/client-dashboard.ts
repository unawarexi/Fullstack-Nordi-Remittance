// ============================================================================
// CLIENT DASHBOARD TYPES — Global type declarations for client dashboard
// ============================================================================

declare global {
  /* ─── Account Summary ───────────────────────────────────────────────────── */

  interface WalletItem {
    id: string;
    name: string;
    accountNumber: string;
    type: string;
    balance: number;
    currency: string;
  }

  interface AccountSummaryData {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    wallets: WalletItem[];
  }

  /* ─── Transactions ──────────────────────────────────────────────────────── */

  interface TransactionItem {
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    type: "credit" | "debit" | "transfer";
    status: string;
    category?: string;
    date: string;
  }

  /* ─── Spending Analytics ────────────────────────────────────────────────── */

  interface SpendingCategory {
    category: string;
    amount: number;
    color: string;
  }

  interface SpendingTrendPoint {
    month: string;
    spent: number;
  }

  interface ClientSpendingData {
    categories: SpendingCategory[];
    trends: SpendingTrendPoint[];
    totalSpending: number;
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    isLoading: boolean;
    isTrendLoading: boolean;
  }

  /* ─── Budget ────────────────────────────────────────────────────────────── */

  interface BudgetItem {
    id: string;
    category: string;
    spent: number;
    limit: number;
  }

  /* ─── Investment Snapshot ───────────────────────────────────────────────── */

  interface HoldingItem {
    id: string;
    name: string;
    change: number;
  }

  interface InvestmentSnapshot {
    totalValue: number;
    totalReturn: number;
    returnPct: number;
    holdings: HoldingItem[];
  }

  /* ─── Loans ─────────────────────────────────────────────────────────────── */

  interface LoanItem {
    id: string;
    type: string;
    monthlyPayment: number;
    outstanding: number;
    status: string;
  }

  interface LoansSnapshot {
    activeCount: number;
    totalOutstanding: number;
    loans: LoanItem[];
  }

  /* ─── Cards ─────────────────────────────────────────────────────────────── */

  interface CardItem {
    id: string;
    name: string;
    lastFour: string;
    isVirtual: boolean;
    status: string;
    expiryDate: string;
    spendLimit: number;
    usedAmount: number;
  }

  /* ─── Savings Goals ─────────────────────────────────────────────────────── */

  interface SavingsGoalItem {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    percentage: number;
  }

  /* ─── Notifications ─────────────────────────────────────────────────────── */

  interface NotificationItem {
    id: string;
    title: string;
    type: string;
    date: string;
  }

  /* ─── Insights ──────────────────────────────────────────────────────────── */

  interface InsightItem {
    id: string;
    title: string;
    description?: string;
    sentiment: string;
  }

  /* ─── Security ──────────────────────────────────────────────────────────── */

  interface SecurityStatus {
    kycVerified: boolean;
    kycStatus: string;
    twoFaEnabled: boolean;
  }

  /* ─── Quick Action / Tool ───────────────────────────────────────────────── */

  interface QuickAction {
    title: string;
    icon: React.ReactNode;
    color: string;
    hoverColor: string;
    route: string;
  }

  interface ToolLink {
    label: string;
    icon: React.ReactNode;
    color: string;
    hover: string;
    route: string;
  }

  /* ─── Aggregate Return ──────────────────────────────────────────────────── */

  interface ClientDashboardData {
    account: AccountSummaryData;
    recentTransactions: TransactionItem[];
    budgets: BudgetItem[];
    investments: InvestmentSnapshot;
    loans: LoansSnapshot;
    cards: CardItem[];
    savingsGoals: SavingsGoalItem[];
    notifications: NotificationItem[];
    unreadCount: number;
    insights: InsightItem[];
    security: SecurityStatus;

    isAccountLoading: boolean;
    isTransactionsLoading: boolean;
    isBudgetsLoading: boolean;
    isInvestmentsLoading: boolean;
    isLoansLoading: boolean;
    isCardsLoading: boolean;
    isSavingsLoading: boolean;
    isNotificationsLoading: boolean;
    isInsightsLoading: boolean;
    isSecurityLoading: boolean;
  }
}

export {};
