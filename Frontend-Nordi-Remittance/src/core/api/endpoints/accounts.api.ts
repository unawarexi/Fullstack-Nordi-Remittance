// ============================================================================
// ACCOUNTS API - Wallet/Account management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "../client";
const ACCOUNTS_BASE = "/accounts";

// ============================================================================
// ACCOUNTS API FUNCTIONS
// ============================================================================

export const accountsApi = {
  // ==========================================================================
  // WALLET MANAGEMENT (User)
  // ==========================================================================

  getWallets: async (): Promise<ApiResponse<Wallet[]>> => {
    const response = await apiClient.get<ApiResponse<Wallet[]>>(
      `${ACCOUNTS_BASE}/wallets`,
    );
    return response.data;
  },

  createWallet: async (data: {
    walletType?: "personal" | "business";
    currency: Currency;
  }): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.post<ApiResponse<Wallet>>(
      `${ACCOUNTS_BASE}/wallets`,
      data,
    );
    return response.data;
  },

  getWalletById: async (walletId: UUID): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.get<ApiResponse<Wallet>>(
      `${ACCOUNTS_BASE}/wallets/${walletId}`,
    );
    return response.data;
  },

  updateWallet: async (
    walletId: UUID,
    data: Partial<Wallet>,
  ): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>(
      `${ACCOUNTS_BASE}/wallets/${walletId}`,
      data,
    );
    return response.data;
  },

  closeWallet: async (
    walletId: UUID,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${ACCOUNTS_BASE}/wallets/${walletId}/close`,
    );
    return response.data;
  },

  getBalanceHistory: async (
    walletId: UUID,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<LedgerEntry>> => {
    const response = await apiClient.get<PaginatedResponse<LedgerEntry>>(
      `${ACCOUNTS_BASE}/wallets/${walletId}/history`,
      { params },
    );
    return response.data;
  },

  // ==========================================================================
  // ACCOUNT INFO ROUTES
  // ==========================================================================

  getAccountLimits: async (): Promise<ApiResponse<AccountLimit[]>> => {
    const response = await apiClient.get<ApiResponse<AccountLimit[]>>(
      `${ACCOUNTS_BASE}/limits`,
    );
    return response.data;
  },

  getAccountSummary: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ACCOUNTS_BASE}/summary`,
    );
    return response.data;
  },

  // ==========================================================================
  // BENEFICIARY ROUTES
  // ==========================================================================

  getBeneficiaries: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `${ACCOUNTS_BASE}/beneficiaries`,
    );
    return response.data;
  },

  addBeneficiary: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ACCOUNTS_BASE}/beneficiaries`,
      data,
    );
    return response.data;
  },

  removeBeneficiary: async (
    beneficiaryId: UUID,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${ACCOUNTS_BASE}/beneficiaries/${beneficiaryId}`,
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN ROUTES
  // ==========================================================================

  getAllWallets: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Wallet>> => {
    const response = await apiClient.get<PaginatedResponse<Wallet>>(
      `${ACCOUNTS_BASE}/admin/wallets`,
      { params },
    );
    return response.data;
  },

  updateWalletStatus: async (
    walletId: UUID,
    data: { status: "active" | "suspended" | "closed"; reason: string },
  ): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>(
      `${ACCOUNTS_BASE}/admin/wallets/${walletId}/status`,
      data,
    );
    return response.data;
  },
};

export default accountsApi;
