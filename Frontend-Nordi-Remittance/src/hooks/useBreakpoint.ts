// ============================================================================
// USE BREAKPOINT - React hook for responsive breakpoint detection
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';

// ========================
// TYPES
// ========================
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface BreakpointState {
  current: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isSmUp: boolean;
  isMdUp: boolean;
  isLgUp: boolean;
  isXlUp: boolean;
  is2xlUp: boolean;
  isSmDown: boolean;
  isMdDown: boolean;
  isLgDown: boolean;
  isXlDown: boolean;
  width: number;
}

// ========================
// BREAKPOINT VALUES
// ========================
export const breakpointValues: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ========================
// HELPER FUNCTIONS
// ========================
const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpointValues['2xl']) return '2xl';
  if (width >= breakpointValues.xl) return 'xl';
  if (width >= breakpointValues.lg) return 'lg';
  if (width >= breakpointValues.md) return 'md';
  if (width >= breakpointValues.sm) return 'sm';
  return 'xs';
};

const getWindowWidth = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
};

// ========================
// MAIN HOOK
// ========================
export function useBreakpoint(): BreakpointState {
  const [width, setWidth] = useState<number>(getWindowWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return useMemo(() => {
    const current = getBreakpoint(width);
    
    return {
      current,
      width,
      isXs: current === 'xs',
      isSm: current === 'sm',
      isMd: current === 'md',
      isLg: current === 'lg',
      isXl: current === 'xl',
      is2xl: current === '2xl',
      isSmUp: width >= breakpointValues.sm,
      isMdUp: width >= breakpointValues.md,
      isLgUp: width >= breakpointValues.lg,
      isXlUp: width >= breakpointValues.xl,
      is2xlUp: width >= breakpointValues['2xl'],
      isSmDown: width < breakpointValues.md,
      isMdDown: width < breakpointValues.lg,
      isLgDown: width < breakpointValues.xl,
      isXlDown: width < breakpointValues['2xl'],
    };
  }, [width]);
}

// ========================
// RESPONSIVE VALUE HOOK
// ========================
type ResponsiveValue<T> = {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/**
 * Returns the appropriate value based on current breakpoint
 * Falls back to smaller breakpoint values if current is not defined
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T>, defaultValue: T): T {
  const { current } = useBreakpoint();

  return useMemo(() => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(current);

    // Find the closest defined value at or below current breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp] as T;
      }
    }

    return defaultValue;
  }, [values, current, defaultValue]);
}

// ========================
// MATCH BREAKPOINT HOOK
// ========================
type BreakpointMatcher = {
  up: (breakpoint: Breakpoint) => boolean;
  down: (breakpoint: Breakpoint) => boolean;
  only: (breakpoint: Breakpoint) => boolean;
  between: (start: Breakpoint, end: Breakpoint) => boolean;
};

export function useBreakpointMatcher(): BreakpointMatcher {
  const { width } = useBreakpoint();

  const up = useCallback((breakpoint: Breakpoint): boolean => {
    return width >= breakpointValues[breakpoint];
  }, [width]);

  const down = useCallback((breakpoint: Breakpoint): boolean => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const index = breakpointOrder.indexOf(breakpoint);
    const nextBreakpoint = breakpointOrder[index + 1];
    
    if (!nextBreakpoint) return true;
    return width < breakpointValues[nextBreakpoint];
  }, [width]);

  const only = useCallback((breakpoint: Breakpoint): boolean => {
    return up(breakpoint) && down(breakpoint);
  }, [up, down]);

  const between = useCallback((start: Breakpoint, end: Breakpoint): boolean => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const endIndex = breakpointOrder.indexOf(end);
    const nextBreakpoint = breakpointOrder[endIndex + 1];
    
    if (!nextBreakpoint) {
      return width >= breakpointValues[start];
    }
    return width >= breakpointValues[start] && width < breakpointValues[nextBreakpoint];
  }, [width]);

  return { up, down, only, between };
}

export default useBreakpoint;
