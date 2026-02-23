// ============================================================================
// CARDS API - Card management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';

const CARDS_BASE = '/cards';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CardFilters {
  type?: CardType;
  status?: CardStatus;
  page?: number;
  limit?: number;
}

export interface CardTransactionFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  merchantCategory?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// CARDS API FUNCTIONS
// ============================================================================

export const cardsApi = {
  // ==========================================================================
  // CARD MANAGEMENT
  // ==========================================================================

  /**
   * Get all user cards
   */
  getAll: async (params?: CardFilters): Promise<PaginatedResponse<Card>> => {
    const response = await apiClient.get<PaginatedResponse<Card>>(
      CARDS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get card by ID
   */
  getById: async (cardId: UUID): Promise<ApiResponse<Card>> => {
    const response = await apiClient.get<ApiResponse<Card>>(
      `${CARDS_BASE}/${cardId}`
    );
    return response.data;
  },

  /**
   * Create a new card
   */
  create: async (data: CreateCardRequest): Promise<ApiResponse<Card>> => {
    const response = await apiClient.post<ApiResponse<Card>>(
      CARDS_BASE,
      data
    );
    return response.data;
  },

  /**
   * Activate a card
   */
  activate: async (cardId: UUID, data: {
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    pin: string;
  }): Promise<ApiResponse<Card>> => {
    const response = await apiClient.post<ApiResponse<Card>>(
      `${CARDS_BASE}/${cardId}/activate`,
      data
    );
    return response.data;
  },

  /**
   * Freeze/unfreeze a card
   */
  toggleFreeze: async (cardId: UUID): Promise<ApiResponse<Card>> => {
    const response = await apiClient.patch<ApiResponse<Card>>(
      `${CARDS_BASE}/${cardId}/freeze`
    );
    return response.data;
  },

  /**
   * Cancel a card
   */
  cancel: async (cardId: UUID, reason?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${CARDS_BASE}/${cardId}/cancel`,
      { reason }
    );
    return response.data;
  },

  /**
   * Request replacement card
   */
  requestReplacement: async (cardId: UUID, reason: string): Promise<ApiResponse<{
    message: string;
    newCardId: UUID;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      message: string;
      newCardId: UUID;
    }>>(`${CARDS_BASE}/${cardId}/replace`, { reason });
    return response.data;
  },

  // ==========================================================================
  // CARD DETAILS
  // ==========================================================================

  /**
   * Get full card details (sensitive)
   */
  getFullDetails: async (cardId: UUID, pin: string): Promise<ApiResponse<{
    cardNumber: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      cardNumber: string;
      cvv: string;
      expiryMonth: number;
      expiryYear: number;
    }>>(`${CARDS_BASE}/${cardId}/details`, { pin });
    return response.data;
  },

  // ==========================================================================
  // LIMITS & SETTINGS
  // ==========================================================================

  /**
   * Get card limits
   */
  getLimits: async (cardId: UUID): Promise<ApiResponse<{
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    perTransactionLimit: number;
    atmDailyLimit: number;
    atmDailyUsed: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      dailyLimit: number;
      dailyUsed: number;
      dailyRemaining: number;
      monthlyLimit: number;
      monthlyUsed: number;
      monthlyRemaining: number;
      perTransactionLimit: number;
      atmDailyLimit: number;
      atmDailyUsed: number;
    }>>(`${CARDS_BASE}/${cardId}/limits`);
    return response.data;
  },

  /**
   * Update card limits
   */
  updateLimits: async (cardId: UUID, data: CardLimitsUpdateRequest): Promise<ApiResponse<Card>> => {
    const response = await apiClient.patch<ApiResponse<Card>>(
      `${CARDS_BASE}/${cardId}/limits`,
      data
    );
    return response.data;
  },

  /**
   * Get card settings
   */
  getSettings: async (cardId: UUID): Promise<ApiResponse<{
    onlineEnabled: boolean;
    atmEnabled: boolean;
    internationalEnabled: boolean;
    contactlessEnabled: boolean;
    merchantCategories: Record<string, boolean>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      onlineEnabled: boolean;
      atmEnabled: boolean;
      internationalEnabled: boolean;
      contactlessEnabled: boolean;
      merchantCategories: Record<string, boolean>;
    }>>(`${CARDS_BASE}/${cardId}/settings`);
    return response.data;
  },

  /**
   * Update card settings
   */
  updateSettings: async (cardId: UUID, data: CardSettingsUpdateRequest): Promise<ApiResponse<Card>> => {
    const response = await apiClient.patch<ApiResponse<Card>>(
      `${CARDS_BASE}/${cardId}/settings`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // PIN MANAGEMENT
  // ==========================================================================

  /**
   * Change card PIN
   */
  changePin: async (cardId: UUID, data: {
    currentPin: string;
    newPin: string;
    confirmPin: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${CARDS_BASE}/${cardId}/pin/change`,
      data
    );
    return response.data;
  },

  /**
   * Reset card PIN (sends OTP)
   */
  resetPin: async (cardId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${CARDS_BASE}/${cardId}/pin/reset`
    );
    return response.data;
  },

  /**
   * Set new PIN after reset
   */
  setNewPin: async (cardId: UUID, data: {
    otp: string;
    newPin: string;
    confirmPin: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${CARDS_BASE}/${cardId}/pin/set`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  /**
   * Get card transactions
   */
  getTransactions: async (
    cardId: UUID,
    params?: CardTransactionFilters
  ): Promise<PaginatedResponse<CardTransaction>> => {
    const response = await apiClient.get<PaginatedResponse<CardTransaction>>(
      `${CARDS_BASE}/${cardId}/transactions`,
      { params }
    );
    return response.data;
  },

  /**
   * Dispute a card transaction
   */
  disputeTransaction: async (
    cardId: UUID,
    transactionId: UUID,
    data: {
      reason: string;
      description: string;
    }
  ): Promise<ApiResponse<{ disputeId: UUID; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ disputeId: UUID; message: string }>>(
      `${CARDS_BASE}/${cardId}/transactions/${transactionId}/dispute`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // PHYSICAL CARD
  // ==========================================================================

  /**
   * Request physical card delivery
   */
  requestPhysicalCard: async (data: {
    accountId: UUID;
    brand?: 'visa' | 'mastercard';
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    expedited?: boolean;
  }): Promise<ApiResponse<{
    card: Card;
    trackingNumber?: string;
    estimatedDelivery: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      card: Card;
      trackingNumber?: string;
      estimatedDelivery: string;
    }>>(`${CARDS_BASE}/physical/request`, data);
    return response.data;
  },

  /**
   * Track physical card delivery
   */
  trackDelivery: async (cardId: UUID): Promise<ApiResponse<{
    status: 'processing' | 'shipped' | 'in_transit' | 'delivered';
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    updates: Array<{
      status: string;
      location: string;
      timestamp: string;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      status: 'processing' | 'shipped' | 'in_transit' | 'delivered';
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
      updates: Array<{
        status: string;
        location: string;
        timestamp: string;
      }>;
    }>>(`${CARDS_BASE}/${cardId}/delivery/track`);
    return response.data;
  },
};

export default cardsApi;
