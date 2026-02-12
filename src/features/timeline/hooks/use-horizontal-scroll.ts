'use client';

import { RefObject, useCallback } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { TIMELINE_CONSTANTS } from '@/content/data/timeline-phases';
import {
  scrollProgressToYear,
  scrollProgressToPhaseIndex,
  calculateScrollToPhase,
  calculateScrollToEvent
} from '../utils/timeline-calculations';

interface UseHorizontalScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
}

interface UseHorizontalScrollReturn {
  /** Scroll progress from 0 to 1 */
  scrollXProgress: MotionValue<number>;
  /** Current year based on scroll position */
  currentYear: MotionValue<number>;
  /** Current phase index (0-4) */
  currentPhaseIndex: MotionValue<number>;
  /** Scroll to a specific phase by index */
  scrollToPhase: (phaseIndex: number) => void;
  /** Scroll to a specific year */
  scrollToYear: (year: number) => void;
  /** Get scroll progress as a number (for non-animated use) */
  getScrollProgress: () => number;
}

/**
 * Custom hook for managing horizontal timeline scroll
 * Provides scroll progress, current year, and navigation functions
 */
export function useHorizontalScroll({
  containerRef,
}: UseHorizontalScrollOptions): UseHorizontalScrollReturn {
  // Get scroll progress from Framer Motion
  const { scrollXProgress } = useScroll({
    container: containerRef,
  });

  // Transform scroll progress to current year
  const currentYear = useTransform(
    scrollXProgress,
    [0, 1],
    [TIMELINE_CONSTANTS.START_YEAR as number, TIMELINE_CONSTANTS.END_YEAR as number]
  );

  // Transform scroll progress to phase index
  const currentPhaseIndex = useTransform(scrollXProgress, (progress) => {
    return scrollProgressToPhaseIndex(progress);
  });

  // Get current scroll progress as a number
  const getScrollProgress = useCallback((): number => {
    return scrollXProgress.get();
  }, [scrollXProgress]);

  // Scroll to a specific phase
  const scrollToPhase = useCallback(
    (phaseIndex: number) => {
      const container = containerRef.current;
      if (!container) return;

      const targetScroll = calculateScrollToPhase(phaseIndex, container.clientWidth);

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    },
    [containerRef]
  );

  // Scroll to a specific year
  const scrollToYear = useCallback(
    (year: number) => {
      const container = containerRef.current;
      if (!container) return;

      const totalScrollWidth = container.scrollWidth - container.clientWidth;
      const targetScroll = calculateScrollToEvent(
        year,
        container.clientWidth,
        totalScrollWidth
      );

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    },
    [containerRef]
  );

  return {
    scrollXProgress,
    currentYear,
    currentPhaseIndex,
    scrollToPhase,
    scrollToYear,
    getScrollProgress,
  };
}

/**
 * Hook to get discrete values from scroll progress
 * Useful for components that need non-animated values
 */
export function useScrollValues(scrollXProgress: MotionValue<number>): {
  year: number;
  phaseIndex: number;
  progress: number;
} {
  const progress = scrollXProgress.get();
  const year = scrollProgressToYear(progress);
  const phaseIndex = scrollProgressToPhaseIndex(progress);

  return { year, phaseIndex, progress };
}
