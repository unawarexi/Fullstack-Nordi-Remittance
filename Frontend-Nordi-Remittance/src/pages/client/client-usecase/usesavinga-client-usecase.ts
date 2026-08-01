// ============================================================================
// useSavingsDomain — Domain use-case hook for Savings Goals
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useSavingsGoals,
  useSavingsGoal,
  useSavingsGoalProgress,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useAddToSavingsGoal,
  useWithdrawFromSavingsGoal,
  useDeleteSavingsGoal,
  useUpdateAutoSave,
} from "@hooks/api-queries/useInvestments";
import { multiKeySort, formatCurrency } from "@core/algo";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Response Unwrappers ─────────────────────────────────────────────────────
const extractArray = (d: unknown, ...keys: string[]): any[] => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];
  const obj = d as Record<string, any>;
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k];
  }
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) {
      if (Array.isArray(obj.data[k])) return obj.data[k];
    }
    if (Array.isArray(obj.data.data)) return obj.data.data;
  }
  return [];
};

const extractObject = (d: unknown, ...keys: string[]): Record<string, any> => {
  if (!d || typeof d !== "object") return {};
  const obj = d as Record<string, any>;
  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) return obj[k];
  }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

// ============================================================================
// QUERIES
// ============================================================================

/** All savings goals for logged-in user */
export function useClientSavingsGoals() {
  const { data: raw, isLoading, error, refetch } = useSavingsGoals();

  const goals = useMemo(() => {
    const list = extractArray(raw, "goals", "savingsGoals");
    return multiKeySort(
      list.map((g: any) => {
        const current = g.currentAmount || g.saved || 0;
        const target = g.targetAmount || g.target || 1;
        return {
          id: g._id || g.goalId || g.id || "",
          name: g.name || g.title || "Savings Goal",
          description: g.description || "",
          currentAmount: current,
          targetAmount: target,
          percentage: Math.min(Math.round((current / target) * 100), 100),
          currency: g.currency || "USD",
          targetDate: g.targetDate || "",
          status: g.status || "active",
          category: g.category || "other",
          autoSaveEnabled: !!g.autoSaveEnabled,
          autoSaveAmount: g.autoSaveAmount || 0,
          autoSaveFrequency: g.autoSaveFrequency || "",
          _raw: g,
        };
      }),
      [{ getter: (g) => g.percentage, direction: "desc" }],
    );
  }, [raw]);

  const totals = useMemo(() => {
    const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    return { totalSaved, totalTarget, overallProgress, goalCount: goals.length };
  }, [goals]);

  return { goals, ...totals, isLoading, error, refetch };
}

/** Single savings goal detail */
export function useClientSavingsGoal(goalId: UUID) {
  const { data: raw, isLoading, error } = useSavingsGoal(goalId);
  const goal = useMemo(() => extractObject(raw, "goal", "savingsGoal"), [raw]);
  return { goal, isLoading, error };
}

/** Savings goal progress */
export function useClientSavingsGoalProgress(goalId: UUID) {
  const { data: raw, isLoading, error } = useSavingsGoalProgress(goalId);
  const progress = useMemo(() => extractObject(raw, "progress"), [raw]);
  return { progress, isLoading, error };
}

// ============================================================================
// COMPUTED HELPERS
// ============================================================================

export function formatSavingsAmount(amount: number, currency = "USD") {
  return formatCurrency(amount, currency);
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useAddToSavingsGoal,
  useWithdrawFromSavingsGoal,
  useDeleteSavingsGoal,
  useUpdateAutoSave,
};
