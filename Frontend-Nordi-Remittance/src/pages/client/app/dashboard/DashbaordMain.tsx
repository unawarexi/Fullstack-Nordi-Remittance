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
import {
  ChartSkeleton,
  SkeletonBlock,
} from "@components/skeletons/Skeletons";
import {
  DashCard,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { formatCurrency } from "@core/algo";
import {
  QUICK_ACTIONS,
  SPENDING_FILTER_OPTIONS,
} from "../../domain/constants/dashboard.constants";
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
const SpendingAnalyticsSection: React.FC<{ spending: ClientSpendingData }> =
  React.memo(({ spending }) => {
    const {
      categories,
      trends,
      totalSpending,
      activeFilter,
      setActiveFilter,
      isLoading,
    } = spending;

    if (isLoading) return <ChartSkeleton />;

    return (
      <DashCard>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <SectionHeader
            title="Spending Analytics"
            subtitle="How you're spending your money"
            className="!mb-0"
          />
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400 dark:text-gray-500" />
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {SPENDING_FILTER_OPTIONS.map((opt) => (
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

        {categories.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-6">
            No spending data available
          </p>
        ) : (
          <div className="flex flex-wrap">
            <div className="w-full md:w-5/12 mb-3 md:mb-0">
              <div className="aspect-square relative">
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
                      label={({ percent }) =>
                        percent > 0.08
                          ? `${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                    >
                      {categories.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name,
                      ]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalSpending)}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-7/12 pl-0 md:pl-4">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((item, index) => {
                  const pct =
                    totalSpending > 0
                      ? ((item.amount / totalSpending) * 100).toFixed(1)
                      : "0";
                  return (
                    <motion.div
                      key={item.category}
                      className="border border-gray-100 dark:border-gray-800 rounded-lg p-2 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: 0.05 * index },
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {item.category}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <ProgressBar
                        value={Number(pct)}
                        color="h-1 rounded-full"
                        height="sm"
                        delay={0.1 * index}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {trends.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Spending Trend
              </h3>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={12} />
                <span>Last 6 months</span>
              </div>
            </div>
            <div className="h-36 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trends}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorSpent"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#4f46e5"
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Spent"]}
                  />
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
        <SkeletonBlock className="h-5 w-32 mb-3" />
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {b.category}
                </span>
                <span
                  className={`font-semibold ${isOver ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}
                >
                  {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                </span>
              </div>
              <ProgressBar
                value={pct}
                color={
                  isOver
                    ? "bg-rose-500"
                    : pct > 70
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                }
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
      <div className="flex flex-col lg:flex-row items-stretch gap-5">
        {/* Quick Actions — 60% */}
        <div className="w-full lg:w-[58%] flex">
          <DashCard className="flex-1 flex flex-col">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 flex-1 content-start">
              {QUICK_ACTIONS.map((action, index) => (
                <motion.div
                  key={action.title}
                  className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors ${action.color} ${action.hoverColor}`}
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
                  <span className="text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium">
                    {action.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Cards Panel — 40% */}
        <div className="w-full lg:w-[42%] flex">
          <ClientCardsPanel
            cards={cards}
            cardsData={cardsData}
            isLoading={isCardsLoading}
          />
        </div>
      </div>

      {/* Transaction History — lazy render */}
      <div ref={txRef}>
        {txInView ? (
          <ClientTransferHistory
            transactions={transactions}
            isLoading={isTransactionsLoading}
          />
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <SkeletonBlock className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spending Analytics — lazy render */}
      <div ref={spendRef}>
        {spendInView ? (
          <SpendingAnalyticsSection spending={spending} />
        ) : (
          <ChartSkeleton />
        )}
      </div>

      {/* Budget Progress — lazy render */}
      <div ref={budgetRef}>
        {budgetInView ? (
          <BudgetProgressSection
            budgets={budgets}
            isLoading={isBudgetsLoading}
          />
        ) : (
          <DashCard>
            <SkeletonBlock className="h-5 w-32 mb-3" />
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
