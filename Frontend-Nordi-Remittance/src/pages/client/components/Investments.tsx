// ============================================================================
// INVESTMENTS — Main investments dashboard
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  PieChart,
  BarChart3,
  DollarSign,
  Percent,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Shield,
  Lightbulb,
  Target,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@components/skeletons";
import {
  useInvestments,
  useInvestmentPortfolio,
  useInvestmentProducts,
} from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Investments: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const toggleShowBalances = useUIStore((s) => s.toggleShowBalances);

  const { data: investmentsData, isLoading: investmentsLoading } = useInvestments();
  const { data: portfolioData, isLoading: portfolioLoading } = useInvestmentPortfolio();
  const { data: productsData, isLoading: productsLoading } = useInvestmentProducts();

  const investments = (investmentsData as any)?.data ? (investmentsData as any).data : investmentsData || [];
  const portfolio = (portfolioData as any)?.data ? (portfolioData as any).data : portfolioData;
  const products = (productsData as any)?.data ? (productsData as any).data : productsData || [];

  const isLoading = investmentsLoading || portfolioLoading;

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const totalValue = portfolio?.totalValue || investments.reduce((a: number, inv: any) => a + (inv.currentValue || inv.amount || 0), 0);
  const totalReturns = portfolio?.totalReturns || 0;
  const returnPercentage = portfolio?.returnPercentage || 0;

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Investments"
          subtitle="Track and grow your investment portfolio"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Investments" },
          ]}
          actions={
            <div className="flex gap-3">
              <motion.button
                onClick={() => toggleShowBalances()}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/customer/investments/overview")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                New Investment
              </motion.button>
            </div>
          }
        />
      </motion.div>

      {/* Portfolio Summary */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={itemVariants}>
          {[
            {
              label: "Portfolio Value",
              value: showBalances ? formatCurrency(totalValue) : "••••••",
              icon: <Briefcase size={20} />,
              color: "from-indigo-500 to-purple-500",
              change: returnPercentage > 0 ? `+${returnPercentage.toFixed(1)}%` : `${returnPercentage.toFixed(1)}%`,
              positive: returnPercentage >= 0,
            },
            {
              label: "Total Returns",
              value: showBalances ? formatCurrency(totalReturns) : "••••••",
              icon: returnPercentage >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
              color: returnPercentage >= 0 ? "from-emerald-500 to-teal-500" : "from-rose-500 to-pink-500",
              change: "",
              positive: returnPercentage >= 0,
            },
            {
              label: "Active Investments",
              value: String(investments.length),
              icon: <PieChart size={20} />,
              color: "from-amber-500 to-orange-500",
              change: "",
              positive: true,
            },
            {
              label: "Products Available",
              value: String(products.length || "12"),
              icon: <Target size={20} />,
              color: "from-violet-500 to-purple-500",
              change: "",
              positive: true,
            },
          ].map((stat) => (
            <motion.div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" whileHover={{ y: -2 }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
                {stat.change && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Holdings */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : investments.length === 0 ? (
            <EmptyState
              title="No Investments Yet"
              description="Start building your portfolio with our curated investment products."
              action={{
                label: "Explore Products",
                onClick: () => navigate("/customer/investments/mutual-funds"),
              }}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-indigo-900">Holdings</h3>
                <motion.button
                  onClick={() => navigate("/customer/investments/overview")}
                  className="text-sm text-indigo-600 font-medium flex items-center gap-1"
                  whileHover={{ x: 2 }}
                >
                  View All <ChevronRight size={14} />
                </motion.button>
              </div>

              <div className="divide-y divide-gray-50">
                {investments.slice(0, 6).map((inv: any, i: number) => {
                  const returnPct = inv.returnPercentage || inv.returns || 0;
                  const isPositive = returnPct >= 0;

                  return (
                    <motion.div
                      key={inv._id || inv.id || i}
                      className="flex items-center gap-4 p-4 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                      whileHover={{ x: 3 }}
                      onClick={() => navigate("/customer/investments/overview")}
                    >
                      <div className={`p-2.5 rounded-xl ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {inv.name || inv.productName || "Investment"}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {inv.type || inv.category || "Mutual Fund"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-indigo-900">
                          {showBalances ? formatCurrency(inv.currentValue || inv.amount || 0) : "••••••"}
                        </p>
                        <p className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? "+" : ""}{returnPct.toFixed(2)}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div className="space-y-4" variants={itemVariants}>
          {/* Investment Categories */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-indigo-900 mb-4">Explore</h3>
            <div className="space-y-2">
              {[
                { label: "Mutual Funds", desc: "Diversified portfolios", icon: <PieChart size={16} />, route: "/customer/investments/mutual-funds", color: "bg-indigo-50 text-indigo-600" },
                { label: "Stocks & ETFs", desc: "Trade equities", icon: <BarChart3 size={16} />, route: "/customer/investments/stocks", color: "bg-emerald-50 text-emerald-600" },
                { label: "Fixed Income", desc: "Bonds & treasuries", icon: <Shield size={16} />, route: "/customer/investments/fixed-income", color: "bg-amber-50 text-amber-600" },
                { label: "Market Insights", desc: "Analysis & research", icon: <Lightbulb size={16} />, route: "/customer/investments/insights", color: "bg-purple-50 text-purple-600" },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50/50 transition-colors text-left"
                  whileHover={{ x: 3 }}
                >
                  <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2">Start Investing</h3>
            <p className="text-sm text-indigo-200 mb-4">
              Grow your wealth with as little as $10. Diversified portfolios managed by experts.
            </p>
            <motion.button
              onClick={() => navigate("/customer/investments/overview")}
              className="w-full py-2.5 bg-white text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Investments;
