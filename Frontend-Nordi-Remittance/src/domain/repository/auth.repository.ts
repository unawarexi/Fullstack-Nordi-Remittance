import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// AUTH API - Authentication endpoints
// ============================================================================

import apiClient, { ApiResponse, getErrorMessage } from "@core/api/client";

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export const AuthRepository = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(ApiEndpoints.authLogin, data);
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: User; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User; message: string }>>(ApiEndpoints.authRegister, data);
    return response.data;
  },

  /**
   * Register a new user with full KYC information
   */
  registerFullKyc: async (
    data: FullKycRegisterRequest | FormData,
  ): Promise<ApiResponse<{ user: User; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User; message: string }>>(
      ApiEndpoints.authRegisterFull,
      data,
      {
        headers: {
          "Content-Type": data instanceof FormData ? undefined : "application/json",
        },
      },
    );
    return response.data;
  },

  /**
   * Verify two-factor authentication code
   */
  verifyTwoFactor: async (data: TwoFactorAuthRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(ApiEndpoints.authVerify2fa, data);
    return response.data;
  },

  /**
   * Resend two-factor authentication code
   */
  resendTwoFactorCode: async (tempToken: string): Promise<ApiResponse<{ message: string }>> => {
    // Note: No matching route in Auth.routes.ts
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/2fa/resend`, { tempToken });
    return response.data;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authForgotPassword, data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ConfirmResetPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authResetPassword, data);
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authChangePassword, data);
    return response.data;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authVerifyEmail, { token });
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendVerificationEmail: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authResendVerification);
    return response.data;
  },

  /**
   * Verify phone number with OTP
   */
  verifyPhone: async (otp: string): Promise<ApiResponse<{ message: string }>> => {
    // Note: No matching route in Auth.routes.ts
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/verify-phone`, { otp });
    return response.data;
  },

  /**
   * Resend phone verification OTP
   */
  resendPhoneVerification: async (): Promise<ApiResponse<{ message: string }>> => {
    // Note: No matching route in Auth.routes.ts
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/resend-phone-otp`);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      ApiEndpoints.authRefresh,
      { refreshToken },
    );
    return response.data;
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.authLogout);
    return response.data;
  },

  /**
   * Logout all sessions
   */
  logoutAll: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.securitySessions);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(ApiEndpoints.authMe);
    return response.data;
  },

  /**
   * Check if email is available
   */
  checkEmailAvailability: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
    // Note: No matching route in Auth.routes.ts
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(`/auth/check-email`, {
      params: { email },
    });
    return response.data;
  },

  /**
   * Check if phone is available
   */
  checkPhoneAvailability: async (phone: string): Promise<ApiResponse<{ available: boolean }>> => {
    // Note: No matching route in Auth.routes.ts
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(`/auth/check-phone`, {
      params: { phone },
    });
    return response.data;
  },

  // ========================================================================
  // CLERK AUTH ENDPOINTS
  // ========================================================================

  /**
   * Sync Clerk session with backend — returns JWT tokens or OTP-required flag
   */
  clerkSync: async (clerkToken: string): Promise<ApiResponse<ClerkSyncResponse>> => {
    const response = await apiClient.post<ApiResponse<ClerkSyncResponse>>(
      ApiEndpoints.authClerkSync,
      {},
      { headers: { Authorization: `Bearer ${clerkToken}` } },
    );
    return response.data;
  },

  /**
   * Sync Clerk admin session with backend
   */
  clerkSyncAdmin: async (clerkToken: string): Promise<ApiResponse<ClerkSyncResponse>> => {
    const response = await apiClient.post<ApiResponse<ClerkSyncResponse>>(
      ApiEndpoints.authClerkSyncAdmin,
      {},
      { headers: { Authorization: `Bearer ${clerkToken}` } },
    );
    return response.data;
  },

  /**
   * Verify OTP for Clerk-authenticated users
   */
  verifyClerkOtp: async (data: {
    otpSessionToken: string;
    code: string;
    isAdmin?: boolean;
  }): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(ApiEndpoints.authVerifyClerkOtp, data);
    return response.data;
  },

  /**
   * Resend OTP code for Clerk-authenticated users
   */
  resendClerkOtp: async (otpSessionToken: string): Promise<ApiResponse<{ sent: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ sent: boolean }>>(ApiEndpoints.authResendClerkOtp, {
      otpSessionToken,
    });
    return response.data;
  },
};

export { getErrorMessage };
export default AuthRepository;
