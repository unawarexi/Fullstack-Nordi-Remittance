// ============================================================================
// API CLIENT - Axios instance with interceptors for authentication
// ============================================================================

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { sessionManager } from "../auth/session.manager";
import { networkDetector } from "@core/network/network";

// API Base URL - configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Token storage keys
const ACCESS_TOKEN_KEY = "remit_access_token";
const REFRESH_TOKEN_KEY = "remit_refresh_token";

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export const TokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ============================================================================
// REQUEST INTERCEPTOR - Attach token to all requests
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only attach stored app JWT if the request doesn't already have an
    // explicit Authorization header. Clerk-sync calls pass a fresh Clerk
    // session token which must NOT be overwritten by a stale app JWT.
    if (config.headers && !config.headers.Authorization) {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = crypto.randomUUID();

    // Stamp request start time for latency tracking
    (config as any).__requestStartTime = Date.now();

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle token refresh and errors
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Report latency to NetworkDetector
    const startTime = (response.config as any).__requestStartTime;
    if (startTime) {
      networkDetector.reportLatency(Date.now() - startTime);
    }
    networkDetector.reportRequestSuccess();
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/verify") ||
      requestUrl.includes("/auth/resend") ||
      requestUrl.includes("/auth/clerk") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && isAuthEndpoint) {
      // Do NOT force logout or redirect to login on OTP/verification failures.
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        sessionManager.forceLogout("token_expired");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Backend wraps tokens as { data: { tokens: { accessToken, refreshToken } } }
        const refreshData = response.data?.data;
        const accessToken = refreshData?.tokens?.accessToken || refreshData?.accessToken;
        const newRefreshToken = refreshData?.tokens?.refreshToken || refreshData?.refreshToken;

        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }

        TokenManager.setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        sessionManager.forceLogout("token_expired");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Report network-level failures to the detector (no response = network error)
    if (!error.response && error.code !== 'ERR_CANCELED') {
      networkDetector.reportNetworkError();
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  message?: string; // Fallback
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const responseData = axiosError.response?.data;

    // Check if the backend sent structured validation error details
    const backendError = responseData?.error;

    if (backendError) {
      // If there are specific validation details from mongoose or Zod
      if (backendError.details) {
        // Handle array format (e.g. from validators)
        if (Array.isArray(backendError.details)) {
          const detailMessages = backendError.details.map((err: any) => err.message).filter(Boolean);

          if (detailMessages.length > 0) {
            return detailMessages.join(", ");
          }
        }
        // Handle object format (e.g. Mongoose validation errors)
        else if (typeof backendError.details === "object") {
          const detailMessages = Object.values(backendError.details)
            .map((err: any) => err?.message || String(err))
            .filter(Boolean);

          if (detailMessages.length > 0) {
            return detailMessages.join(", ");
          }
        }
      }

      return backendError.message || "An unexpected error occurred";
    }

    return responseData?.message || axiosError.message || "An unexpected error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// ============================================================================
// EXPORTS
// ============================================================================

export default apiClient;
