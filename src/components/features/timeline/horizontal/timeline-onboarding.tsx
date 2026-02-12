'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal, ArrowRight, Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface TimelineOnboardingProps {
  visible: boolean;
  onDismiss: () => void;
}

const STORAGE_KEY = 'bharatvarsh-timeline-onboarding-dismissed';

/**
 * Onboarding overlay for horizontal timeline navigation
 * Shows navigation hints on first visit, auto-dismisses after scroll or timeout
 */
export const TimelineOnboarding: FC<TimelineOnboardingProps> = ({
  visible,
  onDismiss,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [shouldShow, setShouldShow] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed && visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial localStorage check
      setShouldShow(true);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShouldShow(false);
    onDismiss();
  }, [onDismiss]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, handleDismiss]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-4 px-6 py-4',
            'bg-[var(--obsidian-800)]/95 backdrop-blur-md',
            'border border-[var(--obsidian-600)]',
            'rounded-xl shadow-2xl',
            'max-w-md'
          )}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.4,
            ease: 'easeOut',
          }}
          role="status"
          aria-live="polite"
        >
          {/* Animated drag indicator */}
          <div className="flex items-center gap-1 text-[var(--mustard-500)]">
            <GripHorizontal className="w-5 h-5" />
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      x: [0, 10, 0],
                      opacity: [1, 0.5, 1],
                    }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="flex-1">
            <p className="text-[var(--text-primary)] font-medium text-sm">
              Drag or scroll horizontally to explore 308 years of history
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[var(--text-muted)] text-xs">
              <span className="flex items-center gap-1">
                <GripHorizontal className="w-3 h-3" />
                Click & drag
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Keyboard className="w-3 h-3" />
                Arrow keys
              </span>
              <span>•</span>
              <span>Click events for details</span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className={cn(
              'p-1.5 rounded-lg',
              'bg-[var(--obsidian-700)] hover:bg-[var(--obsidian-600)]',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)]'
            )}
            aria-label="Dismiss navigation hint"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimelineOnboarding;
