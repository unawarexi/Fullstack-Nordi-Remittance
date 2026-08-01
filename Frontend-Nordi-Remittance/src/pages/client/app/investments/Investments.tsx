// ============================================================================
// INVESTMENTS — Main investments dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
  Briefcase,
  Shield,
  Lightbulb,
  Target,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import {
  useClientInvestments,
  useClientPortfolio,
  useClientInvestmentProducts,
} from "../../client-usecase/useinvestments-client-usecase";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  SectionHeader,
  ActionButton,
  ListActionRow,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, listItemRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const Investments: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const toggleShowBalances = useUIStore((s) => s.toggleShowBalances);

  const { investments, isLoading: investmentsLoading } = useClientInvestments();
  const { portfolio, isLoading: portfolioLoading } = useClientPortfolio();
  const { products, isLoading: productsLoading } = useClientInvestmentProducts();

  const isLoading = investmentsLoading || portfolioLoading;

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const totalValue =
    portfolio?.totalValue || investments.reduce((a: number, inv: any) => a + (inv.currentValue || inv.amount || 0), 0);
  const totalReturns = portfolio?.totalReturns || 0;
  const returnPercentage = portfolio?.returnPercentage || 0;

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Investments"
          subtitle="Track and grow your investment portfolio"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Investments" }]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton
                label=""
                icon={showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                variant="secondary"
                onClick={() => toggleShowBalances()}
              />
              <ActionButton
                label="New Investment"
                icon={<Plus size={16} />}
                onClick={() => navigate("/customer/investments/overview")}
              />
            </div>
          }
        />
      </motion.div>

      {/* Portfolio Summary */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label="Portfolio Value"
            value={showBalances ? formatCurrency(totalValue) : "••••••"}
            icon={<Briefcase size={20} />}
            iconColor="from-indigo-500 to-purple-500"
            change={returnPercentage > 0 ? `+${returnPercentage.toFixed(1)}%` : `${returnPercentage.toFixed(1)}%`}
            positive={returnPercentage >= 0}
            index={0}
          />
          <StatCard
            label="Total Returns"
            value={showBalances ? formatCurrency(totalReturns) : "••••••"}
            icon={returnPercentage >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            iconColor={returnPercentage >= 0 ? "from-emerald-500 to-teal-500" : "from-rose-500 to-pink-500"}
            index={1}
          />
          <StatCard
            label="Active Investments"
            value={investments.length}
            icon={<PieChart size={20} />}
            iconColor="from-amber-500 to-orange-500"
            index={2}
          />
          <StatCard
            label="Products Available"
            value={products.length || "12"}
            icon={<Target size={20} />}
            iconColor="from-violet-500 to-purple-500"
            index={3}
          />
        </StatsGrid>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Investment Holdings */}
        <motion.div className="lg:col-span-2" variants={dashboardItemVariants}>
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : investments.length === 0 ? (
            <EmptyState
              title="No Investments Yet"
              description="Start building your portfolio with our curated investment products."
              action={{ label: "Explore Products", onClick: () => navigate("/customer/investments/mutual-funds") }}
            />
          ) : (
            <DashCard padding="none">
              <div className="flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-800 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Holdings</h3>
                <motion.button
                  onClick={() => navigate("/customer/investments/overview")}
                  className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-xs"
                  whileHover={{ x: 2 }}
                >
                  View All <ChevronRight size={14} />
                </motion.button>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {investments.slice(0, 6).map((inv: any, i: number) => {
                  const returnPct = inv.returnPercentage || inv.returns || 0;
                  const isPositive = returnPct >= 0;

                  return (
                    <motion.div
                      key={inv._id || inv.id || i}
                      className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-4 sm:p-4"
                      custom={i}
                      variants={listItemRevealVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => navigate("/customer/investments/overview")}
                    >
                      <div
                        className={`rounded-xl p-2 sm:p-2.5 ${isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"}`}
                      >
                        {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {inv.name || inv.productName || "Investment"}
                        </h4>
                        <p className="text-[10px] capitalize text-gray-500 dark:text-gray-400 sm:text-xs">
                          {inv.type || inv.category || "Mutual Fund"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                          {showBalances ? formatCurrency(inv.currentValue || inv.amount || 0) : "••••••"}
                        </p>
                        <p
                          className={`text-[10px] font-medium sm:text-xs ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                        >
                          {isPositive ? "+" : ""}
                          {returnPct.toFixed(2)}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </DashCard>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div className="space-y-3 sm:space-y-4" variants={dashboardItemVariants}>
          {/* Investment Categories */}
          <DashCard>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-base">Explore</h3>
            <div className="space-y-1.5 sm:space-y-2">
              {[
                {
                  label: "Mutual Funds",
                  desc: "Diversified portfolios",
                  icon: <PieChart size={16} />,
                  route: "/customer/investments/mutual-funds",
                  color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
                },
                {
                  label: "Stocks & ETFs",
                  desc: "Trade equities",
                  icon: <BarChart3 size={16} />,
                  route: "/customer/investments/stocks",
                  color: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Fixed Income",
                  desc: "Bonds & treasuries",
                  icon: <Shield size={16} />,
                  route: "/customer/investments/fixed-income",
                  color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Market Insights",
                  desc: "Analysis & research",
                  icon: <Lightbulb size={16} />,
                  route: "/customer/investments/insights",
                  color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
                },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-3 sm:p-3"
                  whileHover={{ x: 3 }}
                >
                  <div className={`rounded-lg p-1.5 sm:p-2 ${item.color}`}>{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{item.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
                </motion.button>
              ))}
            </div>
          </DashCard>

          {/* CTA */}
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white sm:p-5">
            <h3 className="mb-1.5 text-sm font-semibold sm:mb-2 sm:text-base">Start Investing</h3>
            <p className="mb-3 text-[10px] text-indigo-200 sm:mb-4 sm:text-sm">
              Grow your wealth with as little as $10. Diversified portfolios managed by experts.
            </p>
            <motion.button
              onClick={() => navigate("/customer/investments/overview")}
              className="w-full rounded-lg bg-white py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50 sm:py-2.5 sm:text-sm"
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default Investments;
