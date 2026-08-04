// ============================================================================
// useAccountsDomain — Domain use-case hook for Accounts & Beneficiaries
//
// Wraps raw @hooks/queries with response normalization, typed returns,
// and @core/algo utilities. Components import from HERE, never from hooks
// or the repository directly.
//
// FIXES vs. previous version:
//  - useClientAccountLimits used extractArray() on `limits`, which is an
//    OBJECT ({ daily, monthly, perTransaction }), not an array — it always
//    silently returned []. Now reads it correctly and also exposes
//    kycStatus + walletLimits, which existed on the backend response but
//    were dropped entirely.
//  - Wallets carry MULTI-CURRENCY balances (backend stores a Map). The old
//    normalizer collapsed everything into a single `balance` number, which
//    is only meaningful for single-currency wallets and silently wrong for
//    the rest. ClientWallet now exposes `balancesByCurrency` plus a
//    `primaryCurrencyBalance` convenience field.
//  - There is no `savings` / `current` / `fixed` walletType on the backend —
//    only `personal` | `business`. Anything that filtered wallets by those
//    strings was filtering against a field that can never match. Removed.
//  - Added useClientWalletDetail, useClientBalanceHistory (with real
//    pagination + ledger filters) — nothing on the frontend previously
//    called getWalletById or read the ledger at all.
// ============================================================================

import { useMemo } from "react";
import {
  useWallets,
  useWallet,
  useAccountSummary,
  useAccountLimits,
  useBalanceHistory,
  useBeneficiaries,
  useAddBeneficiary,
  useRemoveBeneficiary,
  useCreateWallet,
  useUpdateWallet,
  useCloseWallet,
} from "@hooks/api-queries/useAccounts";
import { formatCurrency, maskSensitive } from "@core/algo";

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
    if (obj[k] && typeof obj[k] === "object") return obj[k];
  }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

// ============================================================================
// DOMAIN TYPES + NORMALIZATION
// ============================================================================

export interface ClientWalletBalance {
  currency: string;
  amount: number;
}

export interface ClientWallet {
  id: string;
  walletNumber: string;
  /** Only "personal" | "business" exist on the backend today. */
  type: "personal" | "business";
  status: "active" | "suspended" | "closed";
  isPrimary: boolean;
  notes?: string;
  freezeReason?: string;
  balancesByCurrency: ClientWalletBalance[];
  /** Sum across every currency the wallet holds — display only, NOT an FX conversion. */
  rawTotalBalance: number;
  /** First/dominant currency on the wallet, for single-currency display contexts. */
  primaryCurrency: string;
  primaryCurrencyBalance: number;
  recentTransactionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  lastTransactionAt?: string;
}

function normalizeWallet(w: any): ClientWallet {
  const balances: Record<string, number> = w.balances || {};
  const balancesByCurrency: ClientWalletBalance[] = Object.entries(balances).map(([currency, amount]) => ({
    currency,
    amount: Number(amount) || 0,
  }));
  const rawTotalBalance = balancesByCurrency.reduce((sum, b) => sum + b.amount, 0);
  const primary = balancesByCurrency[0];

  return {
    id: w._id || w.id || "",
    walletNumber: w.walletNumber || "",
    type: w.walletType === "business" ? "business" : "personal",
    status: w.status || "active",
    isPrimary: !!w.isPrimary,
    notes: w.notes,
    freezeReason: w.freezeReason,
    balancesByCurrency,
    rawTotalBalance,
    primaryCurrency: primary?.currency || "USD",
    primaryCurrencyBalance: primary?.amount || 0,
    recentTransactionsCount: w.recentTransactionsCount,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
    lastTransactionAt: w.lastTransactionAt,
  };
}

function normalizeLedgerEntry(e: any) {
  return {
    id: e._id || e.id || "",
    entryType: e.entryType as "debit" | "credit",
    amount: Number(e.amount) || 0,
    currency: e.currency || "USD",
    balance: Number(e.balance) || 0,
    description: e.description || "",
    createdAt: e.createdAt,
    accountingDate: e.accountingDate,
    isReversed: !!e.isReversed,
    transaction: e.transaction,
  };
}

// ============================================================================
// QUERIES
// ============================================================================

/** All wallets for logged-in user, normalized */
export function useClientWallets() {
  const { data: raw, isLoading, error, refetch } = useWallets();

  const wallets = useMemo(() => extractArray(raw, "wallets").map(normalizeWallet), [raw]);
  const cached = useMemo(() => !!(raw && typeof raw === "object" && (raw as any).cached), [raw]);

  return { wallets, isLoading, error, refetch, cached };
}

/** Single wallet detail: wallet + its limit doc + last 10 ledger entries */
export function useClientWalletDetail(walletId: UUID) {
  const { data: raw, isLoading, error, refetch } = useWallet(walletId);

  const wallet = useMemo(() => {
    const w = extractObject(raw, "wallet");
    return Object.keys(w).length ? normalizeWallet(w) : null;
  }, [raw]);

  const limit = useMemo(() => {
    const l = (raw as any)?.limits;
    return l && typeof l === "object" ? (l as AccountLimit) : null;
  }, [raw]);

  const recentEntries = useMemo(() => extractArray(raw, "recentEntries").map(normalizeLedgerEntry), [raw]);

  return { wallet, limit, recentEntries, isLoading, error, refetch };
}

/** Account summary / aggregated stats for the dashboard */
export function useClientAccountSummary() {
  const { data: raw, isLoading, error } = useAccountSummary();

  const summary = useMemo(() => {
    const s = extractObject(raw, "summary");
    return {
      totalBalance: s.totalBalance ?? 0,
      primaryCurrency: s.primaryCurrency || "USD",
      walletsCount: s.walletsCount ?? 0,
      incoming: s.monthlyStats?.incoming ?? 0,
      outgoing: s.monthlyStats?.outgoing ?? 0,
      netFlow: s.monthlyStats?.netFlow ?? 0,
      transactionCount: s.monthlyStats?.transactionCount ?? 0,
    };
  }, [raw]);

  const wallets = useMemo(() => extractArray(raw, "wallets").map(normalizeWallet), [raw]);
  const recentTransactions = useMemo(() => extractArray(raw, "recentTransactions"), [raw]);

  return { summary, wallets, recentTransactions, isLoading, error };
}

/** Account limits: daily/monthly usage bands + per-wallet limit docs + KYC status */
export function useClientAccountLimits() {
  const { data: raw, isLoading, error } = useAccountLimits();

  const limits = useMemo(() => extractObject(raw, "limits"), [raw]);
  const kycStatus: string = useMemo(() => (raw as any)?.kycStatus || "pending", [raw]);
  const walletLimits = useMemo(() => extractArray(raw, "walletLimits"), [raw]);

  return {
    daily: (limits.daily as { transfer: AccountLimitBand; withdrawal: AccountLimitBand } | undefined) || null,
    monthly: (limits.monthly as { transfer: AccountLimitBand; withdrawal: AccountLimitBand } | undefined) || null,
    perTransaction: limits.perTransaction ?? 0,
    kycStatus,
    walletLimits,
    isLoading,
    error,
  };
}

/** Ledger / balance history for a wallet, with real pagination + filters */
export function useClientBalanceHistory(
  walletId: UUID,
  params?: { page?: number; limit?: number; startDate?: string; endDate?: string; type?: "debit" | "credit" },
) {
  const { data: raw, isLoading, error, refetch } = useBalanceHistory(walletId, params);

  const entries = useMemo(() => extractArray(raw, "data", "entries").map(normalizeLedgerEntry), [raw]);

  const pagination = useMemo(() => {
    const p = (raw as any)?.pagination || {};
    const limit = p.limit ?? params?.limit ?? 50;
    const total = p.total ?? p.totalItems ?? p.count ?? entries.length;
    return {
      page: p.page ?? params?.page ?? 1,
      limit,
      total,
      totalPages: p.totalPages ?? Math.max(1, Math.ceil(total / Math.max(limit, 1))),
    };
  }, [raw, params, entries.length]);

  return { entries, pagination, isLoading, error, refetch };
}

/** Beneficiaries list */
export function useClientBeneficiaries() {
  const { data: raw, isLoading, error, refetch } = useBeneficiaries();
  const beneficiaries = useMemo(() => extractArray(raw, "beneficiaries") as Beneficiary[], [raw]);
  return { beneficiaries, isLoading, error, refetch };
}

// ============================================================================
// MUTATIONS (pass-through with same API — mutations don't need normalization)
// ============================================================================

export { useAddBeneficiary, useRemoveBeneficiary, useCreateWallet, useUpdateWallet, useCloseWallet };

// ============================================================================
// COMPUTED HELPERS
// ============================================================================

/** Format a wallet balance with currency symbol */
export function useFormattedBalance(amount: number, currency = "USD") {
  return formatCurrency(amount, currency);
}

/** Mask a wallet/account number for display */
export function useMaskedNumber(num?: string) {
  return maskSensitive(num || "", 4);
}

/** Every currency balance on a wallet, formatted, e.g. "$1,240.00 · ₦82,000.00" */
export function formatWalletBalances(wallet: Pick<ClientWallet, "balancesByCurrency">): string {
  if (!wallet.balancesByCurrency.length) return formatCurrency(0, "USD");
  return wallet.balancesByCurrency.map((b) => formatCurrency(b.amount, b.currency)).join(" · ");
}

/** Supported wallet currencies — mirrors WalletService.createWallet's validation list. */
export const SUPPORTED_WALLET_CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "KES",
  "GHS",
  "ZAR",
  "CAD",
  "AUD",
] as Currency[];
