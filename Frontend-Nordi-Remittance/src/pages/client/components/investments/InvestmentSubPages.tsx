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

// ─────────────────────────────────────────────────────────────────────────────
// 1. INVESTMENT OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const InvestmentOverview: React.FC = () => {
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. MUTUAL FUNDS
// ─────────────────────────────────────────────────────────────────────────────

export const MutualFunds: React.FC = () => {
  const { data, isLoading } = useInvestmentProducts({ type: "mutual_fund" as any });
  const allProducts: any[] = safeArray(data);
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. STOCKS & ETFs
// ─────────────────────────────────────────────────────────────────────────────

export const StocksETFs: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: productsData, isLoading } = useInvestmentProducts({ type: "stock" as any });
  const apiStocks: any[] = safeArray(productsData);

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

// ─────────────────────────────────────────────────────────────────────────────
// 4. FIXED INCOME
// ─────────────────────────────────────────────────────────────────────────────

export const FixedIncome: React.FC = () => {
  const { data: productsData, isLoading } = useInvestmentProducts({ type: "fixed_income" as any });
  const apiProducts: any[] = safeArray(productsData);

  const defaultBonds = [
    { name: "US Treasury 10Y", type: "Government Bond", yield: 4.25, tenure: "10 years", minInvestment: 1000, rating: "AAA", risk: "low" },
    { name: "Nordi Fixed Deposit", type: "Fixed Deposit", yield: 5.1, tenure: "1 year", minInvestment: 500, rating: "AA+", risk: "low" },
    { name: "Corporate Bond Fund", type: "Corporate Bond", yield: 6.8, tenure: "5 years", minInvestment: 5000, rating: "A+", risk: "medium" },
    { name: "Municipal Bond Fund", type: "Municipal Bond", yield: 3.9, tenure: "7 years", minInvestment: 2500, rating: "AA", risk: "low" },
    { name: "High Yield Bond ETF", type: "High Yield Bond", yield: 8.2, tenure: "3 years", minInvestment: 1000, rating: "BBB", risk: "high" },
    { name: "Nordi Recurring Deposit", type: "Recurring Deposit", yield: 5.5, tenure: "2 years", minInvestment: 100, rating: "AA+", risk: "low" },
  ];

  const products = apiProducts.length > 0 ? apiProducts : defaultBonds;

  const [riskFilter, setRiskFilter] = useState("all");

  const filtered = useMemo(
    () =>
      products.filter(
        (p: any) =>
          riskFilter === "all" || (p.risk ?? p.riskLevel ?? "low") === riskFilter
      ),
    [products, riskFilter]
  );

  const ratingColors: Record<string, string> = {
    AAA: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    "AA+": "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    AA: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    "A+": "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    A: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    BBB: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    BB: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
  };

  return (
    <PageContainer>
      <PageHeader
        title="Fixed Income"
        subtitle="Bonds, fixed deposits, and other stable instruments"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Investments", href: "/customer/investments" },
          { label: "Fixed Income" },
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
          {/* ── Filter Pills ───────────────────────────────────────── */}
          <DashCard>
            <div className="flex items-center gap-2 flex-wrap">
              <Shield
                size={14}
                className="text-gray-400 dark:text-gray-500"
              />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mr-1">
                Risk:
              </span>
              {["all", "low", "medium", "high"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium capitalize transition-colors ${
                    riskFilter === r
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {r === "all" ? "All" : r}
                </button>
              ))}
            </div>
          </DashCard>

          {/* ── Bond / FD Cards ────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <EmptyState
              variant="search"
              title="No products found"
              description="Try adjusting your risk filter."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((bond: any, i: number) => {
                const bondRating = bond.rating ?? bond.creditRating ?? "—";
                return (
                  <DashCard key={bond.id ?? bond._id ?? i} hover>
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {bond.name ?? "Fixed Income Product"}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {bond.type ?? bond.category ?? "Bond"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                            ratingColors[bondRating] ??
                            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {bondRating}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 mb-4 flex-1">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <TrendingUp size={12} /> Yield
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {bond.yield ?? bond.interestRate ?? 0}% p.a.
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock size={12} /> Tenure
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {bond.tenure ?? bond.maturityPeriod ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <DollarSign size={12} /> Min Investment
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {fmt(bond.minInvestment ?? bond.minimumInvestment ?? 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Shield size={12} /> Risk
                          </span>
                          <StatusBadge
                            status={bond.risk ?? bond.riskLevel ?? "low"}
                          />
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. MARKET INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export const MarketInsights: React.FC = () => {
  const { data: productsData, isLoading } = useInvestmentProducts();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const defaultInsights = [
    {
      title: "Fed Holds Rates Steady Amid Inflation Concerns",
      summary:
        "The Federal Reserve kept interest rates unchanged at its latest meeting, signaling a cautious approach as inflation remains above target. Markets responded positively with major indices closing higher.",
      category: "Macro Economy",
      date: "2026-02-25",
      source: "Nordi Research",
    },
    {
      title: "Tech Sector Rally: AI Stocks Lead the Charge",
      summary:
        "Technology stocks surged this week, led by strong earnings from AI-focused companies. NVIDIA and Microsoft posted record revenues, driving the Nasdaq to new highs.",
      category: "Equities",
      date: "2026-02-24",
      source: "Market Desk",
    },
    {
      title: "Emerging Market Bonds Offer Attractive Yields",
      summary:
        "With yields in developed markets remaining compressed, emerging market bonds are attracting attention from income-seeking investors. Our analysts recommend selective exposure.",
      category: "Fixed Income",
      date: "2026-02-23",
      source: "Fixed Income Team",
    },
    {
      title: "Gold Prices Hit 6-Month High on Geopolitical Tensions",
      summary:
        "Safe-haven demand pushed gold prices to their highest level in six months. Analysts suggest maintaining a 5-10% portfolio allocation to precious metals as a hedge.",
      category: "Commodities",
      date: "2026-02-22",
      source: "Nordi Research",
    },
    {
      title: "ESG Investing: Green Bonds Outperform in Q1",
      summary:
        "Sustainable investing continues to gain traction as green bonds outperformed traditional corporate bonds in the first quarter. New ESG-focused funds saw record inflows.",
      category: "ESG",
      date: "2026-02-21",
      source: "ESG Desk",
    },
    {
      title: "Real Estate Investment Trusts: A Comeback Story",
      summary:
        "REITs are showing signs of recovery after a challenging period. Commercial real estate fundamentals are improving, with occupancy rates climbing back to pre-pandemic levels.",
      category: "Real Estate",
      date: "2026-02-20",
      source: "Market Desk",
    },
  ];

  const insights = defaultInsights;

  const categories = useMemo(() => {
    const cats = [...new Set(insights.map((a) => a.category))];
    return ["all", ...cats];
  }, [insights]);

  const filtered = useMemo(
    () =>
      selectedCategory === "all"
        ? insights
        : insights.filter((a) => a.category === selectedCategory),
    [insights, selectedCategory]
  );

  const categoryColors: Record<string, string> = {
    "Macro Economy": "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
    Equities: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400",
    "Fixed Income": "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    Commodities: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    ESG: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400",
    "Real Estate": "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400",
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Market Insights"
        subtitle="Stay informed with the latest market analysis"
        icon={<Lightbulb size={20} />}
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Investments", href: "/customer/investments" },
          { label: "Market Insights" },
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
          {/* ── Category Filter ────────────────────────────────────── */}
          <DashCard>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={14} className="text-gray-400 dark:text-gray-500" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium capitalize transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat === "all" ? "All Topics" : cat}
                </button>
              ))}
            </div>
          </DashCard>

          {/* ── Insights Cards ─────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Newspaper size={40} />}
              title="No insights available"
              description="Check back later for the latest market analysis."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((article, i) => (
                <DashCard key={i} hover>
                  <div className="flex flex-col h-full">
                    {/* Category Badge + Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          categoryColors[article.category] ??
                          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {article.category}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <CalendarDays size={10} />
                        {formatDate(article.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                      {article.summary}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                        {article.source}
                      </span>
                      <motion.button
                        className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        Read More <ChevronRight size={12} />
                      </motion.button>
                    </div>
                  </div>
                </DashCard>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};
