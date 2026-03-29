// ============================================================================
// INVESTMENT SUB-PAGES — Overview · Mutual Funds · Stocks & ETFs · Fixed Income · Market Insights
// Dark-mode-first, border-only cards (no shadow-sm), responsive typography
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Globe,
  Lightbulb,
  Briefcase,
  Star,
  BookOpen,
  Newspaper,
  Tag,
  CalendarDays,
} from "@constants/icons";

import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useInvestments,
  useInvestmentProducts,
  useInvestmentPortfolio,
  useInvestmentPerformance,
} from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;


const InvestmentOverview: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: portfolioData, isLoading: pLoading } = useInvestmentPortfolio();
  const { data: invData, isLoading: iLoading } = useInvestments();
  const portfolio = (portfolioData as any)?.data ?? portfolioData ?? {};
  const investments: any[] = safeArray(invData);
  const isLoading = pLoading || iLoading;

  const totalValue = portfolio?.totalValue ?? 0;
  const totalReturns = portfolio?.totalReturns ?? 0;
  const returnPct = portfolio?.returnPercentage ?? portfolio?.dailyChangePercent ?? 0;

  // Allocation breakdown (dummy if API doesn't return)
  const allocation = portfolio?.allocation ?? [
    { label: "Equities", pct: 45, color: "bg-indigo-500 dark:bg-indigo-400" },
    { label: "Fixed Income", pct: 25, color: "bg-emerald-500 dark:bg-emerald-400" },
    { label: "Mutual Funds", pct: 20, color: "bg-amber-500 dark:bg-amber-400" },
    { label: "Cash", pct: 10, color: "bg-gray-400 dark:bg-gray-500" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Investment Overview"
        subtitle="Track your portfolio performance"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Investments", href: "/customer/investments" },
          { label: "Overview" },
        ]}
        actions={
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Invest
          </motion.button>
        }
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={4} />
          <ChartSkeleton />
        </>
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Stats ──────────────────────────────────────────────── */}
          <StatsGrid cols={4}>
            <StatCard
              label="Portfolio Value"
              value={show ? fmt(totalValue) : "••••••"}
              icon={<PieChart size={20} />}
              iconColor="from-indigo-500 to-purple-500"
              change={returnPct ? pct(returnPct) : undefined}
              positive={returnPct >= 0}
              index={0}
            />
            <StatCard
              label="Total Returns"
              value={show ? fmt(totalReturns) : "••••••"}
              icon={
                totalReturns >= 0 ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )
              }
              iconColor={
                totalReturns >= 0
                  ? "from-emerald-500 to-teal-500"
                  : "from-rose-500 to-pink-500"
              }
              index={1}
            />
            <StatCard
              label="Today's Change"
              value={
                show
                  ? pct(portfolio?.dailyChangePercent ?? 0)
                  : "••"
              }
              icon={<BarChart3 size={20} />}
              iconColor="from-blue-500 to-cyan-500"
              index={2}
            />
            <StatCard
              label="Holdings"
              value={String(investments.length)}
              icon={<Layers size={20} />}
              iconColor="from-amber-500 to-orange-500"
              index={3}
            />
          </StatsGrid>

          {/* ── Portfolio Allocation ───────────────────────────────── */}
          <DashCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Portfolio Allocation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Distribution across asset classes
                </p>
              </div>
              <PieChart
                size={18}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>

            <div className="space-y-3">
              {allocation.map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {item.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <motion.div
                      className={`h-2 rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{
                        duration: 0.7,
                        delay: idx * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashCard>

          {/* ── Holdings List ──────────────────────────────────────── */}
          <DashCard padding="none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Your Holdings
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All active investment positions
              </p>
            </div>

            {investments.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Briefcase size={40} />}
                  title="No investments yet"
                  description="Start building your portfolio by exploring mutual funds, stocks, or fixed income products."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {investments.map((inv: any, i: number) => {
                  const ret =
                    inv.returnPercentage ?? inv.returns ?? inv.change ?? 0;
                  const positive = ret >= 0;
                  return (
                    <div
                      key={inv._id ?? inv.id ?? i}
                      className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${
                            positive
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {positive ? (
                            <ArrowUpRight size={16} />
                          ) : (
                            <ArrowDownRight size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {inv.name ?? inv.productName ?? "Investment"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {inv.type ?? inv.category ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {show
                            ? fmt(inv.currentValue ?? inv.amount ?? 0)
                            : "••••••"}
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs font-medium ${
                            positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {pct(ret)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default InvestmentOverview;
