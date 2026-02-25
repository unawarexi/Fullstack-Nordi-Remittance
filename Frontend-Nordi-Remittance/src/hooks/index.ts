// ============================================================================
// HOOKS INDEX - Central export for all custom hooks
// ============================================================================

// Export all TanStack Query hooks
export * from './queries';

// Re-export store hooks for convenience
export { useToast, useAuth, useTheme, useSidebar, useModal, usePreferences, useSocketConnection } from '../store';

// WebSocket hooks
export {
  useSocketEvent,
  useSocketEvents,
  useRealtimeBalances,
  useRealtimeTransactions,
  useRealtimeCards,
  useRealtimeLoans,
  useRealtimeInvestments,
  useRealtimeNotifications,
  useRealtimeSecurity,
  useAdminRealtimeEvents,
  useUserRealtimeEvents,
  useRealtimeUpdates,
} from './useSocket';

// IntersectionObserver Hook
export { useInView } from './useInView';

// Session Management Hook
export { useSessionManager } from './useSessionManager';
export type { SessionModalState } from './useSessionManager';

// Media Query Hook
export { 
  useMediaQuery,
  mediaQueries,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useIsTouchDevice,
} from './useMediaQuery';

// Breakpoint Hook
export {
  useBreakpoint,
  useResponsiveValue,
  useBreakpointMatcher,
  breakpointValues,
} from './useBreakpoint';
export type { 
  Breakpoint, 
  BreakpointConfig, 
  BreakpointState 
} from './useBreakpoint';
