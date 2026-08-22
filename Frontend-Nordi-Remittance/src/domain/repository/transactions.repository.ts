import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// TRANSACTIONS API - Transfer, deposit, withdrawal endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface TransactionFeeRequest {
  type: "transfer" | "withdrawal" | "remittance";
  amount: number;
  currency: Currency;
  destinationCurrency?: Currency;
  destinationCountry?: string;
}

export interface ScheduleTransferRequest extends TransferRequest {
  scheduledDate: string;
  frequency?: "once" | "daily" | "weekly" | "biweekly" | "monthly";
  endDate?: string;
}

// ============================================================================
// TRANSACTIONS API FUNCTIONS
// ============================================================================

export const TransactionsRepository = {
  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  /**
   * Get all transactions with filters
   */
  getAll: async (params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>("/transactions", { params });
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getById: async (transactionId: UUID): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(ApiEndpoints.transaction(transactionId));
    return response.data;
  },

  /**
   * Get transaction by reference
   */
  getByReference: async (reference: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(ApiEndpoints.transactionByReference(reference));
    return response.data;
  },

  /**
   * Get recent transactions
   */
  getRecent: async (limit?: number): Promise<ApiResponse<Transaction[]>> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>("/transactions", {
      params: { sort: "-createdAt", limit },
    });
    return response.data;
  },

  // ==========================================================================
  // ADMIN TRANSACTIONS
  // ==========================================================================

  /**
   * Get all transactions (admin only)
   */
  getAllAdminTransactions: async (params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(ApiEndpoints.transactionsAdminAll, { params });
    return response.data;
  },

  /**
   * Get all pending transactions for review
   */
  getPendingTransactions: async (params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(ApiEndpoints.adminOpsTransactionsPending, { params });
    return response.data;
  },

  /**
   * Approve a pending transaction
   */
  approveTransaction: async (transactionId: string, data?: { note?: string }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(ApiEndpoints.adminOpsTransactionApprove(transactionId), data);
    return response.data;
  },

  /**
   * Reject a pending transaction
   */
  rejectTransaction: async (transactionId: string, data: { reason: string }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(ApiEndpoints.adminOpsTransactionReject(transactionId), data);
    return response.data;
  },

  /**
   * Reverse/refund a completed transaction
   */
  reverseTransaction: async (transactionId: string, data: { reason: string }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(ApiEndpoints.adminOpsTransactionReverse(transactionId), data);
    return response.data;
  },


  // ==========================================================================
  // TRANSFERS
  // ==========================================================================

  /**
   * Internal transfer between accounts
   */
  transfer: async (data: TransferRequest): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(ApiEndpoints.transactionsTransfer, data);
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
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/transfer/user`, data);
    return response.data;
  },

  /**
   * Schedule a recurring transfer
   */
  scheduleTransfer: async (
    data: ScheduleTransferRequest,
  ): Promise<
    ApiResponse<{
      transaction: Transaction;
      scheduleId: UUID;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        transaction: Transaction;
        scheduleId: UUID;
      }>
    >(`/transactions/transfer/schedule`, data);
    return response.data;
  },

  /**
   * Cancel scheduled transfer
   */
  cancelScheduledTransfer: async (scheduleId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/transactions/transfer/schedule/${scheduleId}`,
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
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/remittance`, data);
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
    deliveryMethod: "bank_transfer" | "mobile_money" | "cash_pickup";
  }): Promise<
    ApiResponse<{
      sendAmount: number;
      receiveAmount: number;
      exchangeRate: number;
      fee: number;
      totalCost: number;
      estimatedDelivery: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        sendAmount: number;
        receiveAmount: number;
        exchangeRate: number;
        fee: number;
        totalCost: number;
        estimatedDelivery: string;
      }>
    >(`/transactions/remittance/quote`, data);
    return response.data;
  },

  /**
   * Get supported remittance countries
   */
  getRemittanceCountries: async (): Promise<
    ApiResponse<
      Array<{
        code: string;
        name: string;
        currency: Currency;
        deliveryMethods: string[];
        isActive: boolean;
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          code: string;
          name: string;
          currency: Currency;
          deliveryMethods: string[];
          isActive: boolean;
        }>
      >
    >(`/transactions/remittance/countries`);
    return response.data;
  },

  // ==========================================================================
  // DEPOSITS
  // ==========================================================================

  /**
   * Initiate deposit
   */
  deposit: async (
    data: DepositRequest,
  ): Promise<
    ApiResponse<{
      transaction: Transaction;
      paymentUrl?: string;
      instructions?: Record<string, unknown>;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        transaction: Transaction;
        paymentUrl?: string;
        instructions?: Record<string, unknown>;
      }>
    >(ApiEndpoints.transactionsDeposit, data);
    return response.data;
  },

  /**
   * Get deposit methods
   */
  getDepositMethods: async (
    currency?: Currency,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        type: "card" | "bank_transfer" | "mobile_money";
        currencies: Currency[];
        minAmount: number;
        maxAmount: number;
        fee: number;
        feeType: "flat" | "percentage";
        processingTime: string;
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          name: string;
          type: "card" | "bank_transfer" | "mobile_money";
          currencies: Currency[];
          minAmount: number;
          maxAmount: number;
          fee: number;
          feeType: "flat" | "percentage";
          processingTime: string;
        }>
      >
    >(`/transactions/deposit/methods`, {
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
    const response = await apiClient.post<ApiResponse<Transaction>>(ApiEndpoints.transactionsWithdraw, data);
    return response.data;
  },

  /**
   * Get withdrawal limits
   */
  getWithdrawalLimits: async (
    accountId: UUID,
  ): Promise<
    ApiResponse<{
      minAmount: number;
      maxAmount: number;
      dailyLimit: number;
      dailyUsed: number;
      dailyRemaining: number;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        minAmount: number;
        maxAmount: number;
        dailyLimit: number;
        dailyUsed: number;
        dailyRemaining: number;
      }>
    >(`/transactions/withdraw/limits`, {
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
  calculateFee: async (
    data: TransactionFeeRequest,
  ): Promise<
    ApiResponse<{
      fee: number;
      feeBreakdown: Array<{
        type: string;
        amount: number;
      }>;
      totalAmount: number;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        fee: number;
        feeBreakdown: Array<{
          type: string;
          amount: number;
        }>;
        totalAmount: number;
      }>
    >(`/transactions/fees/calculate`, data);
    return response.data;
  },

  // ==========================================================================
  // RECEIPTS
  // ==========================================================================

  /**
   * Get transaction receipt
   */
  getReceipt: async (
    transactionId: UUID,
  ): Promise<
    ApiResponse<{
      downloadUrl: string;
      expiresAt: string;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        downloadUrl: string;
        expiresAt: string;
      }>
    >(`/transactions/${transactionId}/receipt`);
    return response.data;
  },

  /**
   * Send receipt via email
   */
  emailReceipt: async (transactionId: UUID, email?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/transactions/${transactionId}/receipt/email`,
      { email },
    );
    return response.data;
  },
};

// ============================================================================
// RECIPIENTS API FUNCTIONS
// ============================================================================

export const RecipientsRepository = {
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
    const response = await apiClient.get<PaginatedResponse<Recipient>>("/recipients", { params });
    return response.data;
  },

  /**
   * Get recipient by ID
   */
  getById: async (recipientId: UUID): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.get<ApiResponse<Recipient>>(`/recipients/${recipientId}`);
    return response.data;
  },

  /**
   * Create a new recipient
   */
  create: async (data: CreateRecipientRequest): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.post<ApiResponse<Recipient>>("/recipients", data);
    return response.data;
  },

  /**
   * Update a recipient
   */
  update: async (recipientId: UUID, data: Partial<CreateRecipientRequest>): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.patch<ApiResponse<Recipient>>(`/recipients/${recipientId}`, data);
    return response.data;
  },

  /**
   * Delete a recipient
   */
  delete: async (recipientId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/recipients/${recipientId}`);
    return response.data;
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (recipientId: UUID): Promise<ApiResponse<Recipient>> => {
    const response = await apiClient.patch<ApiResponse<Recipient>>(`/recipients/${recipientId}/favorite`);
    return response.data;
  },

  /**
   * Get favorite recipients
   */
  getFavorites: async (): Promise<ApiResponse<Recipient[]>> => {
    const response = await apiClient.get<ApiResponse<Recipient[]>>(`/recipients/favorites`);
    return response.data;
  },

  /**
   * Get recent recipients
   */
  getRecent: async (limit?: number): Promise<ApiResponse<Recipient[]>> => {
    const response = await apiClient.get<ApiResponse<Recipient[]>>(`/recipients/recent`, { params: { limit } });
    return response.data;
  },
};

export default TransactionsRepository;
