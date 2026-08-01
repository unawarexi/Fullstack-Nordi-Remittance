// ============================================================================
// useClientSpending — Spending analytics domain hook
//
// Manages the interactive period filter + normalises spending data.
// Separated from useClientDashboard because the period is user-controlled.
// Uses @core/algo for stable sorting of trend data.
// ============================================================================

import { useState, useMemo } from "react";
import { useSpendingByCategory, useSpendingTrends } from "@hooks/api-queries";
import { multiKeySort } from "@core/algo";
import { PERIOD_MAP, CHART_COLORS } from "../components/dashboard.constants";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Safe-array extractor ────────────────────────────────────────────────────
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

export function useClientSpending(): ClientSpendingData {
  const [activeFilter, setActiveFilter] = useState("Month");
  const period = PERIOD_MAP[activeFilter] || "1M";

  const { data: catRes, isLoading: catLoading } = useSpendingByCategory({ period });
  const { data: trendRes, isLoading: trendLoading } = useSpendingTrends({ period });

  const categories = useMemo<SpendingCategory[]>(() => {
    const catData: any = catRes || {};
    const cats: any[] = catData?.categories || [];
    const mapped = cats.map((c: any, i: number) => ({
      category: c.category || c.name || `Category ${i + 1}`,
      amount: c.amount || c.total || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    return multiKeySort(mapped, [{ getter: (c) => c.amount, direction: "desc" }]);
  }, [catRes]);

  const trends = useMemo<SpendingTrendPoint[]>(() => {
    const mapped = extractArray(trendRes, "trends").map((t: any) => ({
      month: t.month || t.period || t.label || "",
      spent: t.amount || t.total || t.spent || 0,
    }));

    return multiKeySort(mapped, [{ getter: (t) => t.month, direction: "asc" }]);
  }, [trendRes]);

  const totalSpending = useMemo(() => categories.reduce((s, item) => s + item.amount, 0), [categories]);

  return {
    categories,
    trends,
    totalSpending,
    activeFilter,
    setActiveFilter,
    isLoading: catLoading,
    isTrendLoading: trendLoading,
  };
}
