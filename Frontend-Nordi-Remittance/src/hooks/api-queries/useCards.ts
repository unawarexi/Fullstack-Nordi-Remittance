import { CardsRepository, CardTransactionFilters, CardFilters } from "../../domain/repository/cards.repository";
import { useToastStore } from "../../store/toast.store";
import { queryKeys } from "../../core/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientCard, ClientCardTransaction, CardLimits } from "../../domain/types/Card.types";

/**
 * Get all user cards
 */
export const useCards = (filters?: CardFilters) => {
  return useQuery({
    queryKey: queryKeys.cards.list(filters as any),
    queryFn: async () => {
      const response = await CardsRepository.getAll(filters);
      return response;
    },
  });
};

/**
 * Get card by ID
 */
export const useCard = (cardId: UUID) => {
  return useQuery({
    queryKey: queryKeys.cards.detail(cardId),
    queryFn: async () => {
      const response = await CardsRepository.getById(cardId);
      return response.data;
    },
    enabled: !!cardId,
  });
};

/**
 * Get card limits
 */
export const useCardLimits = (cardId: UUID) => {
  return useQuery({
    queryKey: queryKeys.cards.limits(cardId),
    queryFn: async () => {
      const response = await CardsRepository.getLimits(cardId);
      return response.data;
    },
    enabled: !!cardId,
  });
};

/**
 * Get card settings
 */
export const useCardSettings = (cardId: UUID) => {
  return useQuery({
    queryKey: queryKeys.cards.settings(cardId),
    queryFn: async () => {
      const response = await CardsRepository.getSettings(cardId);
      return response.data;
    },
    enabled: !!cardId,
  });
};

/**
 * Get card transactions
 */
export const useCardTransactions = (cardId: UUID, filters?: CardTransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.cards.transactions(cardId, filters as any),
    queryFn: async () => {
      const response = await CardsRepository.getTransactions(cardId, filters);
      return response;
    },
    enabled: !!cardId,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create virtual card mutation
 */
export const useCreateVirtualCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      walletId: string;
      cardType?: string;
      cardBrand?: string;
      cardholderName?: string;
      currency?: string;
    }) => {
      const response = await CardsRepository.createVirtual(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      showToast("Virtual card created successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create card", "error");
    },
  });
};

/**
 * Activate card mutation
 */
export const useActivateCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: {
        cvv: string;
        expiryMonth: number;
        expiryYear: number;
        pin: string;
      };
    }) => {
      const response = await CardsRepository.activate(cardId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.list() });
      showToast("Card activated successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to activate card", "error");
    },
  });
};

/**
 * Toggle freeze card mutation
 */
export const useToggleFreezeCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (cardId: UUID) => {
      const response = await CardsRepository.toggleFreeze(cardId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.list() });
      showToast(data.status === "blocked" ? "Card frozen" : "Card unfrozen", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update card", "error");
    },
  });
};

/**
 * Cancel card mutation
 */
export const useCancelCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ cardId, reason }: { cardId: UUID; reason?: string }) => {
      const response = await CardsRepository.cancel(cardId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      showToast("Card cancelled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to cancel card", "error");
    },
  });
};

/**
 * Request replacement card mutation
 */
export const useRequestReplacementCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ cardId, reason }: { cardId: UUID; reason: string }) => {
      const response = await CardsRepository.requestReplacement(cardId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      showToast("Replacement card requested", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request replacement", "error");
    },
  });
};

/**
 * Get full card details mutation (sensitive data)
 */
export const useGetCardDetails = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ cardId, pin }: { cardId: UUID; pin: string }) => {
      const response = await CardsRepository.getFullDetails(cardId, pin);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to get card details", "error");
    },
  });
};

/**
 * Update card limits mutation
 */
export const useUpdateCardLimits = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ cardId, data }: { cardId: UUID; data: Partial<CardLimits> }) => {
      const response = await CardsRepository.updateLimits(cardId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.limits(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(data.id),
      });
      showToast("Card limits updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update limits", "error");
    },
  });
};

/**
 * Update card controls mutation
 */
export const useUpdateCardControls = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: {
        isInternationalEnabled?: boolean;
        isOnlineEnabled?: boolean;
        isContactlessEnabled?: boolean;
        isAtmEnabled?: boolean;
      };
    }) => {
      const response = await CardsRepository.updateControls(cardId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.settings(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(data.id),
      });
      showToast("Card settings updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update settings", "error");
    },
  });
};

/**
 * Change card PIN mutation
 */
export const useChangeCardPin = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: { currentPin: string; newPin: string; confirmPin: string };
    }) => {
      const response = await CardsRepository.changePin(cardId, data);
      return response.data;
    },
    onSuccess: () => {
      showToast("PIN changed successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to change PIN", "error");
    },
  });
};

/**
 * Reset card PIN mutation
 */
export const useResetCardPin = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (cardId: UUID) => {
      const response = await CardsRepository.resetPin(cardId);
      return response.data;
    },
    onSuccess: () => {
      showToast("PIN reset code sent", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reset PIN", "error");
    },
  });
};

/**
 * Set new PIN after reset mutation
 */
export const useSetNewCardPin = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: { otp: string; newPin: string; confirmPin: string };
    }) => {
      const response = await CardsRepository.setNewPin(cardId, data);
      return response.data;
    },
    onSuccess: () => {
      showToast("New PIN set successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to set PIN", "error");
    },
  });
};

/**
 * Dispute card transaction mutation
 */
export const useDisputeCardTransaction = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      transactionId,
      data,
    }: {
      cardId: UUID;
      transactionId: UUID;
      data: { reason: string; description: string };
    }) => {
      const response = await CardsRepository.disputeTransaction(cardId, transactionId, data);
      return response.data;
    },
    onSuccess: () => {
      showToast("Dispute submitted successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit dispute", "error");
    },
  });
};

/**
 * Request physical card mutation
 */
export const useRequestPhysicalCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      walletId: UUID;
      cardBrand?: "visa" | "mastercard" | "amex" | "discover";
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
      };
    }) => {
      const response = await CardsRepository.requestPhysicalCard(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      showToast("Physical card requested", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request card", "error");
    },
  });
};

/**
 * Track card delivery
 */
export const useTrackCardDelivery = (cardId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.cards.detail(cardId), "delivery"],
    queryFn: async () => {
      const response = await CardsRepository.trackDelivery(cardId);
      return response.data;
    },
    enabled: !!cardId,
    refetchInterval: 60000, // Refresh every minute
  });
};

/**
 * Fund card mutation
 */
export const useFundCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      amount,
      fromWalletId,
      notes,
    }: {
      cardId: string;
      amount: number;
      fromWalletId?: string;
      notes?: string;
    }) => {
      const response = await CardsRepository.fund(cardId, { amount, fromWalletId, notes });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(variables.cardId) });
      queryClient.invalidateQueries({ queryKey: ["wallets"] as any });
      showToast(`Successfully added funds to card`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add funds to card", "error");
    },
  });
};

/**
 * Withdraw from card mutation
 */
export const useWithdrawFromCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      amount,
      toWalletId,
      notes,
    }: {
      cardId: string;
      amount: number;
      toWalletId?: string;
      notes?: string;
    }) => {
      const response = await CardsRepository.withdraw(cardId, { amount, toWalletId, notes });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(variables.cardId) });
      queryClient.invalidateQueries({ queryKey: ["wallets"] as any });
      showToast(`Successfully transferred funds to wallet`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to withdraw funds from card", "error");
    },
  });
};

/**
 * Upgrade card limit mutation
 */
export const useUpgradeCardLimit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ cardId, amount, creditLimit }: { cardId: string; amount: number; creditLimit?: number }) => {
      const response = await CardsRepository.upgradeLimit(cardId, { amount, creditLimit });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.detail(variables.cardId) });
      showToast(`Successfully upgraded card limit`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upgrade card limit", "error");
    },
  });
};

// ============================================================================
// ADMIN CARD HOOKS
// ============================================================================

/**
 * Fetch all deployed user cards for Admin
 */
export const useAdminAllCards = () => {
  return useQuery({
    queryKey: ["admin", "cards"],
    queryFn: async () => {
      const res = await CardsRepository.adminGetAll();
      return res;
    },
  });
};

/**
 * Fetch all card applications for Admin
 */
export const useAdminCardApplications = () => {
  return useQuery({
    queryKey: ["admin", "cardApplications"],
    queryFn: async () => {
      const res = await CardsRepository.adminGetApplications();
      return res;
    },
  });
};

/**
 * Admin Card Action Mutations (Fund, Withdraw, Upgrade, Approve, Reject, Status)
 */
export const useAdminCardAction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: string; data: any }) => {
      switch (type) {
        case "fund":
          return await CardsRepository.adminFund(id, data);
        case "withdraw":
          return await CardsRepository.adminWithdraw(id, data);
        case "upgrade":
          return await CardsRepository.adminUpgradeLimit(id, data);
        case "approve":
          return await CardsRepository.adminApprove(id, data);
        case "reject":
          return await CardsRepository.adminReject(id, data);
        case "status":
          return await CardsRepository.adminUpdateStatus(id, data.status);
        default:
          throw new Error("Invalid admin operation");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "cardApplications"] });
      showToast(`Action '${variables.type}' completed successfully`, "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Operation failed", "error");
    },
  });
};
