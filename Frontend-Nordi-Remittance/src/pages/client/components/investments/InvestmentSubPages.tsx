// ============================================================================
// INVESTMENT SUB-PAGES — Overview, Mutual Funds, Stocks, Fixed Income, Insights
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, PieChart, BarChart3, DollarSign,
  Layers, ArrowUpRight, ArrowDownRight, Shield, Clock,
  ChevronRight, Plus, Search, Filter, Globe, Lightbulb,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton, ChartSkeleton } from "@components/skeletons";
import { useInvestments, useInvestmentProducts, useInvestmentPortfolio, useInvestmentPerformance } from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// ========================
// INVESTMENT OVERVIEW
// ========================
export const InvestmentOverview: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: portfolioData, isLoading: pLoading } = useInvestmentPortfolio();
  const { data: invData, isLoading: iLoading } = useInvestments();
  const portfolio = portfolioData?.data;
  const investments = invData?.data || [];
  const isLoading = pLoading || iLoading;

  const stats = [
    { label: "Total Portfolio", value: show ? fmt(portfolio?.totalValue || 0) : "••••••", icon: <PieChart size={18} />, color: "from-indigo-500 to-purple-500" },
    { label: "Total Returns", value: show ? fmt(portfolio?.totalReturns || 0) : "••••••", icon: <TrendingUp size={18} />, color: "from-emerald-500 to-teal-500" },
    { label: "Today's Change", value: show ? pct(portfolio?.dailyChangePercent || 1.23) : "••", icon: <BarChart3 size={18} />, color: "from-blue-500 to-cyan-500" },
    { label: "Holdings", value: String(investments.length), icon: <Layers size={18} />, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Investment Overview" subtitle="Track your portfolio performance"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments", href: "/customer/investments" }, { label: "Overview" }]}
          actions={<motion.button onClick={() => navigate("/customer/investments/mutual-funds")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} /> Invest</motion.button>} />
      </motion.div>

      {isLoading ? <StatsGridSkeleton count={4} /> : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={containerVariants}>
          {stats.map((s) => (
            <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white`}>{s.icon}</div>
              </div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-indigo-900">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
        <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Holdings</h3></div>
        {investments.length === 0 ? (
          <div className="p-8"><EmptyState title="No investments" description="Start building your portfolio today." action={{ label: "Explore", onClick: () => navigate("/customer/investments/mutual-funds") }} /></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {investments.map((inv: any, i: number) => {
              const ret = inv.returnPercentage || inv.returns || 0;
              const positive = ret >= 0;
              return (
                <div key={inv._id || i} className="p-4 flex items-center justify-between hover:bg-indigo-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.name || inv.productName || "Investment"}</p>
                      <p className="text-xs text-gray-500 capitalize">{inv.type || inv.category || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-indigo-900">{show ? fmt(inv.currentValue || inv.amount || 0) : "••••••"}</p>
                    <p className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>{pct(ret)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ========================
// MUTUAL FUNDS
// ========================
export const MutualFunds: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useInvestmentProducts();
  const allProducts = (data as any)?.data ? (data as any).data : data || [];
  const products = allProducts.filter((p: any) => p.type === "mutual_fund" || p.category === "mutual_funds");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const defaultFunds = [
    { name: "Nordi Growth Fund", category: "Equity", risk: "high", returns: 14.5, minInvestment: 500, nav: 45.32 },
    { name: "Nordi Balanced Fund", category: "Hybrid", risk: "medium", returns: 9.8, minInvestment: 1000, nav: 28.67 },
    { name: "Nordi Income Fund", category: "Debt", risk: "low", returns: 6.2, minInvestment: 250, nav: 15.44 },
    { name: "Nordi Index Fund", category: "Index", risk: "medium", returns: 12.1, minInvestment: 100, nav: 120.89 },
    { name: "Nordi Small Cap", category: "Equity", risk: "high", returns: 18.3, minInvestment: 2000, nav: 62.15 },
    { name: "Nordi Liquid Fund", category: "Debt", risk: "low", returns: 4.5, minInvestment: 100, nav: 10.02 },
  ];

  const display = products.length > 0 ? products : defaultFunds;
  const filtered = display.filter((f: any) => (riskFilter === "all" || f.risk === riskFilter) && (!search || (f.name || "").toLowerCase().includes(search.toLowerCase())));

  const riskColors: Record<string, string> = { low: "bg-emerald-50 text-emerald-700", medium: "bg-amber-50 text-amber-700", high: "bg-rose-50 text-rose-700" };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Mutual Funds" subtitle="Explore and invest in mutual funds"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments", href: "/customer/investments" }, { label: "Mutual Funds" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center gap-3" variants={itemVariants}>
        <div className="relative flex-1 w-full"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search funds..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
        <div className="flex gap-2">
          {["all", "low", "medium", "high"].map((r) => (
            <button key={r} onClick={() => setRiskFilter(r)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${riskFilter === r ? "bg-indigo-100 text-indigo-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>{r === "all" ? "All Risk" : r}</button>
          ))}
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants}>
        {filtered.map((fund: any, i: number) => (
          <motion.div key={i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" variants={itemVariants} whileHover={{ y: -3 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">{fund.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[fund.risk] || riskColors.medium}`}>{fund.risk}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{fund.category}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Returns</p><p className="text-sm font-bold text-emerald-600">+{fund.returns}%</p></div>
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">NAV</p><p className="text-sm font-bold text-gray-900">${fund.nav}</p></div>
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Min</p><p className="text-sm font-bold text-gray-900">${fund.minInvestment}</p></div>
            </div>
            <motion.button className="w-full mt-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>Invest Now</motion.button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// STOCKS & ETFs
// ========================
export const StocksETFs: React.FC = () => {
  const [search, setSearch] = useState("");

  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 189.25, change: 2.34, pctChange: 1.25, volume: "52.3M" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change: -0.95, pctChange: -0.67, volume: "28.1M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 374.58, change: 4.12, pctChange: 1.11, volume: "31.7M" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 1.56, pctChange: 0.88, volume: "45.9M" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -3.21, pctChange: -1.28, volume: "89.4M" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 495.22, change: 12.45, pctChange: 2.58, volume: "62.1M" },
    { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 454.32, change: 2.18, pctChange: 0.48, volume: "73.2M" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", price: 387.65, change: 3.42, pctChange: 0.89, volume: "41.5M" },
  ];

  const filtered = stocks.filter((s) => !search || s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Stocks & ETFs" subtitle="Trade stocks and exchange-traded funds"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments", href: "/customer/investments" }, { label: "Stocks & ETFs" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6" variants={itemVariants}>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search stocks or ETFs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
        <table className="w-full">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 p-4">Symbol</th>
            <th className="text-left text-xs font-medium text-gray-500 p-4">Name</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Price</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Change</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Volume</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s) => {
              const up = s.change >= 0;
              return (
                <tr key={s.symbol} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-indigo-900">{s.symbol}</td>
                  <td className="p-4 text-sm text-gray-600">{s.name}</td>
                  <td className="p-4 text-sm font-semibold text-gray-900 text-right">${s.price.toFixed(2)}</td>
                  <td className={`p-4 text-sm font-medium text-right ${up ? "text-emerald-600" : "text-rose-600"}`}>
                    <span className="flex items-center justify-end gap-1">{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {pct(s.pctChange)}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 text-right">{s.volume}</td>
                  <td className="p-4 text-right"><button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">Trade</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

// ========================
// FIXED INCOME
// ========================
export const FixedIncome: React.FC = () => {
  const bonds = [
    { name: "US Treasury 5Y", type: "Government", yield: 4.25, maturity: "2028-12-15", rating: "AAA", minInvestment: 1000 },
    { name: "Corporate Bond AAA", type: "Corporate", yield: 5.10, maturity: "2026-06-30", rating: "AAA", minInvestment: 5000 },
    { name: "Municipal Bond", type: "Municipal", yield: 3.80, maturity: "2029-03-15", rating: "AA+", minInvestment: 2500 },
    { name: "High Yield Bond", type: "Corporate", yield: 7.25, maturity: "2025-09-01", rating: "BB+", minInvestment: 10000 },
    { name: "Treasury Bill 1Y", type: "Government", yield: 5.35, maturity: "2025-01-15", rating: "AAA", minInvestment: 100 },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Fixed Income" subtitle="Bonds, treasuries and fixed-return instruments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments", href: "/customer/investments" }, { label: "Fixed Income" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" variants={containerVariants}>
        {[
          { label: "Avg. Yield", value: "5.15%", icon: <TrendingUp size={18} />, color: "from-emerald-500 to-teal-500" },
          { label: "Total Invested", value: "$0.00", icon: <DollarSign size={18} />, color: "from-indigo-500 to-purple-500" },
          { label: "Products", value: String(bonds.length), icon: <Layers size={18} />, color: "from-blue-500 to-cyan-500" },
        ].map((s) => (
          <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white mb-3`}>{s.icon}</div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-indigo-900">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
        <table className="w-full">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 p-4">Bond</th>
            <th className="text-left text-xs font-medium text-gray-500 p-4">Type</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Yield</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Rating</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Maturity</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {bonds.map((b, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-4"><p className="text-sm font-medium text-gray-900">{b.name}</p><p className="text-xs text-gray-500">Min: ${b.minInvestment.toLocaleString()}</p></td>
                <td className="p-4 text-sm text-gray-600">{b.type}</td>
                <td className="p-4 text-sm font-bold text-emerald-600 text-right">{b.yield}%</td>
                <td className="p-4 text-right"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{b.rating}</span></td>
                <td className="p-4 text-sm text-gray-500 text-right">{new Date(b.maturity).toLocaleDateString()}</td>
                <td className="p-4 text-right"><button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">Invest</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

// ========================
// MARKET INSIGHTS
// ========================
export const MarketInsights: React.FC = () => {
  const insights = [
    { title: "Market Rally Continues", summary: "Global markets surge as inflation data shows cooling trend", category: "Market Update", date: "2 hours ago", sentiment: "bullish" },
    { title: "Tech Sector Outlook Q4", summary: "AI-driven growth expected to accelerate through year end", category: "Sector Analysis", date: "5 hours ago", sentiment: "bullish" },
    { title: "Fed Rate Decision Preview", summary: "Markets expect pause in rate hikes at upcoming meeting", category: "Macro", date: "1 day ago", sentiment: "neutral" },
    { title: "Emerging Markets Update", summary: "Southeast Asian economies show strong growth momentum", category: "Global", date: "1 day ago", sentiment: "bullish" },
    { title: "Bond Market Analysis", summary: "Yield curve normalization signals economic stabilization", category: "Fixed Income", date: "2 days ago", sentiment: "neutral" },
    { title: "Crypto Market Volatility", summary: "Bitcoin tests resistance levels amid regulatory discussions", category: "Digital Assets", date: "2 days ago", sentiment: "bearish" },
  ];

  const sentimentColors: Record<string, { text: string; bg: string }> = {
    bullish: { text: "text-emerald-700", bg: "bg-emerald-50" }, bearish: { text: "text-rose-700", bg: "bg-rose-50" }, neutral: { text: "text-gray-700", bg: "bg-gray-100" },
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Market Insights" subtitle="Latest market analysis and research"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments", href: "/customer/investments" }, { label: "Insights" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
        {insights.map((item, i) => {
          const sC = sentimentColors[item.sentiment] || sentimentColors.neutral;
          return (
            <motion.div key={i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" variants={itemVariants} whileHover={{ y: -2 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{item.category}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sC.text} ${sC.bg}`}>{item.sentiment}</span>
                <span className="text-xs text-gray-400 ml-auto">{item.date}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.summary}</p>
              <button className="mt-3 text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">Read more <ChevronRight size={14} /></button>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
