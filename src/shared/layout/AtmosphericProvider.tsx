'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import { FilmGrainOverlay, ParticleField, ScanlineEffect } from '@/shared/ui';

export interface AtmosphericProviderProps {
  children: ReactNode;
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
}

/**
 * AtmosphericProvider - Global atmospheric effects wrapper
 *
 * Provides the war-room archive atmosphere across the entire site.
 * All effects respect prefers-reduced-motion automatically.
 */
export const AtmosphericProvider: FC<AtmosphericProviderProps> = ({
  children,
  enableGrain = true,
  enableParticles = true,
  enableScanlines = true,
  grainOpacity = 0.04,
  particleCount = 40,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Standard hydration safety pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration safety pattern
    setIsMounted(true);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Don't render effects during SSR or if reduced motion is preferred
  const shouldRenderEffects = isMounted && !reducedMotion;

  return (
    <>
      {children}

      {/* Global Atmospheric Effects */}
      {shouldRenderEffects && (
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

export default AtmosphericProvider;
