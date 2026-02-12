'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribe function for useSyncExternalStore
 */
function subscribeToMediaQuery(
  query: string,
  callback: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', callback);

  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

/**
 * Get snapshot function for useSyncExternalStore
 */
function getMediaQuerySnapshot(query: string): () => boolean {
  return () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };
}

/**
 * Server snapshot function (always returns false)
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Custom hook to detect media query matches
 * Uses useSyncExternalStore for proper React 18+ compatibility
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => subscribeToMediaQuery(query, callback);
  const getSnapshot = getMediaQuerySnapshot(query);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1536px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Orientation detection hooks
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

/**
 * Combined viewport state for comprehensive device detection
 */
export interface ViewportState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Hook that provides complete viewport state
 * Useful for components that need multiple viewport conditions
 */
export function useViewport(): ViewportState {
  return {
    isMobile: useIsMobile(),
    isTablet: useIsTablet(),
    isDesktop: useIsDesktop(),
    isLargeDesktop: useIsLargeDesktop(),
    isPortrait: useIsPortrait(),
    isLandscape: useIsLandscape(),
    prefersReducedMotion: usePrefersReducedMotion(),
  };
}
