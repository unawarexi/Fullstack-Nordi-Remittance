// ============================================================================
// USE MEDIA QUERY - React hook for media query matching
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to track media query matches
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is available (SSR support)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create handler function
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (using modern API with fallback)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Common media query presets
 */
export const mediaQueries = {
  xs: '(max-width: 639px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  
  // Max-width queries
  maxSm: '(max-width: 639px)',
  maxMd: '(max-width: 767px)',
  maxLg: '(max-width: 1023px)',
  maxXl: '(max-width: 1279px)',
  max2xl: '(max-width: 1535px)',
  
  // Feature queries
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDark: '(prefers-color-scheme: dark)',
  prefersLight: '(prefers-color-scheme: light)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  highContrast: '(prefers-contrast: high)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
};

/**
 * Shorthand hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery(mediaQueries.maxMd);
export const useIsTablet = () => {
  const aboveSm = useMediaQuery(mediaQueries.sm);
  const belowLg = useMediaQuery(mediaQueries.maxLg);
  return aboveSm && belowLg;
};
export const useIsDesktop = () => useMediaQuery(mediaQueries.lg);
export const useIsLargeDesktop = () => useMediaQuery(mediaQueries.xl);

/**
 * Dark mode preference
 */
export const usePrefersDarkMode = () => useMediaQuery(mediaQueries.prefersDark);

/**
 * Reduced motion preference
 */
export const usePrefersReducedMotion = () => useMediaQuery(mediaQueries.prefersReducedMotion);

/**
 * Touch device detection
 */
export const useIsTouchDevice = () => useMediaQuery(mediaQueries.touch);

export default useMediaQuery;
