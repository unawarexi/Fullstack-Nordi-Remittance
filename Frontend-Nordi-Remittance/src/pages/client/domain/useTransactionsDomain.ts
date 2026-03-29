// ============================================================================
// useTransactionsDomain — Domain use-case hook for Transactions & Transfers
//
// Wraps raw @hooks/queries with response normalization, typed returns,
// and @core/algo utilities. Components import from HERE, never from hooks.
// ============================================================================

import { useMemo } from "react";
import {
  useTransactions,
  useTransaction,
  useTransactionByReference,
  useRecentTransactions,
  useDepositMethods,
  useRemittanceCountries,
  useRecipients,
  useRecipient,
  useFavoriteRecipients,
  useRecentRecipients,
  useTransfer,
  useTransferToUser,
  useScheduleTransfer,
  useCancelScheduledTransfer,
  useSendRemittance,
  useRemittanceQuote,
  useDeposit,
  useWithdraw,
  useCalculateFee,
  useGetReceipt,
  useEmailReceipt,
  useCreateRecipient,
  useUpdateRecipient,
  useDeleteRecipient,
  useToggleRecipientFavorite,
} from "@hooks/queries/useTransactions";
import { multiKeySort } from "@core/algo";

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

const extractPagination = (d: unknown): PaginationMeta | null => {
  if (!d || typeof d !== "object") return null;
  const obj = d as Record<string, any>;
  return obj.pagination || obj.data?.pagination || obj.meta || null;
};

// ============================================================================
// QUERIES
// ============================================================================

/** Paginated transactions list */
export function useClientTransactions(filters?: TransactionFilters) {
  const { data: raw, isLoading, error, refetch } = useTransactions(filters);

  const result = useMemo(() => {
    const transactions = extractArray(raw, "transactions");
    const pagination = extractPagination(raw);
    return { transactions, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Single transaction by ID */
export function useClientTransaction(transactionId: UUID) {
  const { data: raw, isLoading, error } = useTransaction(transactionId);
  const transaction = useMemo(() => {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as Record<string, any>;
    return obj.transaction || obj.data || obj;
  }, [raw]);
  return { transaction, isLoading, error };
}

/** Transaction by reference number */
export function useClientTransactionByReference(reference: string) {
  const { data: raw, isLoading, error } = useTransactionByReference(reference);
  const transaction = useMemo(() => {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as Record<string, any>;
    return obj.transaction || obj.data || obj;
  }, [raw]);
  return { transaction, isLoading, error };
}

/** Recent transactions (sorted by date DESC) */
export function useClientRecentTransactions(limit = 10) {
  const { data: raw, isLoading, error, refetch } = useRecentTransactions(limit);

  const transactions = useMemo(() => {
    const list = extractArray(raw, "transactions");
    return multiKeySort(list, [
      { getter: (t: any) => new Date(t.createdAt || t.date), direction: "desc" },
    ]).slice(0, limit);
  }, [raw, limit]);

  return { transactions, isLoading, error, refetch };
}

/** Available deposit methods */
export function useClientDepositMethods(currency?: Currency) {
  const { data: raw, isLoading, error } = useDepositMethods(currency);
  const methods = useMemo(() => extractArray(raw, "methods", "depositMethods"), [raw]);
  return { methods, isLoading, error };
}

/** Remittance countries */
export function useClientRemittanceCountries() {
  const { data: raw, isLoading, error } = useRemittanceCountries();
  const countries = useMemo(() => extractArray(raw, "countries"), [raw]);
  return { countries, isLoading, error };
}

/** Recipients list (for remittances) */
export function useClientRecipients(params?: { search?: string; country?: string; isFavorite?: boolean; page?: number; limit?: number }) {
  const { data: raw, isLoading, error, refetch } = useRecipients(params);

  const result = useMemo(() => {
    const recipients = extractArray(raw, "recipients");
    const pagination = extractPagination(raw);
    return { recipients, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Single recipient */
export function useClientRecipient(recipientId: UUID) {
  const { data: raw, isLoading, error } = useRecipient(recipientId);
  const recipient = useMemo(() => {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as Record<string, any>;
    return obj.recipient || obj.data || obj;
  }, [raw]);
  return { recipient, isLoading, error };
}

/** Favorite recipients */
export function useClientFavoriteRecipients() {
  const { data: raw, isLoading, error } = useFavoriteRecipients();
  const recipients = useMemo(() => extractArray(raw, "recipients", "favorites"), [raw]);
  return { recipients, isLoading, error };
}

/** Recent recipients */
export function useClientRecentRecipients(limit = 5) {
  const { data: raw, isLoading, error } = useRecentRecipients(limit);
  const recipients = useMemo(() => extractArray(raw, "recipients", "recentRecipients"), [raw]);
  return { recipients, isLoading, error };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useTransfer,
  useTransferToUser,
  useScheduleTransfer,
  useCancelScheduledTransfer,
  useSendRemittance,
  useRemittanceQuote,
  useDeposit,
  useWithdraw,
  useCalculateFee,
  useGetReceipt,
  useEmailReceipt,
  useCreateRecipient,
  useUpdateRecipient,
  useDeleteRecipient,
  useToggleRecipientFavorite,
};
