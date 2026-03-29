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
  useSavingsGoals, useCreateSavingsGoal, useSavingsGoalProgress,
} from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";
import { useToastStore } from "@store/toast.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

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

const AutoSaveRules: React.FC = () => {
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

export default AutoSaveRules;
