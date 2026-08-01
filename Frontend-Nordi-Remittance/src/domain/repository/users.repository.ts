import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// USERS API - User profile and management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
}

export interface UpdateAddressRequest extends Partial<Address> {}

export interface UpdateEmploymentRequest extends Partial<EmploymentInfo> {}

export interface AddBankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency: string;
  isPrimary?: boolean;
}

// ============================================================================
// USERS API FUNCTIONS
// ============================================================================

export const UsersRepository = {
  // ==========================================================================
  // PROFILE
  // ==========================================================================

  /**
   * Get current user profile with full details
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(ApiEndpoints.userProfile);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(ApiEndpoints.userProfile, data);
    return response.data;
  },

  /**
   * Upload/update profile avatar
   */
  updateAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(ApiEndpoints.userAvatar, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete profile avatar
   */
  deleteAvatar: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.userAvatar);
    return response.data;
  },

  // ==========================================================================
  // ADDRESS
  // ==========================================================================

  /**
   * Get user address
   */
  getAddress: async (): Promise<ApiResponse<Address>> => {
    const response = await apiClient.get<ApiResponse<Address>>(ApiEndpoints.userAddress);
    return response.data;
  },

  /**
   * Update user address
   */
  updateAddress: async (data: UpdateAddressRequest): Promise<ApiResponse<Address>> => {
    const response = await apiClient.put<ApiResponse<Address>>(ApiEndpoints.userAddress, data);
    return response.data;
  },

  // ==========================================================================
  // EMPLOYMENT
  // ==========================================================================

  /**
   * Get employment information
   */
  getEmployment: async (): Promise<ApiResponse<EmploymentInfo>> => {
    const response = await apiClient.get<ApiResponse<EmploymentInfo>>("/users/employment");
    return response.data;
  },

  /**
   * Update employment information
   */
  updateEmployment: async (data: UpdateEmploymentRequest): Promise<ApiResponse<EmploymentInfo>> => {
    const response = await apiClient.put<ApiResponse<EmploymentInfo>>(ApiEndpoints.userEmployment, data);
    return response.data;
  },

  // ==========================================================================
  // BANK ACCOUNTS
  // ==========================================================================

  /**
   * Get user's linked bank accounts
   */
  getBankAccounts: async (): Promise<ApiResponse<BankAccount[]>> => {
    const response = await apiClient.get<ApiResponse<BankAccount[]>>(ApiEndpoints.userBankAccounts);
    return response.data;
  },

  /**
   * Add a new bank account
   */
  addBankAccount: async (data: AddBankAccountRequest): Promise<ApiResponse<BankAccount>> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>(ApiEndpoints.userBankAccounts, data);
    return response.data;
  },

  /**
   * Update a bank account
   */
  updateBankAccount: async (
    accountId: UUID,
    data: Partial<AddBankAccountRequest>,
  ): Promise<ApiResponse<BankAccount>> => {
    const response = await apiClient.patch<ApiResponse<BankAccount>>(ApiEndpoints.userBankAccount(accountId), data);
    return response.data;
  },

  /**
   * Delete a bank account
   */
  deleteBankAccount: async (accountId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      "/users/bank-accounts/" + accountId,
    );
    return response.data;
  },

  /**
   * Set a bank account as primary
   */
  setPrimaryBankAccount: async (accountId: UUID): Promise<ApiResponse<BankAccount>> => {
    const response = await apiClient.patch<ApiResponse<BankAccount>>(ApiEndpoints.userBankAccountPrimary(accountId));
    return response.data;
  },

  /**
   * Verify a bank account
   */
  verifyBankAccount: async (accountId: UUID, amounts: [number, number]): Promise<ApiResponse<BankAccount>> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>(ApiEndpoints.userBankAccountVerify(accountId), {
      amounts,
    });
    return response.data;
  },

  // ==========================================================================
  // NOTIFICATION PREFERENCES
  // ==========================================================================

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      ApiEndpoints.userNotifications,
    );
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (
    data: Partial<NotificationPreferences>,
  ): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      ApiEndpoints.userPreferencesNotifications,
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // ACCOUNT MANAGEMENT
  // ==========================================================================

  /**
   * Delete user account (soft delete)
   */
  deleteAccount: async (password: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.userDeleteAccount, {
      password,
    });
    return response.data;
  },

  /**
   * Export user data (GDPR)
   */
  exportData: async (): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const response = await apiClient.post<ApiResponse<{ downloadUrl: string }>>(ApiEndpoints.userExportData);
    return response.data;
  },

  // ==========================================================================
  // REFERRALS
  // ==========================================================================

  /**
   * Get referral stats
   */
  getReferralStats: async (): Promise<
    ApiResponse<{
      referralCode: string;
      totalReferrals: number;
      successfulReferrals: number;
      pendingReferrals: number;
      earnings: number;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        referralCode: string;
        totalReferrals: number;
        successfulReferrals: number;
        pendingReferrals: number;
        earnings: number;
      }>
    >(ApiEndpoints.userReferrals);
    return response.data;
  },

  /**
   * Get referred users list
   */
  getReferredUsers: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{ id: UUID; email: string; status: string; joinedAt: string }>> => {
    const response = await apiClient.get<
      PaginatedResponse<{
        id: UUID;
        email: string;
        status: string;
        joinedAt: string;
      }>
    >(ApiEndpoints.userReferralsList, { params });
    return response.data;
  },
};

export default UsersRepository;
