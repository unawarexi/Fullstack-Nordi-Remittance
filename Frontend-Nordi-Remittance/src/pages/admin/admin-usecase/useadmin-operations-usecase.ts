import { useMemo, useCallback } from "react";
import {
  usePendingTransactions,
  useApproveTransaction,
  useRejectTransaction,
  useAdminReverseTransaction,
  useOperationalTasks,
} from "@hooks/api-queries/useAdmin";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";
import { useAdminStore } from "@store/admin.store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PAGE_SIZE = 20;

// ============================================================================
// useTransactionsManagement — Admin transaction operations
// ============================================================================

export type TransactionStatusFilter = "all" | "pending" | "completed" | "failed" | "reversed";

export function useTransactionsManagement() {
  const { 
    operationsState, 
    setModuleState, 
    rejectDialogId, 
    setRejectDialogId,
    rejectReason,
    setRejectReason
  } = useAdminStore();
  
  const { search, statusFilter, typeFilter, page } = operationsState;

  const { data: raw, isLoading, refetch } = usePendingTransactions();
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();
  const reverseMutation = useAdminReverseTransaction();

  const rawTransactions = useMemo<any[]>(() => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray((raw as any).transactions)) return (raw as any).transactions;
    if (Array.isArray((raw as any).data)) return (raw as any).data;
    return [];
  }, [raw]);

  const filtered = useMemo(() => {
    let items = rawTransactions;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.user?.firstName?.toLowerCase().includes(q) ||
          t.user?.lastName?.toLowerCase().includes(q) ||
          t.reference?.toLowerCase().includes(q) ||
          t.type?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      items = items.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== "all") {
      items = items.filter((t) => t.type === typeFilter);
    }
    return [...items].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [rawTransactions, search, statusFilter, typeFilter]);

  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages]
  );

  const stats = useMemo(() => ({
    total: rawTransactions.length,
    pending: rawTransactions.filter((t) => t.status === "pending").length,
    approved: rawTransactions.filter((t) => t.status === "completed").length,
    rejected: rawTransactions.filter((t) => t.status === "failed").length,
  }), [rawTransactions]);

  const approveTransaction = useCallback(
    (transactionId: string, note?: string) => {
      approveMutation.mutate({ transactionId: transactionId as any, note }, { onSuccess: () => refetch() });
    },
    [approveMutation, refetch]
  );

  const rejectTransaction = useCallback(
    (transactionId: string, reason: string) => {
      rejectMutation.mutate(
        { transactionId: transactionId as any, reason },
        {
          onSuccess: () => {
            setRejectDialogId(null);
            setRejectReason("");
            refetch();
          },
        }
      );
    },
    [rejectMutation, refetch, setRejectDialogId, setRejectReason]
  );
  
  const reverseTransaction = useCallback(
    (transactionId: string, reason: string) => {
      reverseMutation.mutate(
        { transactionId: transactionId as any, reason },
        {
          onSuccess: () => {
            setRejectDialogId(null);
            setRejectReason("");
            refetch();
          },
        }
      );
    },
    [reverseMutation, refetch, setRejectDialogId, setRejectReason]
  );

  return {
    transactions: paginatedResult.items,
    allTransactions: filtered,
    rawTransactions,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    rejectDialogId,
    rejectReason,
    isLoading,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isReversing: reverseMutation.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: (v: string) => setModuleState('operationsState', { search: v, page: 1 }),
    setStatusFilter: (v: TransactionStatusFilter) => setModuleState('operationsState', { statusFilter: v, page: 1 }),
    setTypeFilter: (v: string) => setModuleState('operationsState', { typeFilter: v, page: 1 }),
    setPage: (p: number) => setModuleState('operationsState', { page: p }),
    setRejectDialogId,
    setRejectReason,
    approveTransaction,
    rejectTransaction,
    reverseTransaction,
    refetch,
  };
}

// ============================================================================
// useTasksManagement — Admin Operational Tasks
// ============================================================================

export type TaskStatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export function useTasksManagement() {
  const { 
    operationsState, 
    setModuleState, 
  } = useAdminStore();
  
  const { search, statusFilter, typeFilter, page } = operationsState;

  const { data: raw, isLoading, refetch } = useOperationalTasks();

  const rawTasks = useMemo<any[]>(() => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray((raw as any).tasks)) return (raw as any).tasks;
    if (Array.isArray((raw as any).data)) return (raw as any).data;
    return [];
  }, [raw]);

  const filtered = useMemo(() => {
    let items = rawTasks;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignedTo?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      items = items.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== "all") {
      items = items.filter((t) => t.taskType === typeFilter);
    }
    return [...items].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [rawTasks, search, statusFilter, typeFilter]);

  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages]
  );

  return {
    tasks: paginatedResult.items,
    allTasks: filtered,
    rawTasks,
    search,
    statusFilter,
    typeFilter,
    page,
    isLoading,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: (v: string) => setModuleState('operationsState', { search: v, page: 1 }),
    setStatusFilter: (v: TaskStatusFilter) => setModuleState('operationsState', { statusFilter: v, page: 1 }),
    setTypeFilter: (v: string) => setModuleState('operationsState', { typeFilter: v, page: 1 }),
    setPage: (p: number) => setModuleState('operationsState', { page: p }),
    refetch,
  };
}
