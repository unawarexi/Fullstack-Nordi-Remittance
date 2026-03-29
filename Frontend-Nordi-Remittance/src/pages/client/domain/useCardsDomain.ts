// ============================================================================
// useCardsDomain — Domain use-case hook for Cards management
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useCards,
  useCard,
  useCardLimits,
  useCardSettings,
  useCardTransactions,
  useTrackCardDelivery,
  useCreateCard,
  useActivateCard,
  useToggleFreezeCard,
  useCancelCard,
  useRequestReplacementCard,
  useGetCardDetails,
  useUpdateCardLimits,
  useUpdateCardSettings,
  useChangeCardPin,
  useResetCardPin,
  useSetNewCardPin,
  useDisputeCardTransaction,
  useRequestPhysicalCard,
} from "@hooks/queries/useCards";
import { maskSensitive } from "@core/algo";

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

/** All cards for logged-in user */
export function useClientCards(filters?: CardFilters) {
  const { data: raw, isLoading, error, refetch } = useCards(filters);

  const cards = useMemo(() => {
    return extractArray(raw, "cards").map((c: any) => ({
      id: c._id || c.cardId || c.id || "",
      cardNumber: maskSensitive(c.cardNumber || "", 4),
      last4: c.last4 || c.lastFour || c.cardNumber?.slice(-4) || "••••",
      cardholderName: c.cardholderName || c.cardName || c.name || "",
      cardType: c.cardType || c.type || "debit",
      cardBrand: c.cardBrand || c.brand || "visa",
      status: c.status || "active",
      isPhysical: c.isPhysical ?? (c.cardType !== "virtual" && c.type !== "virtual"),
      balance: c.balance || 0,
      creditLimit: c.creditLimit || 0,
      availableCredit: c.availableCredit || 0,
      expiryMonth: c.expiryMonth,
      expiryYear: c.expiryYear,
      expiryDate: c.expiryDate || (c.expiryMonth && c.expiryYear ? `${String(c.expiryMonth).padStart(2, "0")}/${c.expiryYear}` : ""),
      currency: c.currency || "USD",
      isInternationalEnabled: !!c.isInternationalEnabled,
      isOnlineEnabled: c.isOnlineEnabled !== false,
      isContactlessEnabled: c.isContactlessEnabled !== false,
      _raw: c,
    }));
  }, [raw]);

  return { cards, isLoading, error, refetch };
}

/** Single card detail */
export function useClientCard(cardId: UUID) {
  const { data: raw, isLoading, error } = useCard(cardId);
  const card = useMemo(() => extractObject(raw, "card"), [raw]);
  return { card, isLoading, error };
}

/** Card limits */
export function useClientCardLimits(cardId: UUID) {
  const { data: raw, isLoading, error } = useCardLimits(cardId);
  const limits = useMemo(() => extractObject(raw, "limits"), [raw]);
  return { limits, isLoading, error };
}

/** Card settings/controls */
export function useClientCardSettings(cardId: UUID) {
  const { data: raw, isLoading, error } = useCardSettings(cardId);
  const settings = useMemo(() => extractObject(raw, "settings", "controls"), [raw]);
  return { settings, isLoading, error };
}

/** Card transactions (paginated) */
export function useClientCardTransactions(cardId: UUID, filters?: CardTransactionFilters) {
  const { data: raw, isLoading, error,refetch } = useCardTransactions(cardId, filters);

  const result = useMemo(() => {
    const transactions = extractArray(raw, "transactions", "cardTransactions");
    const pagination = extractPagination(raw);
    return { transactions, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Track card delivery */
export function useClientTrackCardDelivery(cardId: UUID) {
  const { data: raw, isLoading, error } = useTrackCardDelivery(cardId);
  const tracking = useMemo(() => extractObject(raw, "tracking", "delivery"), [raw]);
  return { tracking, isLoading, error };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useCreateCard,
  useActivateCard,
  useToggleFreezeCard,
  useCancelCard,
  useRequestReplacementCard,
  useGetCardDetails,
  useUpdateCardLimits,
  useUpdateCardSettings,
  useChangeCardPin,
  useResetCardPin,
  useSetNewCardPin,
  useDisputeCardTransaction,
  useRequestPhysicalCard,
};
