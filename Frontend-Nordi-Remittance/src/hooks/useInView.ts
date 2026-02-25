// ============================================================================
// useInView — IntersectionObserver hook for lazy-loading dashboard sections
// Only mounts child components when they scroll into the viewport, so
// TanStack Query hooks inside those children don't fire until needed.
// ============================================================================

import { useRef, useState, useEffect } from 'react';

interface UseInViewOptions {
  /** Intersection threshold (0-1). Default 0.1 */
  threshold?: number;
  /** Root margin to trigger slightly before element enters viewport. Default '100px' */
  rootMargin?: string;
  /** If true, stops observing after first intersection. Default true */
  triggerOnce?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView] as const;
}

export default useInView;
