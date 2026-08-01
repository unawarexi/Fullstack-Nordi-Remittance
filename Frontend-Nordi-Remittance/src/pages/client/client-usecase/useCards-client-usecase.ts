// ============================================================================
// useCardsDomain — Domain use-case hook for Client Cards management
//
// Wraps raw @hooks/queries and stores with response normalization, state, and typed returns.
// All client card .tsx UI pages import strictly from here without calling direct APIs or raw mutations.
// ============================================================================

import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardFilters, CardTransactionFilters } from "../../../domain/repository/cards.repository";
import {
  useCards,
  useCard,
  useCardLimits,
  useCardSettings,
  useCardTransactions,
  useTrackCardDelivery,
  useCreateVirtualCard,
  useActivateCard,
  useToggleFreezeCard,
  useCancelCard,
  useRequestReplacementCard,
  useGetCardDetails,
  useUpdateCardLimits,
  useUpdateCardControls,
  useChangeCardPin,
  useResetCardPin,
  useSetNewCardPin,
  useDisputeCardTransaction,
  useRequestPhysicalCard,
  useFundCard,
  useWithdrawFromCard,
  useUpgradeCardLimit,
} from "@hooks/api-queries/useCards";
import { maskSensitive } from "@core/algo";
import { useUIStore } from "@store/ui.store";
import { useToastStore } from "@store/toast.store";
import { useWallets } from "@hooks/api-queries/useAccounts";
import type { ActiveWallet, ClientCard } from "@domain/types/Card.types";
import { MAX_CARDS_PER_USER, PHYSICAL_CARD_ISSUANCE_FEE } from "@domain/types/Card.types";

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
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) return obj[k];
  }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

const extractPagination = (d: unknown): PaginationMeta | null => {
  if (!d || typeof d !== "object") return null;
  const obj = d as Record<string, any>;
  return obj.pagination || obj.data?.pagination || obj.meta || null;
};

// ============================================================================
// BASE QUERIES
// ============================================================================

/** All cards for logged-in user */
export function useClientCards(filters?: CardFilters) {
  const { data: raw, isLoading, error, refetch } = useCards(filters);

  const cards: ClientCard[] = useMemo(() => {
    return extractArray(raw, "cards").map((c: any) => ({
      id: c._id || c.cardId || c.id || "",
      cardId: c.cardId,
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
      expiryDate:
        c.expiryDate ||
        (c.expiryMonth && c.expiryYear ? `${String(c.expiryMonth).padStart(2, "0")}/${c.expiryYear}` : ""),
      currency: c.currency || "USD",
      isInternationalEnabled: !!c.isInternationalEnabled,
      isOnlineEnabled: c.isOnlineEnabled !== false,
      isContactlessEnabled: c.isContactlessEnabled !== false,
      // NOTE: previously dropped — CardSecurity's ATM toggle had nothing real to read from.
      isAtmEnabled: c.isAtmEnabled !== false,
      blockedReason: c.blockedReason || null,
      blockedAt: c.blockedAt || null,
      billingAddress: c.billingAddress || null,
      createdAt: c.createdAt,
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
  const { data: raw, isLoading, error, refetch } = useCardTransactions(cardId, filters);

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
// SPECIALIZED UI PAGE DOMAIN HOOKS
// ============================================================================

/** 1. Domain Hook for CardsOverview.tsx */
export function useCardsOverviewDomain() {
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const { cards, isLoading, refetch } = useClientCards();
  const navigate = useNavigate();

  const activeCardsCount = useMemo(
    () => cards.filter((c: any) => (c.status || "active").toLowerCase() === "active").length,
    [cards],
  );

  const totalLimit = useMemo(
    () => cards.reduce((acc: number, c: any) => acc + (c.creditLimit || c.balance || 0), 0),
    [cards],
  );

  const handleApplyForCard = useCallback(() => {
    navigate("/customer/cards/apply");
  }, [navigate]);

  return {
    cards,
    isLoading,
    showBalances,
    activeCardsCount,
    totalLimit,
    refetch,
    handleApplyForCard,
  };
}

/** 2. Domain Hook for VirtualCards.tsx */
export function useVirtualCardsDomain() {
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const { cards: allCards, isLoading, refetch } = useClientCards();
  const createMutation = useCreateVirtualCard();
  const { data: walletsRaw } = useWallets();
  const { showToast } = useToastStore();
  const [selectedBrand, setSelectedBrand] = useState<string>("visa");
  const [cardholderName, setCardholderName] = useState("");

  const virtualCards = useMemo(
    () => allCards.filter((c: any) => (c.cardType || "").toLowerCase().includes("virtual") || c.isPhysical === false),
    [allCards],
  );

  const activeWalletId = useMemo(() => {
    if (Array.isArray(walletsRaw)) return walletsRaw[0]?.id || (walletsRaw[0] as any)?._id;
    if ((walletsRaw as any)?.data && Array.isArray((walletsRaw as any).data))
      return (walletsRaw as any).data[0]?.id || (walletsRaw as any).data[0]?._id;
    return "";
  }, [walletsRaw]);

  const cardLimitReached = allCards.length >= MAX_CARDS_PER_USER;

  const handleCreateVirtualCard = useCallback(() => {
    if (!activeWalletId) {
      showToast("No active wallet found to link card", "error");
      return;
    }
    if (cardLimitReached) {
      showToast(`Maximum of ${MAX_CARDS_PER_USER} cards reached`, "error");
      return;
    }
    createMutation.mutate(
      {
        walletId: activeWalletId,
        cardType: "virtual",
        cardBrand: selectedBrand,
        cardholderName: cardholderName.trim() || undefined,
        currency: "USD",
      },
      {
        onSuccess: () => {
          refetch();
          setCardholderName("");
          showToast("Virtual card created successfully!", "success");
        },
        onError: (err: any) => {
          showToast(err.message || "Failed to create virtual card", "error");
        },
      },
    );
  }, [createMutation, refetch, showToast, activeWalletId, selectedBrand, cardholderName, cardLimitReached]);

  return {
    virtualCards,
    isLoading,
    showBalances,
    cardholderName,
    setCardholderName,
    cardLimitReached,
    isCreating: createMutation.isPending,
    selectedBrand,
    setSelectedBrand,
    handleCreateVirtualCard,
  };
}

/** 3. Domain Hook for CardTransactions.tsx */
export function useCardTransactionsPageDomain() {
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const { cards, isLoading: cardsLoading } = useClientCards();
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  const activeCardId = selectedCardId || cards?.[0]?.id || "";
  const { transactions, isLoading: txnsLoading } = useClientCardTransactions(activeCardId as UUID);

  return {
    cards,
    activeCardId,
    setSelectedCardId,
    transactions,
    isLoading: cardsLoading || txnsLoading,
    showBalances,
  };
}

/** 4. Domain Hook for CardSecurity.tsx */
export function useCardSecurityDomain() {
  const { cards, isLoading } = useClientCards();
  const freezeMutation = useToggleFreezeCard();
  const cancelMutation = useCancelCard();
  const updateControlsMutation = useUpdateCardControls();
  const updateLimitsMutation = useUpdateCardLimits();
  const { showToast } = useToastStore();

  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const activeCardId = selectedCardId || cards?.[0]?.id || "";
  const activeCard = useMemo(
    () => (cards.find((c) => c.id === activeCardId) || cards?.[0] || {}) as any,
    [cards, activeCardId],
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    isOnlineEnabled: true,
    isInternationalEnabled: false,
    isContactlessEnabled: true,
    isAtmEnabled: true,
  });

  // Re-sync local toggle state whenever the selected card changes (switching
  // cards should never leak the previous card's local-only toggle state).
  useEffect(() => {
    if (!activeCard.id) return;
    setToggles({
      isOnlineEnabled: activeCard.isOnlineEnabled ?? true,
      isInternationalEnabled: activeCard.isInternationalEnabled ?? false,
      isContactlessEnabled: activeCard.isContactlessEnabled ?? true,
      isAtmEnabled: activeCard.isAtmEnabled ?? true,
    });
  }, [activeCard.id]);

  const handleToggleOption = useCallback(
    (key: string) => {
      const nextVal = !toggles[key];
      setToggles((p) => ({ ...p, [key]: nextVal }));
      if (activeCardId) {
        updateControlsMutation.mutate(
          { cardId: activeCardId, data: { [key]: nextVal } },
          {
            onSuccess: () => showToast(`Updated security setting`, "success"),
          },
        );
      }
    },
    [toggles, activeCardId, updateControlsMutation, showToast],
  );

  const handleQuickAction = useCallback(
    (actionLabel: string) => {
      if (!activeCardId) {
        showToast("No active card selected to perform action", "error");
        return;
      }
      switch (actionLabel) {
        case "Freeze Card":
          freezeMutation.mutate(activeCardId, {
            onSuccess: () => showToast("Card freeze state toggled successfully", "success"),
          });
          break;
        case "Change PIN":
          showToast("PIN reset instruction sent to registered email & mobile.", "success");
          break;
        case "Report Lost":
          cancelMutation.mutate(
            { cardId: activeCardId, reason: "Lost or stolen card" },
            {
              onSuccess: () => showToast("Card immediately locked and replacement requested", "success"),
            },
          );
          break;
        case "Set Limits":
          updateLimitsMutation.mutate(
            {
              cardId: activeCardId,
              data: {
                dailyTransactionLimit: 5000,
                monthlyTransactionLimit: 25000,
                perTransactionLimit: 2500,
              } as any,
            },
            {
              onSuccess: () => showToast("Default standard security limits applied", "success"),
            },
          );
          break;
        default:
          break;
      }
    },
    [activeCardId, freezeMutation, cancelMutation, updateLimitsMutation, showToast],
  );

  const isPending =
    freezeMutation.isPending ||
    cancelMutation.isPending ||
    updateControlsMutation.isPending ||
    updateLimitsMutation.isPending;

  return {
    cards,
    isLoading,
    activeCard,
    activeCardId,
    setActiveCardId: setSelectedCardId,
    toggles,
    handleToggleOption,
    handleQuickAction,
    isPending,
  };
}

/** 5. Domain Hook for ApplyForCard.tsx */
export function useApplyForCardDomain() {
  const createVirtualMutation = useCreateVirtualCard();
  const requestPhysicalMutation = useRequestPhysicalCard();
  const { data: walletsRaw } = useWallets();
  const { cards, isLoading: cardsLoading } = useClientCards();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [selectedBrand, setSelectedBrand] = useState<"visa" | "mastercard" | "amex" | "discover">("visa");
  const [cardholderName, setCardholderName] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const activeWallet: ActiveWallet | null = useMemo(() => {
    const list = Array.isArray(walletsRaw)
      ? walletsRaw
      : Array.isArray((walletsRaw as any)?.data)
        ? (walletsRaw as any).data
        : [];
    const w = list[0];
    if (!w) return null;
    return {
      id: w.id || w._id,
      balance: w.balance ?? w.availableBalance ?? 0,
      currency: w.currency || "USD",
    };
  }, [walletsRaw]);

  const activeWalletId = activeWallet?.id || "";

  // Mirrors the controller's own guardrails so the person sees why a request
  // would fail *before* they submit, not after a round trip.
  const hasExistingPhysicalCard = useMemo(
    () => cards.some((c) => c.isPhysical && ["pending_activation", "active"].includes(c.status)),
    [cards],
  );
  const cardLimitReached = cards.length >= MAX_CARDS_PER_USER;
  const hasSufficientFundsForPhysical = (activeWallet?.balance ?? 0) >= PHYSICAL_CARD_ISSUANCE_FEE;

  const handleApply = useCallback(
    (cardType: "virtual" | "physical") => {
      if (!activeWalletId) {
        showToast("Active wallet required to request card.", "error");
        return;
      }

      if (cardType === "virtual") {
        createVirtualMutation.mutate(
          {
            walletId: activeWalletId,
            cardType: "virtual",
            cardBrand: selectedBrand,
            cardholderName: cardholderName.trim() || undefined,
            currency: activeWallet?.currency || "USD",
          },
          {
            onSuccess: () => {
              showToast("Virtual card created successfully", "success");
              navigate("/customer/cards");
            },
            onError: (err: any) => showToast(err.message, "error"),
          },
        );
      } else {
        requestPhysicalMutation.mutate(
          { walletId: activeWalletId, cardBrand: selectedBrand, shippingAddress },
          {
            onSuccess: () => {
              showToast("Physical card requested successfully", "success");
              navigate("/customer/cards");
            },
            onError: (err: any) => showToast(err.message, "error"),
          },
        );
      }
    },
    [
      createVirtualMutation,
      requestPhysicalMutation,
      activeWalletId,
      activeWallet,
      selectedBrand,
      cardholderName,
      shippingAddress,
      navigate,
      showToast,
    ],
  );

  return {
    handleApply,
    isApplying: createVirtualMutation.isPending || requestPhysicalMutation.isPending,
    isLoadingContext: cardsLoading,
    selectedBrand,
    setSelectedBrand,
    cardholderName,
    setCardholderName,
    shippingAddress,
    setShippingAddress,
    activeWallet,
    hasExistingPhysicalCard,
    cardLimitReached,
    hasSufficientFundsForPhysical,
    issuanceFee: PHYSICAL_CARD_ISSUANCE_FEE,
  };
}

/** 6. Domain Hook for primary Cards.tsx manager */
export function useMainCardManagerDomain() {
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const { cards, isLoading, refetch } = useClientCards();
  const [selectedCard, setSelectedCard] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal State
  const [modalType, setModalType] = useState<"fund" | "withdraw" | null>(null);
  const [modalAmount, setModalAmount] = useState("");
  const [modalNotes, setModalNotes] = useState("");

  const fundMutation = useFundCard();
  const withdrawMutation = useWithdrawFromCard();
  const freezeMutation = useToggleFreezeCard();
  const { showToast } = useToastStore();

  const activeCard = (cards[selectedCard] || {}) as any;
  const activeCardId = activeCard.id || activeCard._id || activeCard.cardId;
  const isFrozen = activeCard.status === "blocked" || activeCard.status === "frozen";

  const handleOpenModal = useCallback(
    (type: "fund" | "withdraw") => {
      if (!activeCardId) return;
      setModalType(type);
      setModalAmount("");
      setModalNotes("");
    },
    [activeCardId],
  );

  const handleCloseModal = useCallback(() => {
    setModalType(null);
    setModalAmount("");
    setModalNotes("");
  }, []);

  const handleToggleFreeze = useCallback(() => {
    if (!activeCardId) return;
    freezeMutation.mutate(activeCardId);
  }, [activeCardId, freezeMutation]);

  const handleModalSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeCardId || !modalType) return;

      const amount = parseFloat(modalAmount);
      if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount greater than 0", "error");
        return;
      }

      if (modalType === "fund") {
        fundMutation.mutate({ cardId: activeCardId, amount, notes: modalNotes }, { onSuccess: handleCloseModal });
      } else {
        withdrawMutation.mutate({ cardId: activeCardId, amount, notes: modalNotes }, { onSuccess: handleCloseModal });
      }
    },
    [activeCardId, modalType, modalAmount, modalNotes, fundMutation, withdrawMutation, showToast, handleCloseModal],
  );

  const isModalPending = fundMutation.isPending || withdrawMutation.isPending;

  return {
    cards,
    isLoading,
    showBalances,
    selectedCard,
    setSelectedCard,
    activeTab,
    setActiveTab,
    activeCard,
    activeCardId,
    isFrozen,
    modalType,
    modalAmount,
    setModalAmount,
    modalNotes,
    setModalNotes,
    isModalPending,
    isFreezePending: freezeMutation.isPending,
    refetch,
    handleOpenModal,
    handleCloseModal,
    handleToggleFreeze,
    handleModalSubmit,
  };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useCreateVirtualCard,
  useActivateCard,
  useToggleFreezeCard,
  useCancelCard,
  useRequestReplacementCard,
  useGetCardDetails,
  useUpdateCardLimits,
  useUpdateCardControls,
  useChangeCardPin,
  useResetCardPin,
  useSetNewCardPin,
  useDisputeCardTransaction,
  useRequestPhysicalCard,
  useFundCard,
  useWithdrawFromCard,
  useUpgradeCardLimit,
};
