// ============================================================================
// AUTH STORE - Zustand store for client-side auth state (Client State Only)
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TokenManager } from '../core/api/client';
import { connectSocket, disconnectSocket } from '../core/socket/socket.client';

// ============================================================================
// TYPES
// ============================================================================

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  kycStatus: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface AuthState {
  // Auth state
  isAuthenticated: boolean;
  user: AuthUser | null;
  
  // 2FA state
  requires2FA: boolean;
  twoFactorPending: {
    email?: string;
    method?: '2fa_authenticator' | '2fa_sms' | '2fa_email';
  } | null;
  
  // Session state
  lastActivityAt: number | null;
  sessionExpiresAt: number | null;
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  // Auth actions
  setAuthenticated: (user: AuthUser) => void;
  logout: () => void;
  clearAuth: () => void;
  
  // 2FA actions
  set2FAPending: (data: { email: string; method: '2fa_authenticator' | '2fa_sms' | '2fa_email' }) => void;
  clear2FAPending: () => void;
  
  // Session actions
  updateLastActivity: () => void;
  setSessionExpiry: (expiresAt: number) => void;
  
  // User actions
  updateUser: (updates: Partial<AuthUser>) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      requires2FA: false,
      twoFactorPending: null,
      lastActivityAt: null,
      sessionExpiresAt: null,
      isLoading: false,
      isInitialized: false,

      // Auth actions
      setAuthenticated: (user: AuthUser) => {
        set({
          isAuthenticated: true,
          user,
          requires2FA: false,
          twoFactorPending: null,
          lastActivityAt: Date.now(),
          isInitialized: true,
        });

        // Establish WebSocket connection after successful auth
        try {
          connectSocket();
        } catch {
          // Non-blocking — socket failure shouldn't break login
          console.warn('[Auth] WebSocket connection failed on login');
        }
      },

      logout: () => {
        // Disconnect WebSocket before clearing tokens
        disconnectSocket();

        // Clear tokens
        TokenManager.clearTokens();

        // Clear cross-tab session expired flag to prevent stale re-logout signals
        try { localStorage.removeItem('nordi_session_expired'); } catch {}
        
        // Sign out from Clerk to prevent stale sessions causing kid mismatch
        if (typeof window !== "undefined" && (window as any).Clerk) {
          (window as any).Clerk.signOut().catch(() => {});
        }
        
        // Reset state
        set({
          isAuthenticated: false,
          user: null,
          requires2FA: false,
          twoFactorPending: null,
          lastActivityAt: null,
          sessionExpiresAt: null,
        });
      },

      clearAuth: () => {
        disconnectSocket();
        TokenManager.clearTokens();

        // Clear cross-tab session expired flag to prevent stale re-logout signals
        try { localStorage.removeItem('nordi_session_expired'); } catch {}
        
        // Sign out from Clerk to prevent stale sessions causing kid mismatch
        if (typeof window !== "undefined" && (window as any).Clerk) {
          (window as any).Clerk.signOut().catch(() => {});
        }
        
        set({
          isAuthenticated: false,
          user: null,
          requires2FA: false,
          twoFactorPending: null,
          lastActivityAt: null,
          sessionExpiresAt: null,
        });
      },

      // 2FA actions
      set2FAPending: (data) => {
        set({
          requires2FA: true,
          twoFactorPending: data,
        });
      },

      clear2FAPending: () => {
        set({
          requires2FA: false,
          twoFactorPending: null,
        });
      },

      // Session actions
      updateLastActivity: () => {
        set({ lastActivityAt: Date.now() });
      },

      setSessionExpiry: (expiresAt: number) => {
        set({ sessionExpiresAt: expiresAt });
      },

      // User actions
      updateUser: (updates: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // UI actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },
    }),
    {
      name: 'remit-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Mark as initialized once zustand finishes loading from localStorage
            // Without this, ProtectedRoute shows <PageLoader /> forever
            state.setInitialized(true);

            // Reconnect WebSocket if user was previously authenticated
            if (state.isAuthenticated) {
              try {
                connectSocket();
              } catch {
                // Silent — socket will retry via its own reconnect logic
              }
            }
          } else {
            // No persisted state (e.g. after session cleanup cleared localStorage).
            // Still mark as initialized so ProtectedRoute doesn't show infinite loader.
            useAuthStore.setState({ isInitialized: true });
          }
        };
      },
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUser = (state: AuthStore) => state.user;
export const selectRequires2FA = (state: AuthStore) => state.requires2FA;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsInitialized = (state: AuthStore) => state.isInitialized;

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export const useAuth = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const requires2FA = useAuthStore(selectRequires2FA);
  const isLoading = useAuthStore(selectIsLoading);
  const isInitialized = useAuthStore(selectIsInitialized);
  const logout = useAuthStore((state) => state.logout);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return {
    isAuthenticated,
    user,
    requires2FA,
    isLoading,
    isInitialized,
    logout,
    setAuthenticated,
    userId: user?.id,
    userEmail: user?.email,
    userName: user ? `${user.firstName} ${user.lastName}` : null,
    userRole: user?.role,
    isVerified: user?.isEmailVerified && user?.kycStatus === 'verified',
  };
};
