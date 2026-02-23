// ============================================================================
// CARDS HOOKS - TanStack Query hooks for card management
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface CardFilters {
  type?: CardType;
  status?: CardStatus;
  page?: number;
  limit?: number;
}

interface CardTransactionFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  merchantCategory?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all user cards
 */
export const useCards = (filters?: CardFilters) => {
  return useQuery({
    queryKey: queryKeys.cards.list(filters),
    queryFn: async () => {
      const response = await cardsApi.getAll(filters);
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
      const response = await cardsApi.getById(cardId);
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
      const response = await cardsApi.getLimits(cardId);
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
      const response = await cardsApi.getSettings(cardId);
      return response.data;
    },
    enabled: !!cardId,
  });
};

/**
 * Get card transactions
 */
export const useCardTransactions = (
  cardId: UUID,
  filters?: CardTransactionFilters,
) => {
  return useQuery({
    queryKey: queryKeys.cards.transactions(cardId, filters),
    queryFn: async () => {
      const response = await cardsApi.getTransactions(cardId, filters);
      return response;
    },
    enabled: !!cardId,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create card mutation
 */
export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: CreateCardRequest) => {
      const response = await cardsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      showToast("Card created successfully", "success");
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
      const response = await cardsApi.activate(cardId, data);
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
      const response = await cardsApi.toggleFreeze(cardId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.list() });
      showToast(
        data.status === "frozen" ? "Card frozen" : "Card unfrozen",
        "success",
      );
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
    mutationFn: async ({
      cardId,
      reason,
    }: {
      cardId: UUID;
      reason?: string;
    }) => {
      const response = await cardsApi.cancel(cardId, reason);
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
    mutationFn: async ({
      cardId,
      reason,
    }: {
      cardId: UUID;
      reason: string;
    }) => {
      const response = await cardsApi.requestReplacement(cardId, reason);
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
      const response = await cardsApi.getFullDetails(cardId, pin);
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
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: CardLimitsUpdateRequest;
    }) => {
      const response = await cardsApi.updateLimits(cardId, data);
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
 * Update card settings mutation
 */
export const useUpdateCardSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: UUID;
      data: CardSettingsUpdateRequest;
    }) => {
      const response = await cardsApi.updateSettings(cardId, data);
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
      const response = await cardsApi.changePin(cardId, data);
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
      const response = await cardsApi.resetPin(cardId);
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
      const response = await cardsApi.setNewPin(cardId, data);
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
      const response = await cardsApi.disputeTransaction(
        cardId,
        transactionId,
        data,
      );
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
      accountId: UUID;
      brand?: "visa" | "mastercard";
      deliveryAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
      };
      expedited?: boolean;
    }) => {
      const response = await cardsApi.requestPhysicalCard(data);
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
      const response = await cardsApi.trackDelivery(cardId);
      return response.data;
    },
    enabled: !!cardId,
    refetchInterval: 60000, // Refresh every minute
  });
};
