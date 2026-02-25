import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Receipt,
  ArrowDownCircle,
  Repeat,
  QrCode,
  Filter,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useInView } from "@hooks/useInView";
import {
  useRecentTransactions,
  useSpendingByCategory,
  useSpendingTrends,
  useBudgetProgress,
  useLoans,
  useInvestmentPortfolio,
} from "@hooks/queries";
import { TransactionItem } from "@components/banking/TransactionItem";
import {
  TransactionListSkeleton,
  ChartSkeleton,
  StatsCardSkeleton,
  SkeletonBlock,
} from "@components/skeletons/Skeletons";
import {
  DashCard,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import {
  dashboardItemVariants,
  sidebarItemVariants,
} from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ========================
// QUICK ACTIONS
// ========================
const quickActions = [
  { title: "Send Money", icon: <Send size={20} />, color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400", hoverColor: "hover:bg-indigo-100 dark:hover:bg-indigo-950/80", route: "/customer/send" },
  { title: "Pay Bills", icon: <Receipt size={20} />, color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400", hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-950/80", route: "/customer/bills" },
  { title: "Deposit", icon: <ArrowDownCircle size={20} />, color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400", hoverColor: "hover:bg-pink-100 dark:hover:bg-pink-950/80", route: "/customer/transactions" },
  { title: "Exchange", icon: <Repeat size={20} />, color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400", hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-950/80", route: "/customer/forex" },
  { title: "Scan & Pay", icon: <QrCode size={20} />, color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400", hoverColor: "hover:bg-amber-100 dark:hover:bg-amber-950/80", route: "/customer/mobile/qr" },
];

const CHART_COLORS = ["#4f46e5", "#7e22ce", "#db2777", "#0891b2", "#f59e0b", "#059669", "#e11d48", "#6366f1"];
const filterOptions = ["Week", "Month", "Quarter", "Year"];

// ========================
// RECENT TRANSACTIONS
// ========================
const RecentTransactionsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: txRes, isLoading } = useRecentTransactions(5);
  const transactions: any[] = Array.isArray(txRes)
    ? txRes
    : Array.isArray((txRes as any)?.data) ? (txRes as any).data : [];

  if (isLoading) return <TransactionListSkeleton count={4} />;

  return (
    <DashCard>
      <SectionHeader
        title="Recent Transactions"
        subtitle="Latest activity"
        onActionClick={() => navigate("/customer/transactions")}
      />
      {transactions.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-6">No recent transactions</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.slice(0, 5).map((tx: any, i: number) => (
            <TransactionItem
              key={tx._id || tx.id || i}
              id={tx._id || tx.id || String(i)}
              title={tx.description || tx.title || tx.recipientName || "Transaction"}
              description={tx.category || tx.type}
              amount={tx.amount || 0}
              currency={tx.currency || "USD"}
              type={tx.type === "credit" || tx.type === "deposit" ? "credit" : tx.type === "transfer" ? "transfer" : "debit"}
              status={tx.status || "completed"}
              category={tx.category}
              date={tx.createdAt || tx.date || new Date().toISOString()}
              onClick={() => navigate("/customer/transactions")}
            />
          ))}
        </div>
      )}
    </DashCard>
  );
};

// ========================
// SPENDING ANALYTICS
// ========================
const SpendingAnalyticsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Month");
  const periodMap: Record<string, "1W" | "1M" | "3M" | "1Y"> = { Week: "1W", Month: "1M", Quarter: "3M", Year: "1Y" };
  const period = periodMap[activeFilter] || "1M";
  const { data: catRes, isLoading: catLoading } = useSpendingByCategory({ period });
  const { data: trendRes } = useSpendingTrends({ period });

  const catData: any = (catRes as any) || {};
  const categories: any[] = catData?.categories || [];
  const trends: any[] = Array.isArray(trendRes) ? trendRes : Array.isArray((trendRes as any)?.data) ? (trendRes as any).data : [];

  const spendingData = categories.map((c: any, i: number) => ({
    category: c.category || c.name || `Category ${i + 1}`,
    amount: c.amount || c.total || 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const trendData = trends.map((t: any) => ({
    month: t.month || t.period || t.label || "",
    spent: t.amount || t.total || t.spent || 0,
  }));

  const totalSpending = spendingData.reduce((s, item) => s + item.amount, 0);

  if (catLoading) return <ChartSkeleton />;

  return (
    <DashCard>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        <SectionHeader title="Spending Analytics" subtitle="How you're spending your money" className="!mb-0" />
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400 dark:text-gray-500" />
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${
                  activeFilter === opt
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {spendingData.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-6">No spending data available</p>
      ) : (
        <div className="flex flex-wrap">
          <div className="w-full md:w-5/12 mb-3 md:mb-0">
            <div className="aspect-square relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={spendingData} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" paddingAngle={2} labelLine={false}
                    label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""}>
                    {spendingData.map((entry) => (<Cell key={entry.category} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`$${value}`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">${totalSpending.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-7/12 pl-0 md:pl-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {spendingData.map((item, index) => {
                const pct = totalSpending > 0 ? ((item.amount / totalSpending) * 100).toFixed(1) : "0";
                return (
                  <motion.div
                    key={item.category}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg p-2 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * index } }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item.category}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">${item.amount.toLocaleString()}</p>
                    </div>
                    <ProgressBar value={Number(pct)} color={`h-1 rounded-full`} height="sm" delay={0.1 * index} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {trendData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Spending Trend</h3>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} /><span>Last 6 months</span>
            </div>
          </div>
          <div className="h-36 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`$${value}`, "Spent"]} />
                <Area type="monotone" dataKey="spent" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSpent)" activeDot={{ r: 5, fill: "#7e22ce", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashCard>
  );
};

// ========================
// BUDGET PROGRESS
// ========================
const BudgetProgressSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: budgetRes, isLoading } = useBudgetProgress();
  const budgets: any[] = Array.isArray(budgetRes) ? budgetRes : Array.isArray((budgetRes as any)?.data) ? (budgetRes as any).data : [];

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-32 mb-3" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<SkeletonBlock key={i} className="h-14 w-full" />))}</div>
      </DashCard>
    );
  }

  if (budgets.length === 0) return null;

  return (
    <DashCard>
      <SectionHeader title="Budget Progress" subtitle="Monthly spending limits" onActionClick={() => navigate("/customer/savings/analytics")} actionLabel="Details" />
      <div className="space-y-3">
        {budgets.slice(0, 4).map((b: any, i: number) => {
          const spent = b.spent || b.current || 0;
          const limit = b.limit || b.budget || b.target || 1;
          const pct = Math.min((spent / limit) * 100, 100);
          const isOver = pct >= 90;
          return (
            <div key={b._id || b.category || i} className="space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{b.category || b.name || "Budget"}</span>
                <span className={`font-semibold ${isOver ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}>
                  ${spent.toLocaleString()} / ${limit.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={pct}
                color={isOver ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-indigo-500"}
                delay={i * 0.08}
              />
            </div>
          );
        })}
      </div>
    </DashCard>
  );
};

// ========================
// INVESTMENTS SNAPSHOT
// ========================
const InvestmentsSnapshotSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: portfolioRes, isLoading } = useInvestmentPortfolio();
  const portfolio: any = portfolioRes?.data || portfolioRes || {};

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-40 mb-3" /><SkeletonBlock className="h-24 w-full" /></DashCard>);
  }

  const totalValue = portfolio?.totalValue || portfolio?.total || 0;
  const totalReturn = portfolio?.totalReturn || portfolio?.returns || 0;
  const returnPct = portfolio?.returnPercentage || portfolio?.returnPct || 0;
  const holdings: any[] = portfolio?.holdings || portfolio?.assets || [];

  return (
    <DashCard hover onClick={() => navigate("/customer/investments")}>
      <SectionHeader
        title="Investments"
        subtitle="Portfolio snapshot"
        action={
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
          </div>
        }
      />
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-3 mb-3">
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Portfolio Value</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className={`text-[10px] sm:text-xs font-medium mt-0.5 ${totalReturn >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {totalReturn >= 0 ? "+" : ""}${totalReturn.toLocaleString()} ({returnPct}%)
        </p>
      </div>
      {holdings.length > 0 && (
        <div className="space-y-1.5">
          {holdings.slice(0, 3).map((h: any, i: number) => (
            <div key={h._id || i} className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-gray-600 dark:text-gray-400">{h.name || h.symbol || "Asset"}</span>
              <span className={`font-medium ${(h.change || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {(h.change || 0) >= 0 ? "+" : ""}{h.change || 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

// ========================
// LOANS OVERVIEW
// ========================
const LoansOverviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: loansRes, isLoading } = useLoans();
  const loans: any[] = Array.isArray(loansRes) ? (loansRes as any[]) : Array.isArray((loansRes as any)?.data) ? (loansRes as any).data : [];

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-32 mb-3" /><SkeletonBlock className="h-16 w-full" /></DashCard>);
  }

  const activeLoans = loans.filter((l: any) => l.status === "active" || l.status === "approved");
  if (activeLoans.length === 0) return null;

  const totalOutstanding = activeLoans.reduce((s: number, l: any) => s + (l.remainingAmount || l.outstanding || l.amount || 0), 0);

  return (
    <DashCard hover onClick={() => navigate("/customer/loans")}>
      <SectionHeader
        title="Active Loans"
        subtitle={`${activeLoans.length} active loan${activeLoans.length !== 1 ? "s" : ""}`}
        action={<ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />}
      />
      <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-3 mb-2">
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total Outstanding</p>
        <p className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-400">
          ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
      {activeLoans.slice(0, 2).map((loan: any, i: number) => (
        <div key={loan._id || i} className="flex justify-between items-center py-1.5 border-t border-gray-100 dark:border-gray-800 text-[10px] sm:text-xs">
          <span className="text-gray-600 dark:text-gray-400">{loan.type || loan.name || "Loan"}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${(loan.monthlyPayment || loan.emi || 0).toLocaleString()}/mo
          </span>
        </div>
      ))}
    </DashCard>
  );
};

// ========================
// MAIN DASHBOARD COMPONENT
// ========================
const DashboardMain: React.FC = () => {
  const navigate = useNavigate();
  const [txRef, txInView] = useInView();
  const [spendRef, spendInView] = useInView();
  const [budgetRef, budgetInView] = useInView();
  const [extraRef, extraInView] = useInView();

  return (
    <div className="flex-1 space-y-4">
      {/* Quick Actions */}
      <DashCard>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors ${action.color} ${action.hoverColor}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + index * 0.04 } }}
              onClick={() => navigate(action.route)}
            >
              {action.icon}
              <span className="text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium">{action.title}</span>
            </motion.div>
          ))}
        </div>
      </DashCard>

      {/* Recent Transactions — lazy */}
      <div ref={txRef}>{txInView ? <RecentTransactionsSection /> : <TransactionListSkeleton count={3} />}</div>

      {/* Spending Analytics — lazy */}
      <div ref={spendRef}>{spendInView ? <SpendingAnalyticsSection /> : <ChartSkeleton />}</div>

      {/* Budget Progress — lazy */}
      <div ref={budgetRef}>
        {budgetInView ? <BudgetProgressSection /> : (
          <DashCard><SkeletonBlock className="h-5 w-32 mb-3" /><div className="space-y-3">{[1, 2, 3].map((i) => (<SkeletonBlock key={i} className="h-10 w-full" />))}</div></DashCard>
        )}
      </div>

      {/* Investments & Loans — lazy, side by side */}
      <div ref={extraRef}>
        {extraInView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InvestmentsSnapshotSection />
            <LoansOverviewSection />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCardSkeleton /><StatsCardSkeleton />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMain;
