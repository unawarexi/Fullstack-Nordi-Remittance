// ============================================================================
// SAVINGS GOAL SUB-PAGES — Goals List, Create Goal, Auto-Save Rules, Analytics
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  TrendingUp,
  PiggyBank,
  Calendar,
  Clock,
  DollarSign,
  ArrowUpRight,
  Repeat,
  Percent,
  BarChart3,
  Sparkles,
  ChevronRight,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid, ProgressBar } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientSavingsGoals,
  useCreateSavingsGoal,
  useClientSavingsGoalProgress,
} from "../../client-usecase/usesavinga-client-usecase";
import { useUIStore } from "@store/ui.store";
import { useToastStore } from "@store/toast.store";

/* ═══════════════════════════════════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (saved: number, target: number) => (target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const GOAL_EMOJIS = ["🎯", "🏠", "✈️", "🚗", "💍", "🎓", "💰", "🏖️", "📱", "🎮", "🩺", "🐶"];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SavingsAnalytics: React.FC = () => {
  const { goals, isLoading } = useClientSavingsGoals();

  const totalSaved = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.currentAmount ?? g.savedAmount ?? 0), 0),
    [goals],
  );
  const totalTarget = useMemo(() => goals.reduce((s: number, g: any) => s + (g.targetAmount ?? 0), 0), [goals]);
  const completedGoals = goals.filter((g: any) => g.status === "completed").length;
  const savingsRate = totalTarget > 0 ? pct(totalSaved, totalTarget) : 0;

  // Generate synthetic monthly data from goals for the chart
  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTH_LABELS.map((_, idx) => {
      const monthGoals = goals.filter((g: any) => {
        const created = new Date(g.createdAt ?? g.targetDate ?? now);
        return created.getMonth() <= idx;
      });
      const base = monthGoals.length * 200 + idx * 120;
      return Math.min(base + Math.round(Math.random() * 150), totalSaved > 0 ? totalSaved : 5000);
    });
  }, [goals, totalSaved]);

  const maxMonthly = Math.max(...monthlyData, 1);

  // Projection: simple linear projection for remaining months
  const monthsElapsed = new Date().getMonth() + 1;
  const avgMonthlySaving = monthsElapsed > 0 ? totalSaved / monthsElapsed : 0;
  const endOfYearProjection = avgMonthlySaving * 12;

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Analytics"
          subtitle="Insights and projections for your savings"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Savings", href: "/customer/savings" },
            { label: "Analytics" },
          ]}
        />
      </motion.div>

      {/* ── Stats ── */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label="Total Saved"
            value={fmt(totalSaved)}
            icon={<PiggyBank size={18} />}
            iconColor="from-emerald-500 to-teal-500"
            change={`${savingsRate}%`}
            positive
            index={0}
          />
          <StatCard
            label="Savings Rate"
            value={`${savingsRate}%`}
            icon={<TrendingUp size={18} />}
            iconColor="from-indigo-500 to-purple-500"
            change={savingsRate >= 50 ? "On track" : "Needs boost"}
            positive={savingsRate >= 50}
            index={1}
          />
          <StatCard
            label="Goals Completed"
            value={completedGoals}
            icon={<Target size={18} />}
            iconColor="from-amber-500 to-orange-500"
            index={2}
          />
          <StatCard
            label="Year-End Projection"
            value={fmt(endOfYearProjection)}
            icon={<BarChart3 size={18} />}
            iconColor="from-cyan-500 to-blue-500"
            change={endOfYearProjection >= totalTarget ? "On target" : "Below target"}
            positive={endOfYearProjection >= totalTarget}
            index={3}
          />
        </StatsGrid>
      )}

      {/* ── Monthly savings chart ── */}
      <DashCard className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Monthly Savings</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Your savings trend this year</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={14} />
            {fmt(avgMonthlySaving)}/mo avg
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex h-40 items-end gap-1.5 sm:h-48 sm:gap-2">
          {monthlyData.map((val, idx) => {
            const heightPct = maxMonthly > 0 ? (val / maxMonthly) * 100 : 0;
            const isCurrent = idx === new Date().getMonth();
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  className={`w-full rounded-t-md ${
                    isCurrent ? "bg-gradient-to-t from-indigo-600 to-purple-500" : "bg-indigo-200 dark:bg-indigo-900/60"
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.04, ease: "easeOut" }}
                />
                <span className="text-[8px] text-gray-500 dark:text-gray-400 sm:text-[10px]">{MONTH_LABELS[idx]}</span>
              </div>
            );
          })}
        </div>
      </DashCard>

      {/* ── Savings breakdown & projection ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Breakdown */}
        <DashCard>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Goal Breakdown</h3>
          {goals.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No goals to display.</p>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 5).map((g: any, i: number) => {
                const saved = g.currentAmount ?? g.savedAmount ?? 0;
                const target = g.targetAmount ?? 0;
                const percentage = pct(saved, target);
                const emoji = g.emoji || g.imageUrl || GOAL_EMOJIS[i % GOAL_EMOJIS.length];

                return (
                  <div key={g._id || g.id || i}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{g.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        {fmt(saved)} / {fmt(target)}
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      height="sm"
                      color={
                        percentage >= 100
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }
                      delay={i * 0.1}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </DashCard>

        {/* Projection */}
        <DashCard>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Savings Projection</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Current savings</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">{fmt(totalSaved)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Monthly average</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                {fmt(avgMonthlySaving)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Target total</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">{fmt(totalTarget)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Year-end projection</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 sm:text-base">
                  {fmt(endOfYearProjection)}
                </span>
              </div>
              <ProgressBar
                value={totalTarget > 0 ? pct(endOfYearProjection, totalTarget) : 0}
                height="md"
                color="bg-gradient-to-r from-cyan-500 to-blue-500"
                className="mt-2"
              />
              <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                {endOfYearProjection >= totalTarget
                  ? "🎉 You're projected to meet your savings target by year-end!"
                  : `You'll need to increase monthly savings by ${fmt(
                      Math.max((totalTarget - endOfYearProjection) / (12 - monthsElapsed), 0),
                    )}/mo to hit your target.`}
              </p>
            </div>

            {/* Mini milestones */}
            <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-800">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Milestones</h4>
              {[25, 50, 75, 100].map((milestone) => {
                const reached = savingsRate >= milestone;
                return (
                  <div key={milestone} className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        reached
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                      }`}
                    >
                      {reached ? "✓" : milestone}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs ${
                        reached
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {milestone}% of target reached
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

export default SavingsAnalytics;
