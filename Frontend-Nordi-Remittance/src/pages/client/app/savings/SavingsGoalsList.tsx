// ============================================================================
// SAVINGS GOAL SUB-PAGES — Goals List, Create Goal, Auto-Save Rules, Analytics
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target, Plus, TrendingUp, PiggyBank, Calendar, Clock,
  DollarSign, ArrowUpRight, Repeat, Percent, BarChart3,
  Sparkles, ChevronRight, Trash2, Edit3, ToggleLeft, ToggleRight,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientSavingsGoals, useCreateSavingsGoal, useClientSavingsGoalProgress,
} from "../../domain/useSavingsDomain";
import { useUIStore } from "@store/ui.store";
import { useToastStore } from "@store/toast.store";

/* ═══════════════════════════════════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (saved: number, target: number) =>
  target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

const labelCls =
  "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const GOAL_EMOJIS = ["🎯", "🏠", "✈️", "🚗", "💍", "🎓", "💰", "🏖️", "📱", "🎮", "🩺", "🐶"];

/* ═══════════════════════════════════════════════════════════════════════════
   1. SAVINGS GOALS LIST
   ═══════════════════════════════════════════════════════════════════════════ */

const SavingsGoalsList: React.FC = () => {
  const { goals, isLoading } = useClientSavingsGoals();

  const totalSaved = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.currentAmount ?? g.savedAmount ?? 0), 0),
    [goals],
  );
  const totalTarget = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.targetAmount ?? 0), 0),
    [goals],
  );
  const activeGoals = goals.filter((g: any) => g.status !== "completed" && g.status !== "cancelled").length;
  const monthlySaving = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.monthlyContribution ?? g.autoSave?.amount ?? 0), 0),
    [goals],
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Goals"
          subtitle="Track your progress toward every financial goal"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Savings", href: "/customer/savings" },
            { label: "Goals" },
          ]}
        />
      </motion.div>

      {/* ── Stats ── */}
      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard
            label="Total Saved"
            value={fmt(totalSaved)}
            icon={<PiggyBank size={18} />}
            iconColor="from-emerald-500 to-teal-500"
            change={totalTarget > 0 ? `${pct(totalSaved, totalTarget)}% of target` : undefined}
            positive
            index={0}
          />
          <StatCard
            label="Active Goals"
            value={activeGoals}
            icon={<Target size={18} />}
            iconColor="from-indigo-500 to-purple-500"
            index={1}
          />
          <StatCard
            label="Monthly Saving"
            value={fmt(monthlySaving)}
            icon={<Repeat size={18} />}
            iconColor="from-amber-500 to-orange-500"
            index={2}
          />
        </StatsGrid>
      )}

      {/* ── Goal cards ── */}
      {isLoading ? (
        <AccountListSkeleton count={4} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No Savings Goals"
          description="Create your first goal to start saving smarter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g: any, i: number) => {
            const saved = g.currentAmount ?? g.savedAmount ?? 0;
            const target = g.targetAmount ?? 0;
            const percentage = pct(saved, target);
            const emoji = g.emoji || g.imageUrl || GOAL_EMOJIS[i % GOAL_EMOJIS.length];

            return (
              <motion.div key={g._id || g.id || i} variants={dashboardItemVariants}>
                <DashCard className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {g.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {g.category || "General"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
                        percentage >= 100
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <ProgressBar
                    value={percentage}
                    height="md"
                    color={
                      percentage >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }
                  />

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {fmt(saved)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      of {fmt(target)}
                    </p>
                  </div>

                  {g.targetDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>
                        Target:{" "}
                        {new Date(g.targetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </DashCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default SavingsGoalsList;
