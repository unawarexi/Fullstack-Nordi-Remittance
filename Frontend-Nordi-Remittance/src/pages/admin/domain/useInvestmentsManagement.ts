import { useState, useMemo, useCallback } from "react";
import {
  useInvestments,
  useInvestmentPortfolio,
  useInvestmentProducts,
} from "@hooks/queries";
import {
  applyFilterPipeline,
  textSearchFilter,
  enumFilter,
} from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useInvestmentsManagement — Aggregates investments, portfolio & products
// ============================================================================

export type InvestmentStatusFilter = "all" | "active" | "matured" | "withdrawn" | "pending";
export type InvestmentTypeFilter = "all" | "stocks" | "bonds" | "mutual_funds" | "fixed_deposit" | "crypto";

const PAGE_SIZE = 20;

export function useInvestmentsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvestmentStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<InvestmentTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  const { data: investmentsRaw, isLoading, refetch } = useInvestments({ limit: 500 } as any);
  const { data: portfolioRaw } = useInvestmentPortfolio();
  const { data: productsRaw } = useInvestmentProducts();

  // --- Normalize ---
  const rawInvestments = useMemo(() => {
    const outer: any = investmentsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.investments || [];
    return raw.map((inv: any) => ({
      id: inv._id || inv.accountId || inv.id || "",
      investor:
        inv.userName ||
        (inv.user?.firstName && inv.user?.lastName
          ? `${inv.user.firstName} ${inv.user.lastName}`
          : "Investor"),
      email: inv.user?.email || inv.email || "",
      type: inv.accountType || inv.type || "stocks",
      productName: inv.productName || inv.name || inv.accountType || "Investment",
      amount: inv.totalInvested || inv.amount || 0,
      currentValue: inv.currentValue ?? inv.totalInvested ?? 0,
      returns: inv.totalReturns || inv.returns || 0,
      returnPercentage: inv.returnPercentage ?? 0,
      status: inv.status || "active",
      startDate: inv.createdAt || inv.startDate || "",
      maturityDate: inv.maturityDate || inv.endDate || "",
      currency: inv.currency || "EUR",
      risk: inv.riskLevel || "medium",
    }));
  }, [investmentsRaw]);

  // --- Portfolio ---
  const portfolio = useMemo(() => {
    const p: any = portfolioRaw || {};
    return {
      totalValue: p.currentValue || p.totalValue || rawInvestments.reduce((s: number, i: any) => s + i.currentValue, 0),
      totalInvested: p.totalInvested || rawInvestments.reduce((s: number, i: any) => s + i.amount, 0),
      totalReturns: p.totalReturns || rawInvestments.reduce((s: number, i: any) => s + i.returns, 0),
      returnPercentage: p.returnPercentage ?? 0,
      allocation: p.byType
        ? Object.entries(p.byType).map(([name, data]: [string, any], idx: number) => ({
            name,
            value: data?.totalInvested || data?.value || 0,
            count: data?.count || 0,
            color: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"][idx % 7],
          }))
        : [],
    };
  }, [portfolioRaw, rawInvestments]);

  // --- Products ---
  const products = useMemo(() => {
    const outer: any = productsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data)
        ? outer.data
        : outer?.products || [];
    return raw.map((p: any) => ({
      id: p._id || p.id || "",
      name: p.name || p.productName || "",
      type: p.type || p.category || "",
      minInvestment: p.minInvestment ?? 0,
      expectedReturn: p.expectedReturn ?? 0,
      risk: p.riskLevel || "medium",
      status: p.status || "active",
    }));
  }, [productsRaw]);

  // --- Performance data for chart ---
  const performanceData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const totalVal = portfolio.totalValue || 1;
    return months.map((m, i) => ({
      name: m,
      value: Math.round(totalVal * (0.7 + i * 0.06)),
    }));
  }, [portfolio.totalValue]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (i) => i.investor ?? "",
          (i) => i.email ?? "",
          (i) => i.productName ?? "",
          (i) => i.id ?? "",
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((i) => i.status ?? "", [statusFilter]));
    }
    if (typeFilter !== "all") {
      predicates.push(enumFilter((i) => i.type ?? "", [typeFilter]));
    }
    const result = applyFilterPipeline(rawInvestments, predicates);
    return multiKeySort(result, [
      { getter: (i: any) => new Date(i.startDate || 0), direction: "desc" },
    ]);
  }, [rawInvestments, search, statusFilter, typeFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page],
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => ({
    totalInvestments: rawInvestments.length,
    activeInvestments: rawInvestments.filter((i: any) => i.status === "active").length,
    totalPortfolioValue: portfolio.totalValue,
    totalReturns: portfolio.totalReturns,
    returnPercentage: portfolio.returnPercentage,
  }), [rawInvestments, portfolio]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    investments: paginatedResult.items,
    allInvestments: filtered,
    rawInvestments,
    portfolio,
    products,
    performanceData,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    selectedInvestmentId,
    isLoading,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: useCallback((v: InvestmentStatusFilter) => { setStatusFilter(v); setPage(1); }, []),
    setTypeFilter: useCallback((v: InvestmentTypeFilter) => { setTypeFilter(v); setPage(1); }, []),
    setPage,
    setSelectedInvestmentId,
    refetch,
  };
}
