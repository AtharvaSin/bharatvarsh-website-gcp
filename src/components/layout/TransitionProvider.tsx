'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoadingIndicator, MeshScanOverlay } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface TransitionProviderProps {
  children: ReactNode;
  /** Enable loading indicator at top of page */
  enableLoadingIndicator?: boolean;
  /** Enable dramatic mesh scan effect on navigation */
  enableMeshScan?: boolean;
  /** Transition duration in seconds */
  duration?: number;
  className?: string;
}

/**
 * TransitionProvider - Provides smooth page transitions across the app
 *
 * Wrap this around the main content area in your layout to enable
 * animated transitions between routes.
 */
export const TransitionProvider: FC<TransitionProviderProps> = ({
  children,
  enableLoadingIndicator = true,
  enableMeshScan = false,
  duration = 0.4,
  className,
}) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showMeshScan, setShowMeshScan] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(pathname);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- External system sync (media query)
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle route changes
  useEffect(() => {
    if (pathname !== currentPath) {
      if (prefersReducedMotion) {
        // Skip animation for reduced motion
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Route change sync
        setDisplayChildren(children);
        setCurrentPath(pathname);
      } else {
        setIsLoading(true);
        if (enableMeshScan) {
          setShowMeshScan(true);
        }

        // Small delay for transition effect
        const timer = setTimeout(() => {
          setDisplayChildren(children);
          setCurrentPath(pathname);
          setIsLoading(false);

          if (enableMeshScan) {
            setTimeout(() => setShowMeshScan(false), duration * 1000);
          }
        }, duration * 500);

        return () => clearTimeout(timer);
      }
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, currentPath, duration, enableMeshScan, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      {/* Loading indicator */}
      {enableLoadingIndicator && (
        <PageLoadingIndicator isLoading={isLoading} />
      )}

      {/* Mesh scan overlay */}
      {enableMeshScan && (
        <MeshScanOverlay isActive={showMeshScan} />
      )}

      {/* Animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn('will-change-transform', className)}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TransitionProvider;
