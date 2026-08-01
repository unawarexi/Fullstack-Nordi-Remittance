import { useState, useMemo, useCallback } from "react";
import { useRecentTransactions } from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";
import { formatCurrency } from "@core/algo/financial";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useTransferHistory — Recent transactions widget for admin dashboard
// ============================================================================

type StatusFilter = "all" | "completed" | "pending" | "failed" | "approved" | "liquidated";
type TimeFilter = "30 days" | "6 months" | "1 year" | "3 years";

const PAGE_SIZE = 10;

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
