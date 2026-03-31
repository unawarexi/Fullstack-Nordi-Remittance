// ============================================================================
// SECURITY API - 2FA, sessions, and security settings endpoints
// ============================================================================

import apiClient, { ApiResponse } from '../client';

const SECURITY_BASE = '/security';

// ============================================================================
// SECURITY API FUNCTIONS
// ============================================================================

export const securityApi = {
  // ==========================================================================
  // SECURITY SETTINGS
  // ==========================================================================

  /**
   * Get security settings
   */
  getSettings: async (): Promise<ApiResponse<SecuritySettings>> => {
    const response = await apiClient.get<ApiResponse<SecuritySettings>>(
      `${SECURITY_BASE}/settings`
    );
    return response.data;
  },

  /**
   * Update security settings
   */
  updateSettings: async (
    data: Partial<Omit<SecuritySettings, 'trustedDevices'>>
  ): Promise<ApiResponse<SecuritySettings>> => {
    const response = await apiClient.patch<ApiResponse<SecuritySettings>>(
      `${SECURITY_BASE}/settings`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // TWO-FACTOR AUTHENTICATION
  // ==========================================================================

  /**
   * Enable 2FA - Step 1: Get setup data
   */
  enable2FASetup: async (method: 'sms' | 'email' | 'authenticator'): Promise<ApiResponse<{
    method: string;
    secret?: string; // For authenticator
    qrCode?: string; // For authenticator
    phone?: string; // For SMS (masked)
    email?: string; // For email (masked)
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      method: string;
      secret?: string;
      qrCode?: string;
      phone?: string;
      email?: string;
    }>>(`${SECURITY_BASE}/2fa/setup`, { method });
    return response.data;
  },

  /**
   * Enable 2FA - Step 2: Verify and activate
   */
  enable2FAVerify: async (data: {
    method: 'sms' | 'email' | 'authenticator';
    code: string;
  }): Promise<ApiResponse<{
    enabled: boolean;
    backupCodes: string[];
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      enabled: boolean;
      backupCodes: string[];
    }>>(`${SECURITY_BASE}/2fa/verify`, data);
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (data: {
    code: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/2fa/disable`,
      data
    );
    return response.data;
  },

  /**
   * Change 2FA method
   */
  change2FAMethod: async (data: {
    currentCode: string;
    newMethod: 'sms' | 'email' | 'authenticator';
  }): Promise<ApiResponse<{
    method: string;
    secret?: string;
    qrCode?: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      method: string;
      secret?: string;
      qrCode?: string;
    }>>(`${SECURITY_BASE}/2fa/change-method`, data);
    return response.data;
  },

  /**
   * Get backup codes
   */
  getBackupCodes: async (password: string): Promise<ApiResponse<{
    codes: string[];
    generatedAt: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      codes: string[];
      generatedAt: string;
    }>>(`${SECURITY_BASE}/2fa/backup-codes`, { password });
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (password: string): Promise<ApiResponse<{
    codes: string[];
    generatedAt: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      codes: string[];
      generatedAt: string;
    }>>(`${SECURITY_BASE}/2fa/backup-codes/regenerate`, { password });
    return response.data;
  },

  // ==========================================================================
  // SESSIONS
  // ==========================================================================

  /**
   * Get all active sessions
   */
  getSessions: async (): Promise<ApiResponse<SecuritySession[]>> => {
    const response = await apiClient.get<ApiResponse<SecuritySession[]>>(
      `${SECURITY_BASE}/sessions`
    );
    return response.data;
  },

  /**
   * Get current session
   */
  getCurrentSession: async (): Promise<ApiResponse<SecuritySession>> => {
    const response = await apiClient.get<ApiResponse<SecuritySession>>(
      `${SECURITY_BASE}/sessions/current`
    );
    return response.data;
  },

  /**
   * Revoke a session
   */
  revokeSession: async (sessionId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/sessions/${sessionId}`
    );
    return response.data;
  },

  /**
   * Revoke all other sessions
   */
  revokeAllOtherSessions: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      `${SECURITY_BASE}/sessions/others`
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
    const response = await apiClient.get<ApiResponse<TrustedDevice[]>>(
      `${SECURITY_BASE}/trusted-devices`
    );
    return response.data;
  },

  /**
   * Add trusted device
   */
  addTrustedDevice: async (data: {
    name: string;
    code: string; // 2FA code for verification
  }): Promise<ApiResponse<TrustedDevice>> => {
    const response = await apiClient.post<ApiResponse<TrustedDevice>>(
      `${SECURITY_BASE}/trusted-devices`,
      data
    );
    return response.data;
  },

  /**
   * Remove trusted device
   */
  removeTrustedDevice: async (deviceId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/trusted-devices/${deviceId}`
    );
    return response.data;
  },

  /**
   * Remove all trusted devices
   */
  removeAllTrustedDevices: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      `${SECURITY_BASE}/trusted-devices`
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
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/transaction-pin`,
      data
    );
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
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/transaction-pin`,
      data
    );
    return response.data;
  },

  /**
   * Reset transaction PIN (sends OTP)
   */
  resetTransactionPin: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/transaction-pin/reset`
    );
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
      `${SECURITY_BASE}/transaction-pin/reset/confirm`,
      data
    );
    return response.data;
  },

  /**
   * Verify transaction PIN
   */
  verifyTransactionPin: async (pin: string): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ valid: boolean }>>(
      `${SECURITY_BASE}/transaction-pin/verify`,
      { pin }
    );
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
    contactMethod: 'email' | 'phone';
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${SECURITY_BASE}/review/request`,
      data
    );
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
  }): Promise<ApiResponse<{
    activities: Array<{
      id: UUID;
      type: string;
      description: string;
      ipAddress: string;
      location?: string;
      deviceInfo: string;
      timestamp: string;
      status: 'success' | 'failure';
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      activities: Array<{
        id: UUID;
        type: string;
        description: string;
        ipAddress: string;
        location?: string;
        deviceInfo: string;
        timestamp: string;
        status: 'success' | 'failure';
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`${SECURITY_BASE}/activity-log`, { params });
    return response.data;
  },
};

export default securityApi;
