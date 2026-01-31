// ============================================================================
// HOOKS INDEX - Central export for all custom hooks
// ============================================================================

// Export all TanStack Query hooks
export * from './queries';

// Re-export store hooks for convenience
export { useToast, useAuth, useTheme, useSidebar, useModal, usePreferences } from '../store';

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
