'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilmGrainOverlay,
  ParticleField,
  ScanlineEffect,
  PageLoadingIndicator,
  MeshScanOverlay,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

export interface LayoutProviderProps {
  children: ReactNode;
  header?: ReactNode;
  /** Atmospheric Effects Configuration */
  atmosphericEffects?: {
    /** Enable film grain overlay. Default: true */
    enableGrain?: boolean;
    /** Enable floating particles. Default: true */
    enableParticles?: boolean;
    /** Enable scanlines. Default: true */
    enableScanlines?: boolean;
    /** Film grain opacity. Default: 0.04 */
    grainOpacity?: number;
    /** Particle count. Default: 40 */
    particleCount?: number;
  };
  /** Page Transition Configuration */
  pageTransition?: {
    /** Enable loading indicator at top of page. Default: true */
    enableLoadingIndicator?: boolean;
    /** Enable dramatic mesh scan effect on navigation. Default: false */
    enableMeshScan?: boolean;
    /** Transition duration in seconds. Default: 0.35 */
    duration?: number;
  };
  className?: string;
}

/**
 * LayoutProvider - Combined atmospheric effects and page transition provider
 *
 * Merges AtmosphericProvider and TransitionProvider into a single wrapper
 * for simpler component hierarchy. All effects respect prefers-reduced-motion.
 *
 * Features:
 * - Film grain overlay for war-room archive atmosphere
 * - Floating dust particles for ambient movement
 * - Subtle scanlines for CRT/surveillance monitor feel
 * - Smooth page transitions with optional loading indicator
 * - Optional mesh scan overlay on navigation
 */
export const LayoutProvider: FC<LayoutProviderProps> = ({
  children,
  header,
  atmosphericEffects = {},
  pageTransition = {},
  className,
}) => {
  const {
    enableGrain = true,
    enableParticles = true,
    enableScanlines = true,
    grainOpacity = 0.04,
    particleCount = 40,
  } = atmosphericEffects;

  const {
    enableLoadingIndicator = true,
    enableMeshScan = false,
    duration = 0.35,
  } = pageTransition;

  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMeshScan, setShowMeshScan] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(pathname);

  // Mount detection and reduced motion preference
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration safety pattern
    setIsMounted(true);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle route changes for page transitions
  useEffect(() => {
    if (pathname !== currentPath) {
      if (reducedMotion) {
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
  }, [pathname, children, currentPath, duration, enableMeshScan, reducedMotion]);

  // Conditions for rendering effects
  const shouldRenderAtmosphericEffects = isMounted && !reducedMotion;
  const shouldAnimate = isMounted && !reducedMotion;

  // Render without animation for reduced motion
  if (reducedMotion) {
    return (
      <div className={className}>
        {header}
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Header rendered outside animation context to maintain fixed position */}
      {header}

      {/* Loading indicator */}
      {shouldAnimate && enableLoadingIndicator && (
        <PageLoadingIndicator isLoading={isLoading} />
      )}

      {/* Mesh scan overlay */}
      {shouldAnimate && enableMeshScan && (
        <MeshScanOverlay isActive={showMeshScan} />
      )}

      {/* Animated content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldAnimate ? { opacity: 0, y: -8 } : undefined}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn('will-change-transform', className)}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>

      {/* Global Atmospheric Effects */}
      {shouldRenderAtmosphericEffects && (
        <>
          {/* Film grain - subtle texture overlay */}
          {enableGrain && (
            <FilmGrainOverlay
              opacity={grainOpacity}
              animate={true}
              animationSpeed={80}
              blendMode="overlay"
              zIndex={9998}
            />
          )}

          {/* Floating dust particles - ambient movement */}
          {enableParticles && (
            <ParticleField
              count={particleCount}
              color="rgba(201, 219, 238, 0.15)"
              minSize={0.5}
              maxSize={2}
              speed={0.15}
              driftUp={true}
              style="dust"
              coverage="viewport"
              zIndex={5}
            />
          )}

          {/* Subtle scanlines - CRT/surveillance monitor feel */}
          {enableScanlines && (
            <ScanlineEffect
              opacity={0.02}
              lineSpacing={4}
              lineThickness={1}
              animate={false}
              coverage="viewport"
              zIndex={9997}
            />
          )}
        </>
      )}
    </>
  );
};

export default LayoutProvider;
