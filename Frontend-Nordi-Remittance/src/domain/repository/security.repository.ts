import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// SECURITY API - 2FA, sessions, and security settings endpoints
// ============================================================================

import apiClient, { ApiResponse } from "@core/api/client";


// ============================================================================
// SECURITY API FUNCTIONS
// ============================================================================

export const SecurityRepository = {
  // ==========================================================================
  // SECURITY SETTINGS
  // ==========================================================================

  /**
   * Get security settings
   */
  getSettings: async (): Promise<ApiResponse<SecuritySettings>> => {
    const response = await apiClient.get<ApiResponse<SecuritySettings>>(ApiEndpoints.securitySettings);
    return response.data;
  },

  /**
   * Update security settings
   */
  updateSettings: async (
    data: Partial<Omit<SecuritySettings, "trustedDevices">>,
  ): Promise<ApiResponse<SecuritySettings>> => {
    const response = await apiClient.patch<ApiResponse<SecuritySettings>>(ApiEndpoints.securitySettings, data);
    return response.data;
  },

  // ==========================================================================
  // TWO-FACTOR AUTHENTICATION
  // ==========================================================================

  /**
   * Enable 2FA - Step 1: Get setup data
   */
  enable2FASetup: async (
    method: "sms" | "email" | "authenticator",
  ): Promise<
    ApiResponse<{
      method: string;
      secret?: string; // For authenticator
      qrCode?: string; // For authenticator
      phone?: string; // For SMS (masked)
      email?: string; // For email (masked)
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        method: string;
        secret?: string;
        qrCode?: string;
        phone?: string;
        email?: string;
      }>
    >(ApiEndpoints.security2FaSetup, { method });
    return response.data;
  },

  /**
   * Enable 2FA - Step 2: Verify and activate
   */
  enable2FAVerify: async (data: {
    method: "sms" | "email" | "authenticator";
    code: string;
  }): Promise<
    ApiResponse<{
      enabled: boolean;
      backupCodes: string[];
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        enabled: boolean;
        backupCodes: string[];
      }>
    >(ApiEndpoints.security2FaVerify, data);
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (data: { code: string; password: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.security2FaDisable, data);
    return response.data;
  },

  /**
   * Change 2FA method
   */
  change2FAMethod: async (data: {
    currentCode: string;
    newMethod: "sms" | "email" | "authenticator";
  }): Promise<
    ApiResponse<{
      method: string;
      secret?: string;
      qrCode?: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        method: string;
        secret?: string;
        qrCode?: string;
      }>
    >(ApiEndpoints.security2FaChangeMethod, data);
    return response.data;
  },

  /**
   * Get backup codes
   */
  getBackupCodes: async (
    password: string,
  ): Promise<
    ApiResponse<{
      codes: string[];
      generatedAt: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        codes: string[];
        generatedAt: string;
      }>
    >(ApiEndpoints.security2FaBackupCodes, { password });
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (
    password: string,
  ): Promise<
    ApiResponse<{
      codes: string[];
      generatedAt: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        codes: string[];
        generatedAt: string;
      }>
    >(ApiEndpoints.security2FaBackupCodesRegenerate, { password });
    return response.data;
  },

  // ==========================================================================
  // SESSIONS
  // ==========================================================================

  /**
   * Get all active sessions
   */
  getSessions: async (): Promise<ApiResponse<SecuritySession[]>> => {
    const response = await apiClient.get<ApiResponse<SecuritySession[]>>(ApiEndpoints.securitySessions);
    return response.data;
  },

  /**
   * Get current session
   */
  getCurrentSession: async (): Promise<ApiResponse<SecuritySession>> => {
    const response = await apiClient.get<ApiResponse<SecuritySession>>(ApiEndpoints.securitySessionCurrent);
    return response.data;
  },

  /**
   * Revoke a session
   */
  revokeSession: async (sessionId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.securitySession(sessionId));
    return response.data;
  },

  /**
   * Revoke all other sessions
   */
  revokeAllOtherSessions: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      ApiEndpoints.securitySessionsOthers,
    );
    return response.data;
  },

  // ==========================================================================
  // TRUSTED DEVICES
  // ==========================================================================

  /**
   * Get trusted devices
   */
  getTrustedDevices: async (): Promise<ApiResponse<TrustedDevice[]>> => {
    const response = await apiClient.get<ApiResponse<TrustedDevice[]>>(ApiEndpoints.securityTrustedDevices);
    return response.data;
  },

  /**
   * Add trusted device
   */
  addTrustedDevice: async (data: {
    name: string;
    code: string; // 2FA code for verification
  }): Promise<ApiResponse<TrustedDevice>> => {
    const response = await apiClient.post<ApiResponse<TrustedDevice>>(ApiEndpoints.securityTrustedDevices, data);
    return response.data;
  },

  /**
   * Remove trusted device
   */
  removeTrustedDevice: async (deviceId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.securityTrustedDevice(deviceId),
    );
    return response.data;
  },

  /**
   * Remove all trusted devices
   */
  removeAllTrustedDevices: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      ApiEndpoints.securityTrustedDevices,
    );
    return response.data;
  },

  // ==========================================================================
  // TRANSACTION PIN
  // ==========================================================================

  /**
   * Set transaction PIN
   */
  setTransactionPin: async (data: {
    pin: string;
    confirmPin: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.securityTransactionPin, data);
    return response.data;
  },

  /**
   * Change transaction PIN
   */
  changeTransactionPin: async (data: {
    currentPin: string;
    newPin: string;
    confirmPin: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(ApiEndpoints.securityTransactionPin, data);
    return response.data;
  },

  /**
   * Reset transaction PIN (sends OTP)
   */
  resetTransactionPin: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.securityTransactionPinReset);
    return response.data;
  },

  /**
   * Confirm transaction PIN reset with OTP
   */
  confirmTransactionPinReset: async (data: {
    otp: string;
    newPin: string;
    confirmPin: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      ApiEndpoints.securityTransactionPinResetConfirm,
      data,
    );
    return response.data;
  },

  /**
   * Verify transaction PIN
   */
  verifyTransactionPin: async (pin: string): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ valid: boolean }>>(ApiEndpoints.securityTransactionPinVerify, {
      pin,
    });
    return response.data;
  },

  // ==========================================================================
  // ACTIVITY LOG
  // ==========================================================================

  /**
   * Request security review
   */
  requestSecurityReview: async (data: {
    reason: string;
    contactMethod: "email" | "phone";
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.securityReviewRequest, data);
    return response.data;
  },

  /**
   * Get security activity log
   */
  getActivityLog: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      activities: Array<{
        id: UUID;
        type: string;
        description: string;
        ipAddress: string;
        location?: string;
        deviceInfo: string;
        timestamp: string;
        status: "success" | "failure";
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        activities: Array<{
          id: UUID;
          type: string;
          description: string;
          ipAddress: string;
          location?: string;
          deviceInfo: string;
          timestamp: string;
          status: "success" | "failure";
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>
    >(ApiEndpoints.securityActivityLog, { params });
    return response.data;
  },
};

export default SecurityRepository;
