'use client';

import { RefObject, useCallback, useRef, useState } from 'react';
import type { PanInfo } from 'framer-motion';

interface UseDragToScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
  decayRate?: number;
  minVelocity?: number;
  enabled?: boolean;
}

interface UseDragToScrollReturn {
  isDragging: boolean;
  onPanStart: (event: PointerEvent, info: PanInfo) => void;
  onPan: (event: PointerEvent, info: PanInfo) => void;
  onPanEnd: (event: PointerEvent, info: PanInfo) => void;
  cursorClass: string;
}

/**
 * Custom hook for drag-to-scroll functionality with momentum
 * Provides natural grab-and-drag scrolling behavior for horizontal timelines
 */
export function useDragToScroll(options: UseDragToScrollOptions): UseDragToScrollReturn {
  const {
    containerRef,
    decayRate = 0.95,
    minVelocity = 50,
    enabled = true,
  } = options;

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

  const onPanStart = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      void info;  // Intentionally unused
      if (!enabled) return;

      const container = containerRef.current;
      if (!container) return;

      // Cancel any existing momentum
      cancelMomentum();

      // Store starting scroll position
      startScrollLeft.current = container.scrollLeft;
      setIsDragging(true);
    },
    [enabled, containerRef, cancelMomentum]
  );

  const onPan = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      if (!enabled || !isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      // Calculate new scroll position (invert delta for natural drag feel)
      // When dragging right (positive delta.x), scroll left (subtract from scrollLeft)
      const newScrollLeft = startScrollLeft.current - info.offset.x;
      container.scrollLeft = newScrollLeft;

      // Track velocity for momentum
      velocityRef.current = info.velocity.x * 0.05; // Scale velocity
    },
    [enabled, isDragging, containerRef]
  );

  const onPanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      void event; // Intentionally unused
      if (!enabled) return;

      setIsDragging(false);

      // Apply momentum if velocity is above threshold
      if (Math.abs(info.velocity.x) > minVelocity) {
        velocityRef.current = info.velocity.x * 0.05;
        momentumRef.current = requestAnimationFrame(applyMomentum);
      }
    },
    [enabled, minVelocity, applyMomentum]
  );

  // Determine cursor class based on state
  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';

  return {
    isDragging,
    onPanStart,
    onPan,
    onPanEnd,
    cursorClass: enabled ? cursorClass : '',
  };
}
