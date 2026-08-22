import { useState, useMemo, useCallback } from "react";
import {
  useTransactions,
  usePendingTransactions,
  useApproveTransaction,
  useRejectTransaction,
  useAdminOperations,
  useAdminDashboardStats,
  useFraudSignals,
} from "@hooks/api-queries";
import {
  applyFilterPipeline,
  textSearchFilter,
  enumFilter,
  dateRangeFilter,
  numericRangeFilter,
} from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";
import type { PaginationResult } from "@core/algo/pagination";

import { useRecentTransactions } from "@hooks/api-queries";
import { formatCurrency } from "@core/algo/financial";

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionFiltersState {
  search: string;
  status: string;
  type: string;
  timeRange: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export interface WalletOperationPayload {
  userId: string;
  amount: number;
  currency: string;
  description?: string;
  transactionType?: string;
  isInternational?: boolean;
  metadata?: Record<string, any>;
}

const DEFAULT_FILTERS: TransactionFiltersState = {
  search: "",
  status: "all",
  type: "all",
  timeRange: "all",
  sortBy: "createdAt",
  sortDir: "desc",
};

const PAGE_SIZE = 20;

// ============================================================================
// TIME RANGE UTILITY
// ============================================================================

function getDateRangeFromPreset(preset: string): { from?: Date; to?: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "Today":
      return { from: todayStart, to: now };
    case "This Week": {
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return { from: weekStart, to: now };
    }
    case "This Month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: monthStart, to: now };
    }
    case "This Quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const qStart = new Date(now.getFullYear(), qMonth, 1);
      return { from: qStart, to: now };
    }
    default:
      return {};
  }
}

import { useTransactionStore } from "@store/transaction.store";

// ============================================================================
// MAIN HOOK — All Transactions Management
// ============================================================================

export function useTransactionManagement() {
  const { globalFilters: filters, updateGlobalFilters: setFilters, resetGlobalFilters: resetFiltersStore } = useTransactionStore();
  const [page, setPage] = useState(1);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "credit" | "debit" | "reverse";
    txId?: string;
  } | null>(null);

  // --- Queries ---
  const transactionsQuery = useTransactions({
    page: 1,
    limit: 500,
  } as any);
  const dashboardQuery = useAdminDashboardStats();

  // --- Mutations ---
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();
  const { creditWallet, debitWallet } = useAdminOperations();

  // --- Derived Data ---
  const rawTransactions: any[] = useMemo(() => {
    const data = transactionsQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    return Array.isArray(extracted) ? extracted : [];
  }, [transactionsQuery.data]);

  // --- Filter Pipeline ---
  const filteredTransactions = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];

    // Text search
    if (filters.search) {
      predicates.push(
        textSearchFilter(filters.search, [
          (tx) => tx.reference ?? "",
          (tx) => tx.id ?? "",
          (tx) => tx.description ?? "",
          (tx) => tx.sourceWallet?.user?.fullName ?? tx.user ?? "",
          (tx) => tx.sourceWallet?.user?.email ?? tx.email ?? "",
        ]),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      predicates.push(enumFilter((tx) => tx.status ?? "", [filters.status]));
    }

    // Type filter
    if (filters.type !== "all") {
      predicates.push(enumFilter((tx) => tx.type ?? "", [filters.type]));
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      const { from, to } = getDateRangeFromPreset(filters.timeRange);
      if (from || to) {
        predicates.push(dateRangeFilter((tx) => tx.createdAt ?? tx.date, from, to));
      }
    }

    // Amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      predicates.push(numericRangeFilter((tx) => tx.amount, filters.minAmount, filters.maxAmount));
    }

    const filtered = applyFilterPipeline(rawTransactions, predicates);

    // Sort
    return multiKeySort(filtered, [
      {
        getter: (tx: any) => (filters.sortBy === "amount" ? tx.amount ?? 0 : new Date(tx.createdAt ?? tx.date ?? 0)),
        direction: filters.sortDir,
      },
    ]);
  }, [rawTransactions, filters]);

  // --- Pagination ---
  const paginatedResult: PaginationResult<any> = useMemo(
    () => paginate(filteredTransactions, page, PAGE_SIZE),
    [filteredTransactions, page],
  );

  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => {
    const all = rawTransactions;
    return {
      total: all.length,
      volume: all.reduce((sum: number, tx: any) => sum + (tx.amount ?? 0), 0),
      completed: all.filter((tx: any) => tx.status === "completed").length,
      pending: all.filter((tx: any) => tx.status === "pending").length,
      failed: all.filter((tx: any) => tx.status === "failed").length,
      processing: all.filter((tx: any) => tx.status === "processing").length,
    };
  }, [rawTransactions]);

  // --- Actions ---
  const updateFilter = useCallback((key: keyof TransactionFiltersState, value: any) => {
    setFilters({ [key]: value });
    setPage(1);
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    resetFiltersStore();
    setPage(1);
  }, [resetFiltersStore]);

  const approveTransaction = useCallback(
    (transactionId: string, note?: string, callbacks?: { onError?: (err: any) => void }) => {
      approveMutation.mutate(
        { transactionId: transactionId as UUID, note },
        { onError: (err) => callbacks?.onError?.(err) },
      );
    },
    [approveMutation],
  );

  const rejectTransaction = useCallback(
    (transactionId: string, reason: string, callbacks?: { onError?: (err: any) => void }) => {
      rejectMutation.mutate(
        { transactionId: transactionId as UUID, reason },
        { onError: (err) => callbacks?.onError?.(err) },
      );
    },
    [rejectMutation],
  );

  const creditUser = useCallback(
    (payload: WalletOperationPayload, callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
      creditWallet.mutate(payload, {
        onSuccess: () => callbacks?.onSuccess?.(),
        onError: (err) => callbacks?.onError?.(err),
      });
    },
    [creditWallet],
  );

  const debitUser = useCallback(
    (payload: WalletOperationPayload, callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
      debitWallet.mutate(payload, {
        onSuccess: () => callbacks?.onSuccess?.(),
        onError: (err) => callbacks?.onError?.(err),
      });
    },
    [debitWallet],
  );

  const refetch = useCallback(() => {
    transactionsQuery.refetch();
  }, [transactionsQuery]);

  return {
    // Data
    transactions: paginatedResult.items,
    allTransactions: filteredTransactions,
    rawTransactions,
    stats,
    dashboardStats: dashboardQuery.data,

    // Loading states
    isLoading: transactionsQuery.isLoading,
    isRefetching: transactionsQuery.isRefetching,
    isMutating:
      approveMutation.isPending || rejectMutation.isPending || creditWallet.isPending || debitWallet.isPending,

    // Filters
    filters,
    updateFilter,
    resetFilters,

    // Pagination
    page,
    setPage,
    pagination: paginatedResult,
    pageNumbers,

    // Selection
    selectedTxId,
    setSelectedTxId,
    actionModal,
    setActionModal,

    // Actions
    approveTransaction,
    rejectTransaction,
    creditUser,
    debitUser,
    refetch,
  };
}

// ============================================================================
// HOOK — Pending Transactions
// ============================================================================

export function usePendingTransactionManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pendingQuery = usePendingTransactions();
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const rawPending: any[] = useMemo(() => {
    const data = pendingQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    return Array.isArray(extracted) ? extracted : [];
  }, [pendingQuery.data]);

  const filtered = useMemo(() => {
    if (!search) return rawPending;
    const predicate = textSearchFilter(search, [
      (tx: any) => tx.reference ?? "",
      (tx: any) => tx.id ?? "",
      (tx: any) => tx.description ?? "",
    ]);
    return rawPending.filter(predicate);
  }, [rawPending, search]);

  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  return {
    transactions: paginatedResult.items,
    total: filtered.length,
    isLoading: pendingQuery.isLoading,
    isMutating: approveMutation.isPending || rejectMutation.isPending,
    search,
    setSearch,
    page,
    setPage,
    pagination: paginatedResult,
    pageNumbers,
    approve: (id: string, note?: string, callbacks?: { onError?: (err: any) => void }) =>
      approveMutation.mutate({ transactionId: id as UUID, note }, { onError: (err) => callbacks?.onError?.(err) }),
    reject: (id: string, reason: string, callbacks?: { onError?: (err: any) => void }) =>
      rejectMutation.mutate({ transactionId: id as UUID, reason }, { onError: (err) => callbacks?.onError?.(err) }),
    refetch: pendingQuery.refetch,
  };
}

// ============================================================================
// HOOK — Failed Transactions (filtered from all)
// ============================================================================

export function useFailedTransactionManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const transactionsQuery = useTransactions({ status: "failed" } as any);

  const rawFailed: any[] = useMemo(() => {
    const data = transactionsQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    const list = Array.isArray(extracted) ? extracted : [];
    return list.filter((tx: any) => tx.status === "failed");
  }, [transactionsQuery.data]);

  const filtered = useMemo(() => {
    if (!search) return rawFailed;
    const predicate = textSearchFilter(search, [
      (tx: any) => tx.reference ?? "",
      (tx: any) => tx.id ?? "",
      (tx: any) => tx.failureReason ?? "",
      (tx: any) => tx.description ?? "",
    ]);
    return rawFailed.filter(predicate);
  }, [rawFailed, search]);

  const sorted = useMemo(
    () => multiKeySort(filtered, [{ getter: (tx: any) => new Date(tx.createdAt ?? tx.date ?? 0), direction: "desc" }]),
    [filtered],
  );

  const paginatedResult = useMemo(() => paginate(sorted, page, PAGE_SIZE), [sorted, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  return {
    transactions: paginatedResult.items,
    total: sorted.length,
    isLoading: transactionsQuery.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pagination: paginatedResult,
    pageNumbers,
    refetch: transactionsQuery.refetch,
  };
}

// ============================================================================
// HOOK — International/Remittance Transactions
// ============================================================================

export function useInternationalTransactionManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const transactionsQuery = useTransactions({ type: "remittance" } as any);
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const rawInternational: any[] = useMemo(() => {
    const data = transactionsQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    const list = Array.isArray(extracted) ? extracted : [];
    return list.filter((tx: any) => tx.type === "remittance" || tx.type === "international");
  }, [transactionsQuery.data]);

  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];

    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (tx: any) => tx.reference ?? "",
          (tx: any) => tx.id ?? "",
          (tx: any) => tx.description ?? "",
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((tx: any) => tx.status ?? "", [statusFilter]));
    }

    return applyFilterPipeline(rawInternational, predicates);
  }, [rawInternational, search, statusFilter]);

  const sorted = useMemo(
    () => multiKeySort(filtered, [{ getter: (tx: any) => new Date(tx.createdAt ?? tx.date ?? 0), direction: "desc" }]),
    [filtered],
  );

  const paginatedResult = useMemo(() => paginate(sorted, page, PAGE_SIZE), [sorted, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  const stats = useMemo(() => {
    return {
      total: rawInternational.length,
      volume: rawInternational.reduce((s: number, tx: any) => s + (tx.amount ?? 0), 0),
      completed: rawInternational.filter((tx: any) => tx.status === "completed").length,
      pending: rawInternational.filter((tx: any) => tx.status === "pending").length,
    };
  }, [rawInternational]);

  return {
    transactions: paginatedResult.items,
    stats,
    total: sorted.length,
    isLoading: transactionsQuery.isLoading,
    isMutating: approveMutation.isPending || rejectMutation.isPending,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pagination: paginatedResult,
    pageNumbers,
    approve: (id: string, note?: string, callbacks?: { onError?: (err: any) => void }) =>
      approveMutation.mutate({ transactionId: id as UUID, note }, { onError: (err) => callbacks?.onError?.(err) }),
    reject: (id: string, reason: string, callbacks?: { onError?: (err: any) => void }) =>
      rejectMutation.mutate({ transactionId: id as UUID, reason }, { onError: (err) => callbacks?.onError?.(err) }),
    refetch: transactionsQuery.refetch,
  };
}

// ============================================================================
// HOOK — Suspicious Transactions
// ============================================================================

export function useSuspiciousTransactionManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fraudSignalsQuery = useFraudSignals();
  const transactionsQuery = useTransactions({ limit: 500 } as any);

  const rawTransactions: any[] = useMemo(() => {
    const data = transactionsQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    return Array.isArray(extracted) ? extracted : [];
  }, [transactionsQuery.data]);

  const fraudSignals: any[] = useMemo(() => {
    const data = fraudSignalsQuery.data;
    if (!data) return [];
    const extracted = Array.isArray(data) ? data : (data as any).data ?? (data as any).results ?? [];
    return Array.isArray(extracted) ? extracted : [];
  }, [fraudSignalsQuery.data]);

  // Build a set of flagged transaction IDs from fraud signals
  const flaggedTxIds = useMemo(() => {
    const ids = new Set<string>();
    for (const signal of fraudSignals) {
      if (signal.transactionId) ids.add(signal.transactionId);
      if (signal.relatedTransactions) {
        for (const id of signal.relatedTransactions) ids.add(id);
      }
    }
    return ids;
  }, [fraudSignals]);

  // Suspicious = flagged by fraud OR status is "suspicious" or "flagged"
  const suspiciousTxs = useMemo(() => {
    return rawTransactions.filter(
      (tx: any) =>
        flaggedTxIds.has(tx.id) || tx.status === "suspicious" || tx.status === "flagged" || tx.metadata?.isSuspicious,
    );
  }, [rawTransactions, flaggedTxIds]);

  const filtered = useMemo(() => {
    if (!search) return suspiciousTxs;
    const predicate = textSearchFilter(search, [
      (tx: any) => tx.reference ?? "",
      (tx: any) => tx.id ?? "",
      (tx: any) => tx.description ?? "",
    ]);
    return suspiciousTxs.filter(predicate);
  }, [suspiciousTxs, search]);

  const sorted = useMemo(
    () => multiKeySort(filtered, [{ getter: (tx: any) => new Date(tx.createdAt ?? tx.date ?? 0), direction: "desc" }]),
    [filtered],
  );

  const paginatedResult = useMemo(() => paginate(sorted, page, PAGE_SIZE), [sorted, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  return {
    transactions: paginatedResult.items,
    fraudSignals,
    total: sorted.length,
    isLoading: transactionsQuery.isLoading || fraudSignalsQuery.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pagination: paginatedResult,
    pageNumbers,
    refetch: () => {
      transactionsQuery.refetch();
      fraudSignalsQuery.refetch();
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useTransferHistory — Recent transactions widget for admin dashboard
// ============================================================================

type StatusFilter = "all" | "completed" | "pending" | "failed" | "approved" | "liquidated";
type TimeFilter = "30 days" | "6 months" | "1 year" | "3 years";

export function useTransferHistory() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("3 years");
  const [page, setPage] = useState(1);

  const { data: txRaw, isLoading, refetch } = useRecentTransactions(100);

  // --- Normalize transactions ---
  const rawTransactions = useMemo(() => {
    const outer: any = txRaw || {};
    const items: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data?.transactions)
          ? outer.data.transactions
          : Array.isArray(outer?.data)
            ? outer.data
            : [];
    return items.map((t: any) => ({
      id: t.reference || t._id || t.id || "",
      type: t.type || t.transactionType || "transfer",
      amount: formatCurrency(t.amount || 0, t.currency || "NGN"),
      rawAmount: t.amount || 0,
      currency: t.currency || "NGN",
      status: normalizeStatus(t.status),
      date: t.createdAt || t.date || t.timestamp || "",
      sender: t.senderName || t.sender?.name || t.fromAccount || "",
      receiver: t.recipientName || t.recipient?.name || t.toAccount || "",
      reference: t.reference || t._id || "",
    }));
  }, [txRaw]);

  // --- Time-based filtering ---
  const timeFiltered = useMemo(() => {
    if (timeFilter === "3 years") return rawTransactions;
    const now = Date.now();
    const ms: Record<TimeFilter, number> = {
      "30 days": 30 * 24 * 3600_000,
      "6 months": 180 * 24 * 3600_000,
      "1 year": 365 * 24 * 3600_000,
      "3 years": 1095 * 24 * 3600_000,
    };
    const cutoff = now - ms[timeFilter];
    return rawTransactions.filter((t) => new Date(t.date).getTime() >= cutoff);
  }, [rawTransactions, timeFilter]);

  // --- Filter pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (statusFilter !== "all") {
      predicates.push(enumFilter((i) => i.status?.toLowerCase() ?? "", [statusFilter]));
    }
    const result = applyFilterPipeline(timeFiltered, predicates);
    return multiKeySort(result, [{ getter: (i: any) => new Date(i.date || 0), direction: "desc" }]);
  }, [timeFiltered, statusFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  return {
    transactions: paginatedResult.items,
    allTransactions: filtered,
    total: filtered.length,
    isLoading,
    statusFilter,
    timeFilter,
    page,
    pagination: paginatedResult,
    pageNumbers,
    setStatusFilter: useCallback((v: StatusFilter) => {
      setStatusFilter(v);
      setPage(1);
    }, []),
    setTimeFilter: useCallback((v: TimeFilter) => {
      setTimeFilter(v);
      setPage(1);
    }, []),
    setPage,
    refetch,
  };
}

function normalizeStatus(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (s === "completed" || s === "success" || s === "approved") return "Approved";
  if (s === "pending" || s === "awaiting_approval" || s === "processing") return "Awaiting Approval";
  if (s === "liquidated" || s === "settled") return "Liquidated";
  if (s === "failed" || s === "rejected" || s === "cancelled") return "Failed";
  return raw;
}
