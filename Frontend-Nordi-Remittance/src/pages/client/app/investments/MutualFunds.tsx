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
  useClientInvestments,
  useClientInvestmentProducts,
  useClientPortfolio,
  useClientInvestmentPerformance,
} from "../../domain/useInvestmentsDomain";
import { useUIStore } from "@store/ui.store";

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


const MutualFunds: React.FC = () => {
  const { products: allProducts, isLoading } = useClientInvestmentProducts({ type: "mutual_fund" as any });
  const products = allProducts.filter(
    (p: any) =>
      p.type === "mutual_fund" || p.category === "mutual_funds" || true
  );

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const defaultFunds = [
    { name: "Nordi Growth Fund", category: "Equity", risk: "high", returns: 14.5, minInvestment: 500, nav: 45.32, rating: 4 },
    { name: "Nordi Balanced Fund", category: "Hybrid", risk: "medium", returns: 9.8, minInvestment: 1000, nav: 28.67, rating: 5 },
    { name: "Nordi Income Fund", category: "Debt", risk: "low", returns: 6.2, minInvestment: 250, nav: 15.44, rating: 4 },
    { name: "Nordi Index Fund", category: "Index", risk: "medium", returns: 12.1, minInvestment: 100, nav: 120.89, rating: 3 },
    { name: "Nordi Small Cap", category: "Equity", risk: "high", returns: 18.3, minInvestment: 2000, nav: 62.15, rating: 5 },
    { name: "Nordi Liquid Fund", category: "Debt", risk: "low", returns: 4.5, minInvestment: 100, nav: 10.02, rating: 3 },
  ];

  const display = products.length > 0 ? products : defaultFunds;

  const filtered = useMemo(
    () =>
      display.filter(
        (f: any) =>
          (riskFilter === "all" || f.risk === riskFilter || f.riskLevel === riskFilter) &&
          (!search ||
            (f.name ?? "").toLowerCase().includes(search.toLowerCase()))
      ),
    [display, riskFilter, search]
  );

  const riskColors: Record<string, string> = {
    low: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    medium: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    high: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
  };

  return (
    <PageContainer>
      <PageHeader
        title="Mutual Funds"
        subtitle="Explore and invest in mutual funds"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Investments", href: "/customer/investments" },
          { label: "Mutual Funds" },
        ]}
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TableSkeleton rows={4} />
        </>
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Search & Filter ────────────────────────────────────── */}
          <DashCard>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  placeholder="Search funds..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                {["all", "low", "medium", "high"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`px-3 py-2 rounded-xl text-[10px] sm:text-xs font-medium capitalize transition-colors ${
                      riskFilter === r
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {r === "all" ? "All Risk" : r}
                  </button>
                ))}
              </div>
            </div>
          </DashCard>

          {/* ── Fund Cards ─────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <EmptyState
              variant="search"
              title="No funds found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((fund: any, i: number) => {
                const risk = fund.risk ?? fund.riskLevel ?? "medium";
                const rating = fund.rating ?? fund.starRating ?? 4;
                return (
                  <DashCard key={fund.id ?? fund._id ?? i} hover>
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {fund.name ?? "Mutual Fund"}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {fund.category ?? fund.type ?? "—"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize ${
                            riskColors[risk] ?? riskColors.medium
                          }`}
                        >
                          {risk}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            size={12}
                            className={
                              si < rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300 dark:text-gray-600"
                            }
                          />
                        ))}
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                          ({rating}/5)
                        </span>
                      </div>

                      {/* Data Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Returns
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            +{fund.returns ?? fund.annualReturn ?? 0}%
                          </p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            NAV
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            ${fund.nav ?? fund.netAssetValue ?? 0}
                          </p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Min
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            ${fund.minInvestment ?? fund.minimumInvestment ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Invest Button */}
                      <motion.button
                        className="w-full mt-auto py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Invest Now
                      </motion.button>
                    </div>
                  </DashCard>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};

export default MutualFunds;
