// ============================================================================
// ACCOUNTS API - Wallet/Account management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";
import { ApiEndpoints } from "@core/api/endpoint";

// ============================================================================
// ACCOUNTS API FUNCTIONS
// ============================================================================

export const AccountsRepository = {
  // ==========================================================================
  // WALLET MANAGEMENT (User)
  // ==========================================================================

  getWallets: async (): Promise<ApiResponse<Wallet[]>> => {
    const response = await apiClient.get<ApiResponse<Wallet[]>>(ApiEndpoints.accountWallets);
    return response.data;
  },

  createWallet: async (data: {
    walletType?: "personal" | "business";
    currency: Currency;
  }): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.post<ApiResponse<Wallet>>(ApiEndpoints.accountWallets, data);
    return response.data;
  },

  getWalletById: async (walletId: UUID): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.get<ApiResponse<Wallet>>(ApiEndpoints.accountWallet(walletId));
    return response.data;
  },

  updateWallet: async (walletId: UUID, data: Partial<Wallet>): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>(ApiEndpoints.accountWallet(walletId), data);
    return response.data;
  },

  closeWallet: async (walletId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      ApiEndpoints.accountWalletClose(walletId)
    );
    return response.data;
  },

  getBalanceHistory: async (
    walletId: UUID,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<LedgerEntry>> => {
    const response = await apiClient.get<PaginatedResponse<LedgerEntry>>(
      ApiEndpoints.accountWalletHistory(walletId),
      { params },
    );
    return response.data;
  },

  // ==========================================================================
  // ACCOUNT INFO ROUTES
  // ==========================================================================

  getAccountLimits: async (): Promise<ApiResponse<AccountLimit[]>> => {
    const response = await apiClient.get<ApiResponse<AccountLimit[]>>(ApiEndpoints.accountLimits);
    return response.data;
  },

  getAccountSummary: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.accountSummary);
    return response.data;
  },

  getConsolidatedLimits: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.accountConsolidatedLimits);
    return response.data;
  },

  getCreditScore: async (): Promise<ApiResponse<{ score: number }>> => {
    const response = await apiClient.get<ApiResponse<{ score: number }>>(ApiEndpoints.accountCreditScore);
    return response.data;
  },

  // ==========================================================================
  // ACCOUNT APPLICATIONS ROUTES
  // ==========================================================================

  getUserApplications: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(ApiEndpoints.accountApplications);
    return response.data;
  },

  applyForAccount: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.accountApplicationsApply, data);
    return response.data;
  },

  cancelApplication: async (applicationId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.accountApplicationCancel(applicationId)
    );
    return response.data;
  },

  // ==========================================================================
  // BENEFICIARY ROUTES
  // ==========================================================================

  getBeneficiaries: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(ApiEndpoints.accountBeneficiaries);
    return response.data;
  },

  addBeneficiary: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.accountBeneficiaries, data);
    return response.data;
  },

  removeBeneficiary: async (beneficiaryId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.accountBeneficiary(beneficiaryId),
    );
    return response.data;
  },

  // ==========================================================================
  // WALLET / PRODUCT LINKING
  // ==========================================================================

  getWalletProducts: async (walletId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.accountWalletProducts(walletId));
    return response.data;
  },

  linkCardToWallet: async (walletId: UUID, cardId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.accountWalletCardLink(walletId, cardId));
    return response.data;
  },

  unlinkCardFromWallet: async (walletId: UUID, cardId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(ApiEndpoints.accountWalletCardUnlink(walletId, cardId));
    return response.data;
  },

  setCardFundingSource: async (cardId: UUID, data: { walletId: UUID }): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(ApiEndpoints.accountCardFundingSource(cardId), data);
    return response.data;
  },

  // ==========================================================================
  // ADMIN ROUTES
  // ==========================================================================

  getAllWallets: async (params?: { page?: number; limit?: number; query?: string }): Promise<PaginatedResponse<Wallet>> => {
    const response = await apiClient.get<PaginatedResponse<Wallet>>(ApiEndpoints.accountAdminWallets, {
      params,
    });
    return response.data;
  },

  updateWalletStatus: async (
    walletId: UUID,
    data: { status: "active" | "suspended" | "closed"; reason: string },
  ): Promise<ApiResponse<Wallet>> => {
    const response = await apiClient.patch<ApiResponse<Wallet>>(
      ApiEndpoints.accountAdminWalletStatus(walletId),
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN — ACCOUNT APPLICATIONS
  // ==========================================================================

  getPendingApplications: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      ApiEndpoints.accountAdminApplicationsPending,
    );
    return response.data;
  },

  approveApplication: async (applicationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      ApiEndpoints.accountAdminApplicationApprove(applicationId),
    );
    return response.data;
  },

  rejectApplication: async (applicationId: string, reason: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      ApiEndpoints.accountAdminApplicationReject(applicationId),
      { reason },
    );
    return response.data;
  },
};

export default AccountsRepository;
