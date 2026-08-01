// ============================================================================
// SAVING GOALS — Savings goals dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Calendar,
  Zap,
  BarChart3,
  Star,
  Sparkles,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, AccountListSkeleton } from "@components/skeletons";
import { useClientSavingsGoals } from "../../client-usecase/usesavinga-client-usecase";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  ActionButton,
  QuickLinkCard,
  QuickLinksGrid,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const goalColors = [
  {
    gradient: "from-indigo-500 to-purple-600",
    light: "bg-indigo-50 dark:bg-indigo-950/50",
    text: "text-indigo-600 dark:text-indigo-400",
    bar: "from-indigo-500 to-purple-500",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "from-emerald-500 to-teal-500",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    light: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-600 dark:text-amber-400",
    bar: "from-amber-500 to-orange-500",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    light: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-600 dark:text-rose-400",
    bar: "from-rose-500 to-pink-500",
  },
  {
    gradient: "from-blue-500 to-cyan-600",
    light: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-600 dark:text-blue-400",
    bar: "from-blue-500 to-cyan-500",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    light: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-600 dark:text-violet-400",
    bar: "from-violet-500 to-purple-500",
  },
];

const SavingGoals: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);

  const { goals, isLoading } = useClientSavingsGoals();

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const totalSaved = goals.reduce((a: number, g: any) => a + (g.currentAmount || g.saved || 0), 0);
  const totalTarget = goals.reduce((a: number, g: any) => a + (g.targetAmount || g.target || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Goals"
          subtitle="Set goals, save automatically, and track your progress"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Savings Goals" }]}
          actions={
            <ActionButton
              label="New Goal"
              icon={<Plus size={16} />}
              onClick={() => navigate("/customer/savings/create")}
            />
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label="Total Saved"
            value={showBalances ? formatCurrency(totalSaved) : "••••••"}
            icon={<PiggyBank size={20} />}
            iconColor="from-indigo-500 to-purple-500"
            index={0}
          />
          <StatCard
            label="Target Amount"
            value={showBalances ? formatCurrency(totalTarget) : "••••••"}
            icon={<Target size={20} />}
            iconColor="from-emerald-500 to-teal-500"
            index={1}
          />
          <StatCard
            label="Active Goals"
            value={goals.length}
            icon={<Star size={20} />}
            iconColor="from-amber-500 to-orange-500"
            index={2}
          />
          <StatCard
            label="Overall Progress"
            value={`${overallProgress.toFixed(0)}%`}
            icon={<TrendingUp size={20} />}
            iconColor="from-violet-500 to-purple-500"
            index={3}
          />
        </StatsGrid>
      )}

      {/* Goals List */}
      {isLoading ? (
        <AccountListSkeleton count={4} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No Savings Goals Yet"
          description="Create your first savings goal and start building towards your dreams."
          action={{ label: "Create Goal", onClick: () => navigate("/customer/savings/create") }}
        />
      ) : (
        <motion.div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-5 md:grid-cols-2">
          {goals.map((goal: any, index: number) => {
            const colorSet = goalColors[index % goalColors.length];
            const saved = goal.currentAmount || goal.saved || 0;
            const target = goal.targetAmount || goal.target || 1;
            const progress = Math.min((saved / target) * 100, 100);
            const daysLeft = goal.daysRemaining || goal.daysLeft;

            return (
              <motion.div
                key={goal._id || goal.id || index}
                custom={index}
                variants={cardRevealVariants}
                initial="hidden"
                animate="visible"
              >
                <DashCard
                  padding="none"
                  className="cursor-pointer overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                  hover
                >
                  <div className={`h-1.5 bg-gradient-to-r ${colorSet.gradient}`} />
                  <div className="p-4 sm:p-5" onClick={() => navigate("/customer/savings/goals")}>
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`rounded-xl p-2 sm:p-2.5 ${colorSet.light} ${colorSet.text}`}>
                          {goal.icon ? (
                            <span className="text-lg sm:text-xl">{goal.icon}</span>
                          ) : (
                            <PiggyBank size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                            {goal.name || goal.title || "Savings Goal"}
                          </h3>
                          {daysLeft && (
                            <p className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                              <Calendar size={10} />
                              {daysLeft} days left
                            </p>
                          )}
                        </div>
                      </div>
                      {progress >= 100 && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 sm:px-2.5 sm:py-1 sm:text-xs">
                          <Sparkles size={10} /> Complete
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="mb-1.5 flex justify-between text-xs sm:text-sm">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {showBalances ? formatCurrency(saved) : "••••••"}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          of {showBalances ? formatCurrency(target) : "••••••"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 sm:h-2.5">
                        <motion.div
                          className={`bg-gradient-to-r ${colorSet.bar} h-2 rounded-full sm:h-2.5`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        {progress.toFixed(0)}% achieved
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-1.5 text-[10px] font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/80 sm:py-2 sm:text-xs"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/customer/savings/goals");
                        }}
                      >
                        <DollarSign size={12} />
                        Add Funds
                      </motion.button>
                      <motion.button
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-50 py-1.5 text-[10px] font-medium text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-950/80 sm:py-2 sm:text-xs"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/customer/savings/analytics");
                        }}
                      >
                        <BarChart3 size={12} />
                        Analytics
                      </motion.button>
                    </div>
                  </div>
                </DashCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Quick Links */}
      <QuickLinksGrid>
        <QuickLinkCard
          label="My Goals"
          icon={<Target size={20} />}
          route="/customer/savings/goals"
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <QuickLinkCard
          label="Create Goal"
          icon={<Plus size={20} />}
          route="/customer/savings/create"
          iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <QuickLinkCard
          label="Auto-Save"
          icon={<Zap size={20} />}
          route="/customer/savings/auto-save"
          iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
        />
        <QuickLinkCard
          label="Analytics"
          icon={<BarChart3 size={20} />}
          route="/customer/savings/analytics"
          iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50"
        />
      </QuickLinksGrid>
    </PageContainer>
  );
};

export default SavingGoals;
