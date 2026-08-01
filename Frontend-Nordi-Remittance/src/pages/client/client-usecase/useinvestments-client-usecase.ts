// ============================================================================
// useInvestmentsDomain — Domain use-case hook for Investments
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useInvestments,
  useInvestment,
  useInvestmentPortfolio,
  useInvestmentProducts,
  useInvestmentProduct,
  useInvestmentPerformance,
  useInvestmentTransactions,
  useCreateInvestment,
  useTopUpInvestment,
  useWithdrawInvestment,
  useCloseInvestment,
  useSetupRecurringInvestment,
  useCancelRecurringInvestment,
} from "@hooks/api-queries/useInvestments";
import { multiKeySort, topK, formatCurrency } from "@core/algo";

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

const extractPagination = (d: unknown): PaginationMeta | null => {
  if (!d || typeof d !== "object") return null;
  const obj = d as Record<string, any>;
  return obj.pagination || obj.data?.pagination || obj.meta || null;
};

// ============================================================================
// QUERIES
// ============================================================================

/** All investments for logged-in user */
export function useClientInvestments(filters?: {
  type?: InvestmentType;
  status?: InvestmentStatus;
  page?: number;
  limit?: number;
}) {
  const { data: raw, isLoading, error, refetch } = useInvestments(filters);

  const result = useMemo(() => {
    const investments = extractArray(raw, "investments", "accounts");
    const pagination = extractPagination(raw);
    return { investments, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Single investment detail */
export function useClientInvestment(investmentId: UUID) {
  const { data: raw, isLoading, error } = useInvestment(investmentId);
  const investment = useMemo(() => extractObject(raw, "investment", "account"), [raw]);
  return { investment, isLoading, error };
}

/** Portfolio summary with top holdings */
export function useClientPortfolio() {
  const { data: raw, isLoading, error, refetch } = useInvestmentPortfolio();

  const portfolio = useMemo(() => {
    const p = extractObject(raw, "portfolio");
    const holdings = extractArray(raw, "portfolios", "holdings", "assets");

    const topHoldings = topK(
      holdings.map((h: any) => ({
        id: h._id || h.portfolioId || h.id || h.symbol || "",
        name: h.name || h.symbol || "Asset",
        symbol: h.symbol || "",
        quantity: h.quantity || 0,
        currentValue: h.currentValue || 0,
        unrealizedGain: h.unrealizedGain || h.change || 0,
        unrealizedGainPct: h.unrealizedGainPercentage || 0,
        _raw: h,
      })),
      10,
      (a, b) => b.currentValue - a.currentValue,
    );

    return {
      totalValue: p.totalValue || p.currentValue || 0,
      totalInvested: p.totalInvested || 0,
      totalReturns: p.totalReturns || 0,
      returnPercentage: p.returnPercentage || p.returnPct || 0,
      holdings: topHoldings,
      _raw: p,
    };
  }, [raw]);

  return { portfolio, isLoading, error, refetch };
}

/** Available investment products */
export function useClientInvestmentProducts(filters?: {
  type?: InvestmentType;
  minInvestment?: number;
  riskLevel?: "low" | "medium" | "high";
}) {
  const { data: raw, isLoading, error } = useInvestmentProducts(filters);
  const products = useMemo(() => extractArray(raw, "products", "investmentProducts"), [raw]);
  return { products, isLoading, error };
}

/** Investment product detail */
export function useClientInvestmentProduct(productId: UUID) {
  const { data: raw, isLoading, error } = useInvestmentProduct(productId);
  const product = useMemo(() => extractObject(raw, "product"), [raw]);
  return { product, isLoading, error };
}

/** Investment performance */
export function useClientInvestmentPerformance(investmentId: UUID, period?: "1M" | "3M" | "6M" | "1Y" | "ALL") {
  const { data: raw, isLoading, error } = useInvestmentPerformance(investmentId, period);

  const performance = useMemo(() => {
    const p = extractObject(raw, "performance");
    const dataPoints = extractArray(raw, "dataPoints", "history", "series");
    return { ...p, dataPoints };
  }, [raw]);

  return { performance, isLoading, error };
}

/** Investment transactions (paginated) */
export function useClientInvestmentTransactions(investmentId: UUID, params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useInvestmentTransactions(investmentId, params);

  const result = useMemo(() => {
    const transactions = extractArray(raw, "transactions");
    const pagination = extractPagination(raw);
    return { transactions, pagination };
  }, [raw]);

  return { ...result, isLoading, error };
}

// ============================================================================
// COMPUTED HELPERS
// ============================================================================

export function formatInvestmentValue(amount: number, currency = "USD") {
  return formatCurrency(amount, currency);
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useCreateInvestment,
  useTopUpInvestment,
  useWithdrawInvestment,
  useCloseInvestment,
  useSetupRecurringInvestment,
  useCancelRecurringInvestment,
};
