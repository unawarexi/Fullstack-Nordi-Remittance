import { securityApi } from '../../core/api/endpoints/security.api';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// SECURITY HOOKS - TanStack Query hooks for security settings
// ============================================================================


// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get security settings
 */
export const useSecuritySettings = () => {
  return useQuery({
    queryKey: queryKeys.security.settings(),
    queryFn: async () => {
      const response = await securityApi.getSettings();
      return response.data;
    },
  });
};

/**
 * Get 2FA status
 */
export const useTwoFactorStatus = () => {
  return useQuery({
    queryKey: queryKeys.security.twoFactorStatus(),
    queryFn: async () => {
      const response = await securityApi.get2FAStatus();
      return response.data;
    },
  });
};

/**
 * Get active sessions
 */
export const useActiveSessions = () => {
  return useQuery({
    queryKey: queryKeys.security.sessions(),
    queryFn: async () => {
      const response = await securityApi.getSessions();
      return response.data;
    },
  });
};

/**
 * Get trusted devices
 */
export const useTrustedDevices = () => {
  return useQuery({
    queryKey: queryKeys.security.trustedDevices(),
    queryFn: async () => {
      const response = await securityApi.getTrustedDevices();
      return response.data;
    },
  });
};

/**
 * Get security activity log
 */
export const useSecurityActivityLog = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...queryKeys.security.all, "activity-log", params],
    queryFn: async () => {
      const response = await securityApi.getActivityLog(params);
      return response;
    },
  });
};

/**
 * Get login history
 */
export const useLoginHistory = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.security.all, "login-history", params],
    queryFn: async () => {
      const response = await securityApi.getLoginHistory(params);
      return response;
    },
  });
};

/**
 * Check if transaction PIN is set
 */
export const useTransactionPinStatus = () => {
  return useQuery({
    queryKey: [...queryKeys.security.all, "transaction-pin-status"],
    queryFn: async () => {
      const response = await securityApi.getTransactionPinStatus();
      return response.data;
    },
  });
};

// ============================================================================
// MUTATIONS - 2FA
// ============================================================================

/**
 * Enable 2FA mutation
 */
export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (method: "authenticator" | "sms" | "email") => {
      const response = await securityApi.enable2FA(method);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.twoFactorStatus(),
      });
      showToast("2FA setup initiated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to setup 2FA", "error");
    },
  });
};

/**
 * Confirm 2FA setup mutation
 */
export const useConfirm2FA = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { code: string; backupCodes?: boolean }) => {
      const response = await securityApi.confirm2FA(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.twoFactorStatus(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.settings(),
      });
      showToast("2FA enabled successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Invalid code", "error");
    },
  });
};

/**
 * Disable 2FA mutation
 */
export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { password: string; code: string }) => {
      const response = await securityApi.disable2FA(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.twoFactorStatus(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.settings(),
      });
      showToast("2FA disabled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to disable 2FA", "error");
    },
  });
};

/**
 * Generate new backup codes mutation
 */
export const useGenerateBackupCodes = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { password: string; code: string }) => {
      const response = await securityApi.generateBackupCodes(data);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to generate backup codes", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - SESSION MANAGEMENT
// ============================================================================

/**
 * Revoke session mutation
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (sessionId: UUID) => {
      const response = await securityApi.revokeSession(sessionId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.sessions(),
      });
      showToast("Session revoked", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to revoke session", "error");
    },
  });
};

/**
 * Revoke all other sessions mutation
 */
export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await securityApi.revokeAllOtherSessions();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.sessions(),
      });
      showToast("All other sessions revoked", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to revoke sessions", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - TRUSTED DEVICES
// ============================================================================

/**
 * Add trusted device mutation
 */
export const useAddTrustedDevice = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { deviceName: string; code: string }) => {
      const response = await securityApi.addTrustedDevice(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.trustedDevices(),
      });
      showToast("Device added to trusted devices", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add device", "error");
    },
  });
};

/**
 * Remove trusted device mutation
 */
export const useRemoveTrustedDevice = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (deviceId: UUID) => {
      const response = await securityApi.removeTrustedDevice(deviceId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.trustedDevices(),
      });
      showToast("Device removed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to remove device", "error");
    },
  });
};

/**
 * Remove all trusted devices mutation
 */
export const useRemoveAllTrustedDevices = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await securityApi.removeAllTrustedDevices();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.trustedDevices(),
      });
      showToast("All trusted devices removed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to remove devices", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - TRANSACTION PIN
// ============================================================================

/**
 * Set transaction PIN mutation
 */
export const useSetTransactionPin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      pin: string;
      confirmPin: string;
      password: string;
    }) => {
      const response = await securityApi.setTransactionPin(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.all });
      showToast("Transaction PIN set successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to set PIN", "error");
    },
  });
};

/**
 * Change transaction PIN mutation
 */
export const useChangeTransactionPin = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      currentPin: string;
      newPin: string;
      confirmPin: string;
    }) => {
      const response = await securityApi.changeTransactionPin(data);
      return response.data;
    },
    onSuccess: () => {
      showToast("Transaction PIN changed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to change PIN", "error");
    },
  });
};

/**
 * Reset transaction PIN mutation
 */
export const useResetTransactionPin = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await securityApi.resetTransactionPin();
      return response.data;
    },
    onSuccess: () => {
      showToast("PIN reset code sent to your email", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reset PIN", "error");
    },
  });
};

/**
 * Confirm transaction PIN reset mutation
 */
export const useConfirmTransactionPinReset = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      otp: string;
      newPin: string;
      confirmPin: string;
    }) => {
      const response = await securityApi.confirmTransactionPinReset(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.all });
      showToast("Transaction PIN reset successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reset PIN", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - SECURITY SETTINGS
// ============================================================================

/**
 * Update security settings mutation
 */
export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      loginNotifications?: boolean;
      transactionNotifications?: boolean;
      failedLoginNotifications?: boolean;
      newDeviceNotifications?: boolean;
      sessionTimeout?: number;
      requirePinForTransfer?: boolean;
      requirePinAmount?: number;
    }) => {
      const response = await securityApi.updateSettings(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.settings(),
      });
      showToast("Security settings updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update settings", "error");
    },
  });
};

/**
 * Verify identity mutation (for sensitive operations)
 */
export const useVerifyIdentity = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      password?: string;
      code?: string;
      pin?: string;
    }) => {
      const response = await securityApi.verifyIdentity(data);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Verification failed", "error");
    },
  });
};

/**
 * Request security review mutation
 */
export const useRequestSecurityReview = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      reason: string;
      contactMethod: "email" | "phone";
    }) => {
      const response = await securityApi.requestSecurityReview(data);
      return response.data;
    },
    onSuccess: () => {
      showToast("Security review requested", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request review", "error");
    },
  });
};
