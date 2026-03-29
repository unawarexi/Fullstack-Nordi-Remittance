// ============================================================================
// useAccountsDomain — Domain use-case hook for Accounts & Beneficiaries
//
// Wraps raw @hooks/queries with response normalization, typed returns,
// and @core/algo utilities. Components import from HERE, never from hooks.
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
} from "@hooks/queries/useAccounts";
import { formatCurrency, maskSensitive } from "@core/algo";

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
  for (const k of keys) { if (obj[k] && typeof obj[k] === "object") return obj[k]; }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

// ============================================================================
// QUERIES
// ============================================================================

/** All wallets for logged-in user, normalized */
export function useClientWallets() {
  const { data: raw, isLoading, error, refetch } = useWallets();

  const wallets = useMemo(() => {
    return extractArray(raw, "wallets").map((w: any) => ({
      id: w._id || w.id || "",
      name: w.name || w.accountName || "Account",
      walletNumber: w.walletNumber || w.accountNumber || "",
      type: (w.walletType || w.type || "personal").toLowerCase(),
      balances: w.balances || {},
      currency: w.currency || "USD",
      status: w.status || "active",
      isPrimary: !!w.isPrimary,
      balance: typeof w.balance === "number"
        ? w.balance
        : w.balances
          ? Object.values(w.balances as Record<string, number>).reduce((s, v) => s + v, 0)
          : 0,
    }));
  }, [raw]);

  return { wallets, isLoading, error, refetch };
}

/** Single wallet detail */
export function useClientWallet(walletId: UUID) {
  const { data: raw, isLoading, error } = useWallet(walletId);
  const wallet = useMemo(() => extractObject(raw, "wallet"), [raw]);
  return { wallet, isLoading, error };
}

/** Account summary / aggregated stats */
export function useClientAccountSummary() {
  const { data: raw, isLoading, error } = useAccountSummary();
  const summary = useMemo(() => extractObject(raw, "summary", "account"), [raw]);
  return { summary, isLoading, error };
}

/** Account limits */
export function useClientAccountLimits() {
  const { data: raw, isLoading, error } = useAccountLimits();
  const limits = useMemo(() => extractArray(raw, "limits"), [raw]);
  return { limits, isLoading, error };
}

/** Balance history for a wallet */
export function useClientBalanceHistory(walletId: UUID, params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useBalanceHistory(walletId, params);
  const history = useMemo(() => extractArray(raw, "history", "entries"), [raw]);
  return { history, isLoading, error };
}

/** Beneficiaries list */
export function useClientBeneficiaries() {
  const { data: raw, isLoading, error, refetch } = useBeneficiaries();
  const beneficiaries = useMemo(() => extractArray(raw, "beneficiaries"), [raw]);
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
