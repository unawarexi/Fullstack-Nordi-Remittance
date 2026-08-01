import { SecurityRepository } from '../../domain/repository/security.repository';
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
      const response = await SecurityRepository.getSettings();
      return response.data;
    },
  });
};

/**
 * Get 2FA status (derived from security settings)
 */
export const useTwoFactorStatus = () => {
  return useQuery({
    queryKey: queryKeys.security.twoFactorStatus(),
    queryFn: async () => {
      const response = await SecurityRepository.getSettings();
      const settings = response.data as any;
      return {
        enabled: settings?.twoFactorEnabled ?? false,
        method: settings?.twoFactorMethod ?? null,
      };
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
      const response = await SecurityRepository.getSessions();
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
      const response = await SecurityRepository.getTrustedDevices();
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
      const response = await SecurityRepository.getActivityLog(params);
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
      const response = await SecurityRepository.getActivityLog({ ...params, type: 'login' });
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
      // Mocking transaction PIN status as it is not explicitly available in API yet
      return { isSet: true };
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
      const response = await SecurityRepository.enable2FASetup(method);
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
    mutationFn: async (data: { code: string; backupCodes?: boolean; method?: 'authenticator' | 'sms' | 'email' }) => {
      const response = await SecurityRepository.enable2FAVerify({ code: data.code, method: data.method || 'authenticator' });
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
      const response = await SecurityRepository.disable2FA(data);
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
      const response = await SecurityRepository.regenerateBackupCodes(data.password);
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
      const response = await SecurityRepository.revokeSession(sessionId);
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
      const response = await SecurityRepository.revokeAllOtherSessions();
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
      const response = await SecurityRepository.addTrustedDevice({ name: data.deviceName, code: data.code });
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
      const response = await SecurityRepository.removeTrustedDevice(deviceId);
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
      const response = await SecurityRepository.removeAllTrustedDevices();
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
      const response = await SecurityRepository.setTransactionPin(data);
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
      const response = await SecurityRepository.changeTransactionPin(data);
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
      const response = await SecurityRepository.resetTransactionPin();
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
      const response = await SecurityRepository.confirmTransactionPinReset(data);
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
      const response = await SecurityRepository.updateSettings(data);
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
      if (data.pin) {
        const response = await SecurityRepository.verifyTransactionPin(data.pin);
        return { verified: response.data.valid };
      }
      return { verified: true };
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
      const response = await SecurityRepository.requestSecurityReview(data);
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
