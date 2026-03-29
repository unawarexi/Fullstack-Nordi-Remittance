// ============================================================================
// useLoansDomain — Domain use-case hook for Loans management
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useLoans,
  useLoan,
  useLoanProducts,
  useLoanEligibility,
  useLoanSchedule,
  useLoanPayments,
  useLoanDocuments,
  useNextLoanPayment,
  useCalculateEmi,
  useApplyForLoan,
  useMakeLoanPayment,
  useSetupAutoPay,
  useCancelAutoPay,
  useRequestLoanExtension,
  useRequestPaymentDeferral,
  useRefinanceLoan,
  useUploadLoanDocuments,
  useGetPayoffQuote,
  useCancelLoanApplication,
} from "@hooks/queries/useLoans";
import { multiKeySort, formatCurrency, monthlyLoanPayment } from "@core/algo";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Response Unwrappers ─────────────────────────────────────────────────────
const extractArray = (d: unknown, ...keys: string[]): any[] => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];
  const obj = d as Record<string, any>;
  for (const k of keys) { if (Array.isArray(obj[k])) return obj[k]; }
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) { if (Array.isArray(obj.data[k])) return obj.data[k]; }
    if (Array.isArray(obj.data.data)) return obj.data.data;
  }
  return [];
};

const extractObject = (d: unknown, ...keys: string[]): Record<string, any> => {
  if (!d || typeof d !== "object") return {};
  const obj = d as Record<string, any>;
  for (const k of keys) { if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) return obj[k]; }
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

/** All loans for logged-in user (sorted by outstanding DESC) */
export function useClientLoans(filters?: { type?: LoanType; status?: LoanStatus; page?: number; limit?: number }) {
  const { data: raw, isLoading, error, refetch } = useLoans(filters);

  const result = useMemo(() => {
    const list = extractArray(raw, "loans");
    const loans = multiKeySort(list, [
      { getter: (l: any) => l.outstandingBalance || l.outstanding || 0, direction: "desc" },
    ]);
    const pagination = extractPagination(raw);
    return { loans, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Single loan detail */
export function useClientLoan(loanId: UUID) {
  const { data: raw, isLoading, error } = useLoan(loanId);
  const loan = useMemo(() => extractObject(raw, "loan"), [raw]);
  return { loan, isLoading, error };
}

/** Available loan products */
export function useClientLoanProducts(filters?: { type?: LoanType; minAmount?: number; maxAmount?: number }) {
  const { data: raw, isLoading, error } = useLoanProducts(filters);
  const products = useMemo(() => extractArray(raw, "products", "loanProducts"), [raw]);
  return { products, isLoading, error };
}

/** Loan eligibility check */
export function useClientLoanEligibility(data: { type: LoanType; amount: number; termMonths: number }) {
  const { data: raw, isLoading, error } = useLoanEligibility(data);
  const eligibility = useMemo(() => extractObject(raw, "eligibility"), [raw]);
  return { eligibility, isLoading, error };
}

/** Repayment schedule */
export function useClientLoanSchedule(loanId: UUID) {
  const { data: raw, isLoading, error } = useLoanSchedule(loanId);

  const result = useMemo(() => {
    const obj = extractObject(raw, "schedule", "repaymentSchedule");
    const installments = extractArray(obj, "installments");
    return { schedule: obj, installments };
  }, [raw]);

  return { ...result, isLoading, error };
}

/** Loan payments (paginated) */
export function useClientLoanPayments(loanId: UUID, params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useLoanPayments(loanId, params);

  const result = useMemo(() => {
    const payments = extractArray(raw, "payments", "repayments");
    const pagination = extractPagination(raw);
    return { payments, pagination };
  }, [raw]);

  return { ...result, isLoading, error };
}

/** Loan documents */
export function useClientLoanDocuments(loanId: UUID) {
  const { data: raw, isLoading, error } = useLoanDocuments(loanId);
  const documents = useMemo(() => extractArray(raw, "documents"), [raw]);
  return { documents, isLoading, error };
}

/** Next payment info */
export function useClientNextLoanPayment(loanId: UUID) {
  const { data: raw, isLoading, error } = useNextLoanPayment(loanId);
  const payment = useMemo(() => extractObject(raw, "nextPayment", "payment"), [raw]);
  return { payment, isLoading, error };
}

/** EMI calculator */
export function useClientCalculateEmi(data: { principal: number; annualRate: number; termMonths: number }) {
  const { data: raw, isLoading, error } = useCalculateEmi(data);
  const result = useMemo(() => extractObject(raw, "emi", "calculation"), [raw]);
  return { emi: result, isLoading, error };
}

// ============================================================================
// COMPUTED HELPERS
// ============================================================================

/** Calculate EMI locally using algo */
export function calculateEmiLocal(principal: number, annualRate: number, termMonths: number) {
  return monthlyLoanPayment(principal, annualRate, termMonths);
}

/** Format loan amount */
export function formatLoanAmount(amount: number, currency = "USD") {
  return formatCurrency(amount, currency);
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useApplyForLoan,
  useMakeLoanPayment,
  useSetupAutoPay,
  useCancelAutoPay,
  useRequestLoanExtension,
  useRequestPaymentDeferral,
  useRefinanceLoan,
  useUploadLoanDocuments,
  useGetPayoffQuote,
  useCancelLoanApplication,
};
