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
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useSavingsGoals, useCreateSavingsGoal, useSavingsGoalProgress,
} from "@hooks/queries/useInvestments";
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
export const SavingsGoalsList: React.FC = () => {
  const { data: gData, isLoading } = useSavingsGoals();
  const goals = (gData as any)?.data ?? gData ?? [];

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

/* ═══════════════════════════════════════════════════════════════════════════
   2. CREATE GOAL
   ═══════════════════════════════════════════════════════════════════════════ */
export const CreateGoal: React.FC = () => {
  const createMutation = useCreateSavingsGoal();
  const { showToast } = useToastStore();

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    emoji: "🎯",
    monthlyContribution: "",
    category: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) {
      showToast("Goal name and target amount are required", "error");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        targetDate: form.targetDate || new Date(Date.now() + 365 * 86400000).toISOString(),
        accountId: "" as any,
        category: form.category || undefined,
        imageUrl: form.emoji,
        autoSave: form.monthlyContribution
          ? { enabled: true, amount: Number(form.monthlyContribution), frequency: "monthly" }
          : undefined,
      });
      showToast("Savings goal created!", "success");
      setForm({ name: "", targetAmount: "", targetDate: "", emoji: "🎯", monthlyContribution: "", category: "" });
    } catch {
      showToast("Failed to create savings goal", "error");
    }
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Create Savings Goal"
          subtitle="Set a new financial target and start saving"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Savings", href: "/customer/savings" },
            { label: "Create Goal" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emoji selector */}
            <div>
              <label className={labelCls}>Goal Icon</label>
              <div className="flex flex-wrap gap-2">
                {GOAL_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, emoji: em }))}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      form.emoji === em
                        ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal name */}
            <div>
              <label className={labelCls}>Goal Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Vacation Fund"
                className={inputCls}
              />
            </div>

            {/* Target amount */}
            <div>
              <label className={labelCls}>Target Amount</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  value={form.targetAmount}
                  onChange={set("targetAmount")}
                  placeholder="10,000"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>

            {/* Target date & category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Target Date</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={set("targetDate")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  <option value="">Select category</option>
                  <option value="travel">Travel</option>
                  <option value="home">Home</option>
                  <option value="education">Education</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="emergency">Emergency</option>
                  <option value="wedding">Wedding</option>
                  <option value="retirement">Retirement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Monthly contribution */}
            <div>
              <label className={labelCls}>Monthly Contribution (optional)</label>
              <div className="relative">
                <Repeat size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  value={form.monthlyContribution}
                  onChange={set("monthlyContribution")}
                  placeholder="500"
                  className={`${inputCls} pl-10`}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set an amount to auto-save each month toward this goal.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium disabled:opacity-50 mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {createMutation.isPending ? (
                "Creating…"
              ) : (
                <>
                  <Plus size={16} /> Create Goal
                </>
              )}
            </motion.button>
          </form>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   3. AUTO-SAVE RULES
   ═══════════════════════════════════════════════════════════════════════════ */
interface AutoRule {
  id: string;
  name: string;
  description: string;
  type: "round-up" | "scheduled" | "percentage";
  enabled: boolean;
  amount?: number;
  percentage?: number;
  frequency?: string;
  icon: React.ReactNode;
  color: string;
}

const defaultRules: AutoRule[] = [
  {
    id: "round-up",
    name: "Round-Up Savings",
    description: "Round up every purchase to the nearest dollar and save the difference.",
    type: "round-up",
    enabled: false,
    icon: <ArrowUpRight size={18} />,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "weekly-save",
    name: "Weekly Auto-Save",
    description: "Automatically transfer a fixed amount every week.",
    type: "scheduled",
    enabled: true,
    amount: 50,
    frequency: "Weekly",
    icon: <Calendar size={18} />,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "monthly-save",
    name: "Monthly Auto-Save",
    description: "Automatically transfer a fixed amount on the 1st of each month.",
    type: "scheduled",
    enabled: true,
    amount: 300,
    frequency: "Monthly",
    icon: <Clock size={18} />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "income-pct",
    name: "Income Percentage",
    description: "Save a percentage of every incoming deposit automatically.",
    type: "percentage",
    enabled: false,
    percentage: 10,
    icon: <Percent size={18} />,
    color: "from-amber-500 to-orange-500",
  },
];

export const AutoSaveRules: React.FC = () => {
  const [rules, setRules] = useState<AutoRule[]>(defaultRules);
  const { showToast } = useToastStore();

  const toggle = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
    const rule = rules.find((r) => r.id === id);
    showToast(`${rule?.name} ${rule?.enabled ? "disabled" : "enabled"}`, "success");
  };

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalAutoSave = rules
    .filter((r) => r.enabled && r.amount)
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Auto-Save Rules"
          subtitle="Automate your savings with smart rules"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Savings", href: "/customer/savings" },
            { label: "Auto-Save Rules" },
          ]}
        />
      </motion.div>

      {/* Summary strip */}
      <DashCard className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              {activeCount} Active Rule{activeCount !== 1 && "s"}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Estimated auto-save: {fmt(totalAutoSave)}/mo from scheduled rules
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Sparkles size={14} />
            Saving on autopilot
          </div>
        </div>
      </DashCard>

      {/* Rule cards */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <motion.div key={rule.id} variants={dashboardItemVariants}>
            <DashCard
              className={`transition-colors ${
                rule.enabled
                  ? "border-indigo-200 dark:border-indigo-800"
                  : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${rule.color} text-white shrink-0`}
                >
                  {rule.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <button
                      onClick={() => toggle(rule.id)}
                      className="shrink-0 ml-3"
                      aria-label={`Toggle ${rule.name}`}
                    >
                      {rule.enabled ? (
                        <ToggleRight size={28} className="text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {rule.description}
                  </p>

                  {/* Meta badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {rule.type === "round-up" && "Round-Up"}
                      {rule.type === "scheduled" && rule.frequency}
                      {rule.type === "percentage" && `${rule.percentage}%`}
                    </span>
                    {rule.amount != null && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <DollarSign size={10} /> {rule.amount}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
                        rule.enabled
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {rule.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   4. SAVINGS ANALYTICS
   ═══════════════════════════════════════════════════════════════════════════ */
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const SavingsAnalytics: React.FC = () => {
  const { data: gData, isLoading } = useSavingsGoals();
  const goals = (gData as any)?.data ?? gData ?? [];

  const totalSaved = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.currentAmount ?? g.savedAmount ?? 0), 0),
    [goals],
  );
  const totalTarget = useMemo(
    () => goals.reduce((s: number, g: any) => s + (g.targetAmount ?? 0), 0),
    [goals],
  );
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Monthly Savings
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Your savings trend this year
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <TrendingUp size={14} />
            {fmt(avgMonthlySaving)}/mo avg
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 sm:gap-2 h-40 sm:h-48">
          {monthlyData.map((val, idx) => {
            const heightPct = maxMonthly > 0 ? (val / maxMonthly) * 100 : 0;
            const isCurrent = idx === new Date().getMonth();
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className={`w-full rounded-t-md ${
                    isCurrent
                      ? "bg-gradient-to-t from-indigo-600 to-purple-500"
                      : "bg-indigo-200 dark:bg-indigo-900/60"
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.04, ease: "easeOut" }}
                />
                <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                  {MONTH_LABELS[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </DashCard>

      {/* ── Savings breakdown & projection ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Breakdown */}
        <DashCard>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Goal Breakdown
          </h3>
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {g.name}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
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
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Savings Projection
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Current savings</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{fmt(totalSaved)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Monthly average</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{fmt(avgMonthlySaving)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Target total</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{fmt(totalTarget)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Year-end projection</span>
                <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {fmt(endOfYearProjection)}
                </span>
              </div>
              <ProgressBar
                value={totalTarget > 0 ? pct(endOfYearProjection, totalTarget) : 0}
                height="md"
                color="bg-gradient-to-r from-cyan-500 to-blue-500"
                className="mt-2"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                {endOfYearProjection >= totalTarget
                  ? "🎉 You're projected to meet your savings target by year-end!"
                  : `You'll need to increase monthly savings by ${fmt(
                      Math.max((totalTarget - endOfYearProjection) / (12 - monthsElapsed), 0),
                    )}/mo to hit your target.`}
              </p>
            </div>

            {/* Mini milestones */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Milestones</h4>
              {[25, 50, 75, 100].map((milestone) => {
                const reached = savingsRate >= milestone;
                return (
                  <div key={milestone} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        reached
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {reached ? "✓" : milestone}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs ${
                        reached
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
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
