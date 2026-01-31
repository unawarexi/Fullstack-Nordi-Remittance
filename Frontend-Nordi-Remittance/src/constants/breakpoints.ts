// ============================================================================
// BREAKPOINT SYSTEM - Responsive design breakpoints
// ============================================================================

/**
 * Breakpoint values in pixels
 * Matches Tailwind CSS default breakpoints
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Breakpoint keys for type safety
 */
export type BreakpointKey = keyof typeof breakpoints;

/**
 * Media query strings for use in CSS-in-JS or direct usage
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  
  // Max-width queries (for mobile-first exceptions)
  maxXs: `(max-width: ${breakpoints.sm - 1}px)`,
  maxSm: `(max-width: ${breakpoints.md - 1}px)`,
  maxMd: `(max-width: ${breakpoints.lg - 1}px)`,
  maxLg: `(max-width: ${breakpoints.xl - 1}px)`,
  maxXl: `(max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Device type queries
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  
  // Feature queries
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
} as const;

/**
 * Responsive value helper type
 * Allows defining different values for each breakpoint
 */
export type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/**
 * Grid column configurations by breakpoint
 */
export const gridColumns = {
  default: { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, '2xl': 4 },
  cards: { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, '2xl': 4 },
  features: { xs: 1, sm: 2, md: 2, lg: 3, xl: 3, '2xl': 4 },
  team: { xs: 1, sm: 2, md: 2, lg: 3, xl: 3, '2xl': 3 },
  services: { xs: 1, sm: 2, md: 2, lg: 4, xl: 4, '2xl': 4 },
  stats: { xs: 2, sm: 2, md: 4, lg: 4, xl: 4, '2xl': 4 },
} as const;

/**
 * Common responsive Tailwind grid classes
 */
export const gridClasses = {
  default: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  features: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  team: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  twoCol: 'grid grid-cols-1 md:grid-cols-2',
  threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  stats: 'grid grid-cols-2 md:grid-cols-4',
} as const;

/**
 * Sidebar widths by breakpoint
 */
export const sidebarWidths = {
  collapsed: 64,
  expanded: {
    sm: 200,
    md: 240,
    lg: 280,
  },
} as const;

/**
 * Container padding by breakpoint
 */
export const containerPadding = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
  '2xl': 64,
} as const;

/**
 * Helper to get breakpoint value
 */
export const getBreakpointValue = (key: BreakpointKey): number => {
  return breakpoints[key];
};

/**
 * Helper to check if window matches breakpoint
 */
export const matchesBreakpoint = (key: BreakpointKey): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(mediaQueries[key]).matches;
};

/**
 * Get current breakpoint based on window width
 */
export const getCurrentBreakpoint = (): BreakpointKey => {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Responsive hide/show classes
 */
export const visibilityClasses = {
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'sm:hidden md:block',
  hideOnDesktop: 'lg:hidden',
  showOnMobile: 'block sm:hidden',
  showOnTablet: 'hidden sm:block md:hidden',
  showOnDesktop: 'hidden lg:block',
  mobileOnly: 'block md:hidden',
  tabletUp: 'hidden md:block',
  desktopOnly: 'hidden lg:block',
} as const;

export default {
  breakpoints,
  mediaQueries,
  gridColumns,
  gridClasses,
  sidebarWidths,
  containerPadding,
  visibilityClasses,
  getBreakpointValue,
  matchesBreakpoint,
  getCurrentBreakpoint,
};
