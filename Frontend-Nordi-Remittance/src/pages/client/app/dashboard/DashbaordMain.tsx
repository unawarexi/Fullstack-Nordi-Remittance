import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Filter, Calendar } from "lucide-react";
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
import { ChartSkeleton, SkeletonBlock } from "@components/skeletons/Skeletons";
import { DashCard, SectionHeader, ProgressBar } from "@components/shared/DashboardPrimitives";
import { formatCurrency } from "@core/algo";
import { QUICK_ACTIONS, SPENDING_FILTER_OPTIONS } from "../../components/dashboard.constants";
import ClientTransferHistory from "./ClientTransferHistory";
import ClientCardsPanel from "./ClientCardsPanel";

// ========================
// PROPS INTERFACE
// ========================
interface DashboardMainProps {
  transactions: TransactionItem[];
  isTransactionsLoading: boolean;
  spending: ClientSpendingData;
  budgets: BudgetItem[];
  isBudgetsLoading: boolean;
  cards: CardItem[];
  cardsData: ClientCardsDetailData;
  isCardsLoading: boolean;
}

// ========================
// SPENDING ANALYTICS
// ========================
const SpendingAnalyticsSection: React.FC<{ spending: ClientSpendingData }> = React.memo(({ spending }) => {
  const { categories, trends, totalSpending, activeFilter, setActiveFilter, isLoading } = spending;

  if (isLoading) return <ChartSkeleton />;

  return (
    <DashCard>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Spending Analytics" subtitle="How you're spending your money" className="!mb-0" />
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400 dark:text-gray-500" />
          <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            {SPENDING_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors sm:text-xs ${
                  activeFilter === opt
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          No spending data available
        </p>
      ) : (
        <div className="flex flex-wrap">
          <div className="mb-3 w-full md:mb-0 md:w-5/12">
            <div className="relative aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    labelLine={false}
                    label={({ percent }) => (percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : "")}
                  >
                    {categories.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                  {formatCurrency(totalSpending)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full pl-0 md:w-7/12 md:pl-4">
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {categories.map((item, index) => {
                const pct = totalSpending > 0 ? ((item.amount / totalSpending) * 100).toFixed(1) : "0";
                return (
                  <motion.div
                    key={item.category}
                    className="rounded-lg border border-gray-100 p-2 transition-colors hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: 0.05 * index },
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{item.category}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <ProgressBar value={Number(pct)} color="h-1 rounded-full" height="sm" delay={0.1 * index} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {trends.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">Spending Trend</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              <Calendar size={12} />
              <span>Last 6 months</span>
            </div>
          </div>
          <div className="h-36 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Spent"]} />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#4f46e5"
                  fillOpacity={1}
                  fill="url(#colorSpent)"
                  activeDot={{
                    r: 5,
                    fill: "#7e22ce",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashCard>
  );
});

// ========================
// BUDGET PROGRESS
// ========================
const BudgetProgressSection: React.FC<{
  budgets: BudgetItem[];
  isLoading: boolean;
}> = React.memo(({ budgets, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="mb-3 h-5 w-32" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }

  if (budgets.length === 0) return null;

  return (
    <DashCard>
      <SectionHeader
        title="Budget Progress"
        subtitle="Monthly spending limits"
        onActionClick={() => navigate("/customer/savings/analytics")}
        actionLabel="Details"
      />
      <div className="space-y-3">
        {budgets.map((b, i) => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          const isOver = pct >= 90;
          return (
            <div key={b.id || i} className="space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{b.category}</span>
                <span
                  className={`font-semibold ${isOver ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}
                >
                  {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
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
});

// ========================
// MAIN DASHBOARD COMPONENT
// ========================
const DashboardMain: React.FC<DashboardMainProps> = ({
  transactions,
  isTransactionsLoading,
  spending,
  budgets,
  isBudgetsLoading,
  cards,
  cardsData,
  isCardsLoading,
}) => {
  const navigate = useNavigate();
  const [txRef, txInView] = useInView();
  const [spendRef, spendInView] = useInView();
  const [budgetRef, budgetInView] = useInView();

  return (
    <div className="flex-1 space-y-5">
      {/* Quick Actions + Cards Panel — side by side */}
      <div className="flex flex-col items-stretch gap-5 lg:flex-row">
        {/* Quick Actions — 60% */}
        <div className="flex w-full lg:w-[58%]">
          <DashCard className="flex flex-1 flex-col">
            <SectionHeader title="Quick Actions" />
            <div className="grid flex-1 grid-cols-3 content-start gap-2 sm:grid-cols-5">
              {QUICK_ACTIONS.map((action, index) => (
                <motion.div
                  key={action.title}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl p-2 transition-colors sm:p-2.5 ${action.color} ${action.hoverColor}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.05 + index * 0.04 },
                  }}
                  onClick={() => navigate(action.route)}
                >
                  {action.icon}
                  <span className="mt-1 text-[10px] font-medium sm:mt-1.5 sm:text-xs">{action.title}</span>
                </motion.div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Cards Panel — 40% */}
        <div className="flex w-full lg:w-[42%]">
          <ClientCardsPanel cards={cards} cardsData={cardsData} isLoading={isCardsLoading} />
        </div>
      </div>

      {/* Transaction History — lazy render */}
      <div ref={txRef}>
        {txInView ? (
          <ClientTransferHistory transactions={transactions} isLoading={isTransactionsLoading} />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <SkeletonBlock className="mb-4 h-5 w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spending Analytics — lazy render */}
      <div ref={spendRef}>{spendInView ? <SpendingAnalyticsSection spending={spending} /> : <ChartSkeleton />}</div>

      {/* Budget Progress — lazy render */}
      <div ref={budgetRef}>
        {budgetInView ? (
          <BudgetProgressSection budgets={budgets} isLoading={isBudgetsLoading} />
        ) : (
          <DashCard>
            <SkeletonBlock className="mb-3 h-5 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 w-full" />
              ))}
            </div>
          </DashCard>
        )}
      </div>
    </div>
  );
};

export default DashboardMain;
