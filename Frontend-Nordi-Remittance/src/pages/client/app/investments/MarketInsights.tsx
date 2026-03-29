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


const MarketInsights: React.FC = () => {
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

export default MarketInsights;
