// ============================================================================
// TRANSACTIONS API - Transfer, deposit, withdrawal endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  Transaction,
  TransactionFilters,
  TransferRequest,
  RemittanceRequest,
  DepositRequest,
  WithdrawalRequest,
  Recipient,
  CreateRecipientRequest,
  Currency,
  UUID,
} from '../../../types/api.types';

const TRANSACTIONS_BASE = '/transactions';
const RECIPIENTS_BASE = '/recipients';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface TransactionFeeRequest {
  type: 'transfer' | 'withdrawal' | 'remittance';
  amount: number;
  currency: Currency;
  destinationCurrency?: Currency;
  destinationCountry?: string;
}

export interface ScheduleTransferRequest extends TransferRequest {
  scheduledDate: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: string;
}

// ============================================================================
// TRANSACTIONS API FUNCTIONS
// ============================================================================

export const transactionsApi = {
  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  /**
   * Get all transactions with filters
   */
  getAll: async (params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      TRANSACTIONS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getById: async (transactionId: UUID): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/${transactionId}`
    );
    return response.data;
  },

  /**
   * Get transaction by reference
   */
  getByReference: async (reference: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/reference/${reference}`
    );
    return response.data;
  },

  /**
   * Get recent transactions
   */
  getRecent: async (limit?: number): Promise<ApiResponse<Transaction[]>> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      `${TRANSACTIONS_BASE}/recent`,
      { params: { limit } }
    );
    return response.data;
  },

  // ==========================================================================
  // TRANSFERS
  // ==========================================================================

  /**
   * Internal transfer between accounts
   */
  transfer: async (data: TransferRequest): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/transfer`,
      data
    );
    return response.data;
  },

  /**
   * Transfer to another user
   */
  transferToUser: async (data: {
    sourceAccountId: UUID;
    recipientEmail: string;
    amount: number;
    currency: Currency;
    description?: string;
    pin: string;
  }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/transfer/user`,
      data
    );
    return response.data;
  },

  /**
   * Schedule a recurring transfer
   */
  scheduleTransfer: async (data: ScheduleTransferRequest): Promise<ApiResponse<{
    transaction: Transaction;
    scheduleId: UUID;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      transaction: Transaction;
      scheduleId: UUID;
    }>>(`${TRANSACTIONS_BASE}/transfer/schedule`, data);
    return response.data;
  },

  /**
   * Cancel scheduled transfer
   */
  cancelScheduledTransfer: async (scheduleId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${TRANSACTIONS_BASE}/transfer/schedule/${scheduleId}`
    );
    return response.data;
  },

  // ==========================================================================
  // REMITTANCE
  // ==========================================================================

  /**
   * Send international remittance
   */
  sendRemittance: async (data: RemittanceRequest): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/remittance`,
      data
    );
    return response.data;
  },

  /**
   * Get remittance quote
   */
  getRemittanceQuote: async (data: {
    amount: number;
    sourceCurrency: Currency;
    destinationCurrency: Currency;
    destinationCountry: string;
    deliveryMethod: 'bank_transfer' | 'mobile_money' | 'cash_pickup';
  }): Promise<ApiResponse<{
    sendAmount: number;
    receiveAmount: number;
    exchangeRate: number;
    fee: number;
    totalCost: number;
    estimatedDelivery: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      sendAmount: number;
      receiveAmount: number;
      exchangeRate: number;
      fee: number;
      totalCost: number;
      estimatedDelivery: string;
    }>>(`${TRANSACTIONS_BASE}/remittance/quote`, data);
    return response.data;
  },

  /**
   * Get supported remittance countries
   */
  getRemittanceCountries: async (): Promise<ApiResponse<Array<{
    code: string;
    name: string;
    currency: Currency;
    deliveryMethods: string[];
    isActive: boolean;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      code: string;
      name: string;
      currency: Currency;
      deliveryMethods: string[];
      isActive: boolean;
    }>>>(`${TRANSACTIONS_BASE}/remittance/countries`);
    return response.data;
  },

  // ==========================================================================
  // DEPOSITS
  // ==========================================================================

  /**
   * Initiate deposit
   */
  deposit: async (data: DepositRequest): Promise<ApiResponse<{
    transaction: Transaction;
    paymentUrl?: string;
    instructions?: Record<string, unknown>;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      transaction: Transaction;
      paymentUrl?: string;
      instructions?: Record<string, unknown>;
    }>>(`${TRANSACTIONS_BASE}/deposit`, data);
    return response.data;
  },

  /**
   * Get deposit methods
   */
  getDepositMethods: async (currency?: Currency): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: 'card' | 'bank_transfer' | 'mobile_money';
    currencies: Currency[];
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: 'flat' | 'percentage';
    processingTime: string;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: string;
      name: string;
      type: 'card' | 'bank_transfer' | 'mobile_money';
      currencies: Currency[];
      minAmount: number;
      maxAmount: number;
      fee: number;
      feeType: 'flat' | 'percentage';
      processingTime: string;
    }>>>(`${TRANSACTIONS_BASE}/deposit/methods`, {
      params: currency ? { currency } : undefined,
    });
    return response.data;
  },

  // ==========================================================================
  // WITHDRAWALS
  // ==========================================================================

  /**
   * Initiate withdrawal
   */
  withdraw: async (data: WithdrawalRequest): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/withdraw`,
      data
    );
    return response.data;
  },

  /**
   * Get withdrawal limits
   */
  getWithdrawalLimits: async (accountId: UUID): Promise<ApiResponse<{
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      minAmount: number;
      maxAmount: number;
      dailyLimit: number;
      dailyUsed: number;
      dailyRemaining: number;
    }>>(`${TRANSACTIONS_BASE}/withdraw/limits`, {
      params: { accountId },
    });
    return response.data;
  },

  // ==========================================================================
  // FEES
  // ==========================================================================

  /**
   * Calculate transaction fee
   */
  calculateFee: async (data: TransactionFeeRequest): Promise<ApiResponse<{
    fee: number;
    feeBreakdown: Array<{
      type: string;
      amount: number;
    }>;
    totalAmount: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      fee: number;
      feeBreakdown: Array<{
        type: string;
        amount: number;
      }>;
      totalAmount: number;
    }>>(`${TRANSACTIONS_BASE}/fees/calculate`, data);
    return response.data;
  },

  // ==========================================================================
  // RECEIPTS
  // ==========================================================================

  /**
   * Get transaction receipt
   */
  getReceipt: async (transactionId: UUID): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      downloadUrl: string;
      expiresAt: string;
    }>>(`${TRANSACTIONS_BASE}/${transactionId}/receipt`);
    return response.data;
  },

  /**
   * Send receipt via email
   */
  emailReceipt: async (transactionId: UUID, email?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${TRANSACTIONS_BASE}/${transactionId}/receipt/email`,
      { email }
    );
    return response.data;
  },
};

// ============================================================================
// RECIPIENTS API FUNCTIONS
// ============================================================================

export const recipientsApi = {
  /**
   * Get all recipients
   */
  getAll: async (params?: {
    search?: string;
    country?: string;
    isFavorite?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Recipient>> => {
    const response = await apiClient.get<PaginatedResponse<Recipient>>(
      RECIPIENTS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get recipient by ID
   */
  getById: async (recipientId: UUID): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.get<ApiResponse<Recipient>>(
      `${RECIPIENTS_BASE}/${recipientId}`
    );
    return response.data;
  },

  /**
   * Create a new recipient
   */
  create: async (data: CreateRecipientRequest): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.post<ApiResponse<Recipient>>(
      RECIPIENTS_BASE,
      data
    );
    return response.data;
  },

  /**
   * Update a recipient
   */
  update: async (
    recipientId: UUID,
    data: Partial<CreateRecipientRequest>
  ): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.patch<ApiResponse<Recipient>>(
      `${RECIPIENTS_BASE}/${recipientId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a recipient
   */
  delete: async (recipientId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${RECIPIENTS_BASE}/${recipientId}`
    );
    return response.data;
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (recipientId: UUID): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.patch<ApiResponse<Recipient>>(
      `${RECIPIENTS_BASE}/${recipientId}/favorite`
    );
    return response.data;
  },

  /**
   * Get favorite recipients
   */
  getFavorites: async (): Promise<ApiResponse<Recipient[]>> => {
    const response = await apiClient.get<ApiResponse<Recipient[]>>(
      `${RECIPIENTS_BASE}/favorites`
    );
    return response.data;
  },

  /**
   * Get recent recipients
   */
  getRecent: async (limit?: number): Promise<ApiResponse<Recipient[]>> => {
    const response = await apiClient.get<ApiResponse<Recipient[]>>(
      `${RECIPIENTS_BASE}/recent`,
      { params: { limit } }
    );
    return response.data;
  },
};

export default transactionsApi;
