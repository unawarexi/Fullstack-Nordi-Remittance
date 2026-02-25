// ============================================================================
// STORE INDEX - Central export for all Zustand stores
// ============================================================================

// Toast store - Global notifications
export { useToastStore, useToast, type Toast, type ToastType } from './toast.store';

// Auth store - Client-side authentication state
export { 
  useAuthStore, 
  useAuth,
  selectIsAuthenticated,
  selectUser,
  selectRequires2FA,
  selectIsLoading,
  selectIsInitialized,
} from './auth.store';

// UI store - User interface state
export { 
  useUIStore,
  useTheme,
  useSidebar,
  useModal,
  usePreferences,
  selectTheme,
  selectCurrency,
  selectShowBalances,
  selectIsSidebarCollapsed,
  selectIsModalOpen,
  selectModalType,
} from './ui.store';

// Socket store - WebSocket connection state
export {
  useSocketStore,
  useSocketConnection,
  selectIsSocketConnected,
  selectSocketError,
  selectReconnectAttempts,
} from './socket.store';

// Theme store - Dark/light/system mode management
export { default as useThemeStore } from './theme.store';
export type { ThemeMode } from './theme.store';
