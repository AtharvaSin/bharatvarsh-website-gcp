'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils';

export type TransitionVariant = 'fade' | 'slide' | 'mesh-scan' | 'reveal';

export interface PageTransitionProps {
  children: ReactNode;
  variant?: TransitionVariant;
  duration?: number;
  className?: string;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'mesh-scan': {
    initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
    exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
  },
  reveal: {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(4px)' },
  },
};

/**
 * PageTransition - Wraps page content with animated transitions
 *
 * Usage:
 * ```tsx
 * <PageTransition variant="slide">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export const PageTransition: FC<PageTransitionProps> = ({
  children,
  variant = 'slide',
  duration = 0.4,
  className,
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration safety pattern
    setMounted(true);
  }, []);

  // Reduce motion preference check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- External system sync (media query)
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1], // Custom ease for smooth feel
        }}
        className={cn('will-change-transform', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * MeshScanOverlay - Animated horizontal sweep effect for dramatic transitions
 */
export interface MeshScanOverlayProps {
  isActive: boolean;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export const MeshScanOverlay: FC<MeshScanOverlayProps> = ({
  isActive,
  color = 'var(--powder-500)',
  duration = 0.8,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-[9999] origin-left pointer-events-none"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${color}20 30%,
              ${color}40 50%,
              ${color}20 70%,
              transparent 100%)`,
          }}
        >
          {/* Scan line */}
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{
              duration,
              ease: 'linear',
            }}
            className="absolute top-0 bottom-0 w-1"
            style={{
              background: `linear-gradient(180deg,
                transparent 0%,
                ${color} 20%,
                ${color} 80%,
                transparent 100%)`,
              boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * PageLoadingIndicator - Shows loading state during navigation
 */
export interface PageLoadingIndicatorProps {
  isLoading: boolean;
  color?: string;
}

export const PageLoadingIndicator: FC<PageLoadingIndicatorProps> = ({
  isLoading,
  color = 'var(--mustard-500)',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="fixed top-0 left-0 right-0 h-0.5 z-[9999] origin-left"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${color} 50%,
              transparent 100%)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default PageTransition;
