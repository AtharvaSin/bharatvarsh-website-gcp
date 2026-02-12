'use client';

import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface TimelineScrollHintProps {
  visible: boolean;
  direction?: 'left' | 'right';
  className?: string;
}

/**
 * Subtle animated hint indicating scroll direction
 * Fades in on mount and pulses gently to draw attention
 */
export const TimelineScrollHint: FC<TimelineScrollHintProps> = ({
  visible,
  direction = 'left',
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  // Delay showing hint slightly for smoother page load
  useEffect(() => {
    if (visible) {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(showTimer);
    } else {
      setIsVisible(false);
    }
  }, [visible]);

  const isLeft = direction === 'left';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed z-30 pointer-events-none',
            'flex items-center justify-center',
            isLeft ? 'left-4' : 'right-4',
            'top-1/2 -translate-y-1/2',
            className
          )}
          initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLeft ? -20 : 20 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: 'easeOut',
          }}
          aria-hidden="true"
        >
          {/* Glow background */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-[var(--mustard-500)]/10 blur-xl'
            )}
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Chevron container */}
          <div className="relative flex items-center gap-0.5">
            {/* Triple stacked chevrons for depth effect */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: isLeft
                          ? [0, -4 * (index + 1), 0]
                          : [0, 4 * (index + 1), 0],
                        opacity: [0.2 + index * 0.2, 0.5 + index * 0.15, 0.2 + index * 0.2],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.15,
                }}
                style={{
                  marginLeft: isLeft ? `-${index * 8}px` : 0,
                  marginRight: !isLeft ? `-${index * 8}px` : 0,
                }}
              >
                <ChevronLeft
                  className={cn(
                    'w-6 h-6',
                    'text-[var(--mustard-500)]',
                    !isLeft && 'rotate-180'
                  )}
                  style={{
                    opacity: 0.3 + (2 - index) * 0.25,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Subtle text hint */}
          <motion.span
            className={cn(
              'absolute text-[10px] font-medium uppercase tracking-widest',
              'text-[var(--mustard-500)]/60',
              isLeft ? '-left-1 top-12' : '-right-1 top-12',
              'whitespace-nowrap'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {isLeft ? 'Origins' : 'Present'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimelineScrollHint;
