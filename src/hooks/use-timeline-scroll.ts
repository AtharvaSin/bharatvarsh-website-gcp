'use client';

import { RefObject, useCallback, useRef, useState } from 'react';
import { useScroll, useTransform, MotionValue, PanInfo } from 'framer-motion';
import { TIMELINE_CONSTANTS } from '@/data/timeline-phases';
import {
  scrollProgressToYear,
  scrollProgressToPhaseIndex,
  calculateScrollToPhase,
  calculateScrollToEvent
} from '@/components/features/timeline/utils/timeline-calculations';

/**
 * Options for useTimelineScroll hook
 */
export interface UseTimelineScrollOptions {
  /** Reference to the scrollable container */
  containerRef: RefObject<HTMLElement | null>;
  /** Momentum decay rate for drag scrolling (0-1). Default: 0.95 */
  decayRate?: number;
  /** Minimum velocity to trigger momentum. Default: 50 */
  minVelocity?: number;
  /** Enable drag-to-scroll functionality. Default: true */
  enableDrag?: boolean;
}

/**
 * Return type for useTimelineScroll hook
 */
export interface UseTimelineScrollReturn {
  // Scroll state
  /** Scroll progress from 0 to 1 */
  scrollXProgress: MotionValue<number>;
  /** Current year based on scroll position */
  currentYear: MotionValue<number>;
  /** Current phase index (0-4) */
  currentPhaseIndex: MotionValue<number>;
  /** Get scroll progress as a number (for non-animated use) */
  getScrollProgress: () => number;

  // Navigation functions
  /** Scroll to a specific phase by index */
  scrollToPhase: (phaseIndex: number) => void;
  /** Scroll to a specific year */
  scrollToYear: (year: number) => void;

  // Drag state and handlers
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Pan start handler for Framer Motion */
  onPanStart: (event: PointerEvent, info: PanInfo) => void;
  /** Pan handler for Framer Motion */
  onPan: (event: PointerEvent, info: PanInfo) => void;
  /** Pan end handler for Framer Motion */
  onPanEnd: (event: PointerEvent, info: PanInfo) => void;
  /** Cursor class based on drag state */
  cursorClass: string;
}

/**
 * Combined hook for horizontal timeline scroll with drag-to-scroll functionality
 *
 * Merges useHorizontalScroll and useDragToScroll into a single unified hook
 * for managing horizontal timeline navigation with momentum scrolling.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const {
 *   scrollXProgress,
 *   currentYear,
 *   scrollToPhase,
 *   isDragging,
 *   onPanStart,
 *   onPan,
 *   onPanEnd,
 *   cursorClass,
 * } = useTimelineScroll({ containerRef });
 * ```
 */
export function useTimelineScroll(
  options: UseTimelineScrollOptions
): UseTimelineScrollReturn {
  const {
    containerRef,
    decayRate = 0.95,
    minVelocity = 50,
    enableDrag = true,
  } = options;

  // === Scroll Progress State ===
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

  // === Navigation Functions ===
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

  // === Drag-to-Scroll State ===
  const [isDragging, setIsDragging] = useState(false);
  const startScrollLeft = useRef(0);
  const momentumRef = useRef<number | null>(null);
  const velocityRef = useRef(0);

  // Cancel any ongoing momentum animation
  const cancelMomentum = useCallback(() => {
    if (momentumRef.current !== null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  // Apply momentum scrolling with decay
  const applyMomentum = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Apply velocity
    container.scrollLeft -= velocityRef.current;

    // Decay velocity
    velocityRef.current *= decayRate;

    // Continue animation if velocity is still significant
    if (Math.abs(velocityRef.current) > 0.5) {
      // eslint-disable-next-line react-hooks/immutability -- Recursive animation frame
      momentumRef.current = requestAnimationFrame(applyMomentum);
    } else {
      velocityRef.current = 0;
      momentumRef.current = null;
    }
  }, [containerRef, decayRate]);

  // === Drag Handlers ===
  const onPanStart = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      void info;  // Intentionally unused
      if (!enableDrag) return;

      const container = containerRef.current;
      if (!container) return;

      cancelMomentum();
      startScrollLeft.current = container.scrollLeft;
      setIsDragging(true);
    },
    [enableDrag, containerRef, cancelMomentum]
  );

  const onPan = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      if (!enableDrag || !isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      // Calculate new scroll position (invert delta for natural drag feel)
      const newScrollLeft = startScrollLeft.current - info.offset.x;
      container.scrollLeft = newScrollLeft;

      // Track velocity for momentum
      velocityRef.current = info.velocity.x * 0.05;
    },
    [enableDrag, isDragging, containerRef]
  );

  const onPanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      if (!enableDrag) return;

      setIsDragging(false);

      // Apply momentum if velocity is above threshold
      if (Math.abs(info.velocity.x) > minVelocity) {
        velocityRef.current = info.velocity.x * 0.05;
        momentumRef.current = requestAnimationFrame(applyMomentum);
      }
    },
    [enableDrag, minVelocity, applyMomentum]
  );

  // Cursor class based on drag state
  const cursorClass = enableDrag
    ? isDragging
      ? 'cursor-grabbing'
      : 'cursor-grab'
    : '';

  return {
    // Scroll state
    scrollXProgress,
    currentYear,
    currentPhaseIndex,
    getScrollProgress,

    // Navigation
    scrollToPhase,
    scrollToYear,

    // Drag state and handlers
    isDragging,
    onPanStart,
    onPan,
    onPanEnd,
    cursorClass,
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

export default useTimelineScroll;
