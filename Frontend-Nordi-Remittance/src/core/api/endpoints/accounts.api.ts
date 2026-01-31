// ============================================================================
// ACCOUNTS API - Wallet/Account management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  Account,
  AccountSummary,
  AccountType,
  AccountStatus,
  Currency,
  Transaction,
  UUID,
} from '../../../types/api.types';

const ACCOUNTS_BASE = '/accounts';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateAccountRequest {
  accountType: AccountType;
  currency: Currency;
  name?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface AccountFilters {
  type?: AccountType;
  status?: AccountStatus;
  currency?: Currency;
  page?: number;
  limit?: number;
}

// ============================================================================
// ACCOUNTS API FUNCTIONS
// ============================================================================

export const accountsApi = {
  // ==========================================================================
  // ACCOUNT MANAGEMENT
  // ==========================================================================

  /**
   * Get account summary with all accounts and recent transactions
   */
  getSummary: async (): Promise<ApiResponse<AccountSummary>> => {
    const response = await apiClient.get<ApiResponse<AccountSummary>>(
      `${ACCOUNTS_BASE}/summary`
    );
    return response.data;
  },

  /**
   * Get all user accounts
   */
  getAll: async (params?: AccountFilters): Promise<PaginatedResponse<Account>> => {
    const response = await apiClient.get<PaginatedResponse<Account>>(
      ACCOUNTS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get account by ID
   */
  getById: async (accountId: UUID): Promise<ApiResponse<Account>> => {
    const response = await apiClient.get<ApiResponse<Account>>(
      `${ACCOUNTS_BASE}/${accountId}`
    );
    return response.data;
  },

  /**
   * Get default/primary account
   */
  getDefault: async (): Promise<ApiResponse<Account>> => {
    const response = await apiClient.get<ApiResponse<Account>>(
      `${ACCOUNTS_BASE}/default`
    );
    return response.data;
  },

  /**
   * Create a new account
   */
  create: async (data: CreateAccountRequest): Promise<ApiResponse<Account>> => {
    const response = await apiClient.post<ApiResponse<Account>>(
      ACCOUNTS_BASE,
      data
    );
    return response.data;
  },

  /**
   * Update account settings
   */
  update: async (accountId: UUID, data: UpdateAccountRequest): Promise<ApiResponse<Account>> => {
    const response = await apiClient.patch<ApiResponse<Account>>(
      `${ACCOUNTS_BASE}/${accountId}`,
      data
    );
    return response.data;
  },

  /**
   * Set account as default
   */
  setDefault: async (accountId: UUID): Promise<ApiResponse<Account>> => {
    const response = await apiClient.patch<ApiResponse<Account>>(
      `${ACCOUNTS_BASE}/${accountId}/default`
    );
    return response.data;
  },

  /**
   * Close an account
   */
  close: async (accountId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${ACCOUNTS_BASE}/${accountId}/close`
    );
    return response.data;
  },

  // ==========================================================================
  // BALANCE & TRANSACTIONS
  // ==========================================================================

  /**
   * Get account balance
   */
  getBalance: async (accountId: UUID): Promise<ApiResponse<{
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    currency: Currency;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      balance: number;
      availableBalance: number;
      pendingBalance: number;
      currency: Currency;
    }>>(`${ACCOUNTS_BASE}/${accountId}/balance`);
    return response.data;
  },

  /**
   * Get account transactions
   */
  getTransactions: async (
    accountId: UUID,
    params?: {
      startDate?: string;
      endDate?: string;
      type?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      `${ACCOUNTS_BASE}/${accountId}/transactions`,
      { params }
    );
    return response.data;
  },

  /**
   * Get account statement
   */
  getStatement: async (
    accountId: UUID,
    params: {
      startDate: string;
      endDate: string;
      format?: 'pdf' | 'csv';
    }
  ): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(
      `${ACCOUNTS_BASE}/${accountId}/statement`,
      { params }
    );
    return response.data;
  },

  // ==========================================================================
  // LIMITS
  // ==========================================================================

  /**
   * Get account limits
   */
  getLimits: async (accountId: UUID): Promise<ApiResponse<{
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      dailyLimit: number;
      dailyUsed: number;
      dailyRemaining: number;
      monthlyLimit: number;
      monthlyUsed: number;
      monthlyRemaining: number;
    }>>(`${ACCOUNTS_BASE}/${accountId}/limits`);
    return response.data;
  },

  /**
   * Request limit increase
   */
  requestLimitIncrease: async (
    accountId: UUID,
    data: {
      limitType: 'daily' | 'monthly';
      requestedLimit: number;
      reason: string;
    }
  ): Promise<ApiResponse<{ message: string; requestId: UUID }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; requestId: UUID }>>(
      `${ACCOUNTS_BASE}/${accountId}/limits/increase`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // CURRENCY
  // ==========================================================================

  /**
   * Get supported currencies
   */
  getSupportedCurrencies: async (): Promise<ApiResponse<{
    currencies: Array<{
      code: Currency;
      name: string;
      symbol: string;
      isActive: boolean;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      currencies: Array<{
        code: Currency;
        name: string;
        symbol: string;
        isActive: boolean;
      }>;
    }>>(`${ACCOUNTS_BASE}/currencies`);
    return response.data;
  },

  /**
   * Get exchange rates
   */
  getExchangeRates: async (
    baseCurrency?: Currency
  ): Promise<ApiResponse<{
    base: Currency;
    rates: Record<Currency, number>;
    updatedAt: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      base: Currency;
      rates: Record<Currency, number>;
      updatedAt: string;
    }>>(`${ACCOUNTS_BASE}/exchange-rates`, {
      params: baseCurrency ? { base: baseCurrency } : undefined,
    });
    return response.data;
  },

  /**
   * Convert currency (preview)
   */
  convertCurrency: async (data: {
    fromCurrency: Currency;
    toCurrency: Currency;
    amount: number;
  }): Promise<ApiResponse<{
    fromAmount: number;
    fromCurrency: Currency;
    toAmount: number;
    toCurrency: Currency;
    rate: number;
    fee: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      fromAmount: number;
      fromCurrency: Currency;
      toAmount: number;
      toCurrency: Currency;
      rate: number;
      fee: number;
    }>>(`${ACCOUNTS_BASE}/convert`, data);
    return response.data;
  },
};

export default accountsApi;
