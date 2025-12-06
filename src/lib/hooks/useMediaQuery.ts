'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., '(min-width: 1024px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect if we're on mobile (< 1024px / lg breakpoint)
 * @returns boolean indicating if on mobile/tablet
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook to detect if we're on small mobile (< 640px / sm breakpoint)
 */
export function useIsSmallMobile(): boolean {
  return !useMediaQuery('(min-width: 640px)');
}

/**
 * Hook to get responsive values based on screen size
 * Returns the appropriate value for the current breakpoint
 *
 * @example
 * const height = useResponsiveValue({ base: 200, sm: 240, lg: 280 });
 */
export function useResponsiveValue<T>(values: {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T {
  const isXl = useMediaQuery('(min-width: 1280px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isSm = useMediaQuery('(min-width: 640px)');

  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;

  return values.base;
}

/**
 * Tailwind breakpoints reference:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
