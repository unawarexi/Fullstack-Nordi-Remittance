// ============================================================================
// AUTH HOOKS - TanStack Query hooks for authentication
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, TokenManager } from '../../core/api';
import { queryKeys } from '../../core/api/queryClient';
import { useToastStore } from '../../store/toast.store';
import type {
  LoginRequest,
  RegisterRequest,
  FullKycRegisterRequest,
  TwoFactorAuthRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  ChangePasswordRequest,
} from '../../types/api.types';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: TokenManager.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Check email availability
 */
export const useCheckEmailAvailability = (email: string) => {
  return useQuery({
    queryKey: ['auth', 'checkEmail', email],
    queryFn: async () => {
      const response = await authApi.checkEmailAvailability(email);
      return response.data;
    },
    enabled: !!email && email.includes('@'),
  });
};

/**
 * Check phone availability
 */
export const useCheckPhoneAvailability = (phone: string) => {
  return useQuery({
    queryKey: ['auth', 'checkPhone', phone],
    queryFn: async () => {
      const response = await authApi.checkPhoneAvailability(phone);
      return response.data;
    },
    enabled: !!phone && phone.length >= 10,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authApi.login(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (!data.requiresTwoFactor) {
        TokenManager.setTokens(data.accessToken, data.refreshToken);
        queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
        showToast('Login successful', 'success');
      }
    },
    onError: (error: Error) => {
      showToast(error.message || 'Login failed', 'error');
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authApi.register(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Registration successful! Please verify your email.', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Registration failed', 'error');
    },
  });
};

/**
 * Register with full KYC mutation
 */
export const useRegisterFullKyc = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: FullKycRegisterRequest) => {
      const response = await authApi.registerFullKyc(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Registration successful! Please verify your email.', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Registration failed', 'error');
    },
  });
};

/**
 * Verify 2FA mutation
 */
export const useVerifyTwoFactor = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: TwoFactorAuthRequest) => {
      const response = await authApi.verifyTwoFactor(data);
      return response.data;
    },
    onSuccess: (data) => {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
      showToast('Login successful', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Invalid code', 'error');
    },
  });
};

/**
 * Resend 2FA code mutation
 */
export const useResendTwoFactorCode = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (tempToken: string) => {
      const response = await authApi.resendTwoFactorCode(tempToken);
      return response.data;
    },
    onSuccess: () => {
      showToast('Verification code sent', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send code', 'error');
    },
  });
};

/**
 * Forgot password mutation
 */
export const useForgotPassword = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await authApi.forgotPassword(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Password reset email sent', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send reset email', 'error');
    },
  });
};

/**
 * Reset password mutation
 */
export const useResetPassword = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: ConfirmResetPasswordRequest) => {
      const response = await authApi.resetPassword(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Password reset successful', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Password reset failed', 'error');
    },
  });
};

/**
 * Change password mutation
 */
export const useChangePassword = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await authApi.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Password changed successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to change password', 'error');
    },
  });
};

/**
 * Verify email mutation
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await authApi.verifyEmail(token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      showToast('Email verified successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Email verification failed', 'error');
    },
  });
};

/**
 * Resend verification email mutation
 */
export const useResendVerificationEmail = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.resendVerificationEmail();
      return response.data;
    },
    onSuccess: () => {
      showToast('Verification email sent', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send verification email', 'error');
    },
  });
};

/**
 * Verify phone mutation
 */
export const useVerifyPhone = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (otp: string) => {
      const response = await authApi.verifyPhone(otp);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      showToast('Phone verified successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Phone verification failed', 'error');
    },
  });
};

/**
 * Resend phone OTP mutation
 */
export const useResendPhoneOtp = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.resendPhoneVerification();
      return response.data;
    },
    onSuccess: () => {
      showToast('OTP sent to your phone', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send OTP', 'error');
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.logout();
      return response.data;
    },
    onSuccess: () => {
      TokenManager.clearTokens();
      queryClient.clear();
      showToast('Logged out successfully', 'success');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      TokenManager.clearTokens();
      queryClient.clear();
    },
  });
};

/**
 * Logout all sessions mutation
 */
export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.logoutAll();
      return response.data;
    },
    onSuccess: () => {
      TokenManager.clearTokens();
      queryClient.clear();
      showToast('Logged out from all devices', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to logout from all devices', 'error');
    },
  });
};
