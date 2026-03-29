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


const StocksETFs: React.FC = () => {
  const [search, setSearch] = useState("");
  const { products: apiStocks, isLoading } = useClientInvestmentProducts({ type: "stock" as any });

  const defaultStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 189.25, change: 2.34, pctChange: 1.25, marketCap: 2940000000000 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.8, change: -0.95, pctChange: -0.67, marketCap: 1790000000000 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 374.58, change: 4.12, pctChange: 1.11, marketCap: 2780000000000 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 1.56, pctChange: 0.88, marketCap: 1850000000000 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -3.21, pctChange: -1.28, marketCap: 788000000000 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 495.22, change: 12.45, pctChange: 2.58, marketCap: 1220000000000 },
    { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 454.32, change: 2.18, pctChange: 0.48, marketCap: 425000000000 },
    { symbol: "QQQ", name: "Invesco QQQ Trust", price: 387.65, change: 3.42, pctChange: 0.89, marketCap: 198000000000 },
  ];

  const stocks = apiStocks.length > 0 ? apiStocks : defaultStocks;

  const filtered = useMemo(
    () =>
      stocks.filter(
        (s: any) =>
          !search ||
          (s.symbol ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.name ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [stocks, search]
  );

  return (
    <PageContainer>
      <PageHeader
        title="Stocks & ETFs"
        subtitle="Trade stocks and exchange-traded funds"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Investments", href: "/customer/investments" },
          { label: "Stocks & ETFs" },
        ]}
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TableSkeleton rows={6} />
        </>
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Search ─────────────────────────────────────────────── */}
          <DashCard>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                placeholder="Search stocks or ETFs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />
            </div>
          </DashCard>

          {/* ── Stocks Table ───────────────────────────────────────── */}
          <DashCard padding="none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Market Quotes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time stock and ETF prices
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  variant="search"
                  title="No stocks found"
                  description="Try a different search term."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Price
                      </th>
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Change
                      </th>
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right hidden sm:table-cell">
                        Market Cap
                      </th>
                      <th className="px-4 py-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filtered.map((stock: any, idx: number) => {
                      const change = stock.change ?? 0;
                      const changePct = stock.pctChange ?? stock.changePercent ?? 0;
                      const positive = change >= 0;
                      return (
                        <tr
                          key={stock.symbol ?? idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                              {stock.symbol}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {stock.name}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap text-right">
                            {fmt(stock.price ?? 0)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              {positive ? (
                                <TrendingUp
                                  size={12}
                                  className="text-emerald-500 dark:text-emerald-400"
                                />
                              ) : (
                                <TrendingDown
                                  size={12}
                                  className="text-rose-500 dark:text-rose-400"
                                />
                              )}
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  positive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {positive ? "+" : ""}
                                {changePct.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap text-right hidden sm:table-cell">
                            {stock.marketCap
                              ? fmtCompact(stock.marketCap)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <motion.button
                              className="px-3 py-1.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white text-[10px] sm:text-xs font-medium rounded-lg transition-colors"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Trade
                            </motion.button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default StocksETFs;
