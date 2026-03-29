import { useState, useMemo, useCallback } from "react";
import {
  useLoans,
  useApproveLoan,
  useRejectLoan,
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
// useLoansManagement — Aggregates loan listing, filters, stats & admin actions
// ============================================================================

export type LoanStatusFilter = "all" | "pending" | "approved" | "active" | "rejected" | "overdue" | "paid";
export type LoanTypeFilter = "all" | "personal" | "business" | "mortgage" | "education" | "auto";

const PAGE_SIZE = 20;

export function useLoansManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoanStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<LoanTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const { data: loansRaw, isLoading, refetch } = useLoans({ limit: 500 } as any);
  const approveMutation = useApproveLoan();
  const rejectMutation = useRejectLoan();

  // --- Normalize raw loan data ---
  const rawLoans = useMemo(() => {
    const outer: any = loansRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.loans || [];
    return raw.map((l: any) => ({
      id: l._id || l.loanId || l.id || "",
      applicant:
        l.borrowerName ||
        l.userName ||
        (l.user?.firstName && l.user?.lastName
          ? `${l.user.firstName} ${l.user.lastName}`
          : "Applicant"),
      email: l.user?.email || l.email || "",
      type: l.loanType || l.type || "personal",
      amount: l.principalAmount || l.amount || 0,
      interestRate: l.interestRate ?? 0,
      term: l.term ?? 0,
      monthlyPayment: l.monthlyPayment ?? 0,
      outstanding: l.outstandingBalance ?? l.remainingAmount ?? l.principalAmount ?? 0,
      status: l.status || "pending",
      appliedDate: l.createdAt || l.applicationDate || "",
      startDate: l.startDate || "",
      maturityDate: l.maturityDate || l.endDate || "",
      purpose: l.purpose || "",
      collateral: l.collateral || "",
      currency: l.currency || "EUR",
    }));
  }, [loansRaw]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (l) => l.applicant ?? "",
          (l) => l.email ?? "",
          (l) => l.id ?? "",
          (l) => l.purpose ?? "",
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((l) => l.status ?? "", [statusFilter]));
    }
    if (typeFilter !== "all") {
      predicates.push(enumFilter((l) => l.type ?? "", [typeFilter]));
    }
    const result = applyFilterPipeline(rawLoans, predicates);
    return multiKeySort(result, [
      { getter: (l: any) => new Date(l.appliedDate || 0), direction: "desc" },
    ]);
  }, [rawLoans, search, statusFilter, typeFilter]);

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
  const stats = useMemo(() => {
    const totalDisbursed = rawLoans
      .filter((l: any) => l.status === "active" || l.status === "paid")
      .reduce((sum: number, l: any) => sum + l.amount, 0);
    return {
      totalLoans: rawLoans.length,
      pendingApplications: rawLoans.filter((l: any) => l.status === "pending" || l.status === "under_review").length,
      activeLoans: rawLoans.filter((l: any) => l.status === "active").length,
      overdueLoans: rawLoans.filter((l: any) => l.status === "overdue").length,
      totalDisbursed,
      averageAmount:
        rawLoans.length > 0
          ? Math.round(rawLoans.reduce((s: number, l: any) => s + l.amount, 0) / rawLoans.length)
          : 0,
    };
  }, [rawLoans]);

  // --- Actions ---
  const approveLoan = useCallback(
    (loanId: string, callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
      approveMutation.mutate(
        { loanId: loanId as any, data: { status: "approved" } },
        {
          onSuccess: () => { refetch(); callbacks?.onSuccess?.(); },
          onError: (err) => callbacks?.onError?.(err),
        },
      );
    },
    [approveMutation, refetch],
  );

  const rejectLoan = useCallback(
    (loanId: string, reason?: string, callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
      rejectMutation.mutate(
        { loanId: loanId as any, reason },
        {
          onSuccess: () => { refetch(); callbacks?.onSuccess?.(); },
          onError: (err) => callbacks?.onError?.(err),
        },
      );
    },
    [rejectMutation, refetch],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    loans: paginatedResult.items,
    allLoans: filtered,
    rawLoans,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    selectedLoanId,
    isLoading,
    isMutating: approveMutation.isPending || rejectMutation.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: useCallback((v: LoanStatusFilter) => { setStatusFilter(v); setPage(1); }, []),
    setTypeFilter: useCallback((v: LoanTypeFilter) => { setTypeFilter(v); setPage(1); }, []),
    setPage,
    setSelectedLoanId,
    approveLoan,
    rejectLoan,
    refetch,
  };
}
