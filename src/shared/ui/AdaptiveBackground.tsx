'use client';

import { FC, useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ResponsiveImage } from './ResponsiveImage';
import { useAdaptiveAnimations } from '@/shared/hooks';
import { cn } from '@/shared/utils';

/**
 * Props for AdaptiveBackground component
 */
export interface AdaptiveBackgroundProps {
  /** Landscape-oriented background image */
  landscapeSrc: string;
  /** Portrait-oriented background image */
  portraitSrc: string;
  /** Alt text for the background image */
  alt: string;
  /** Parallax speed (0-1, higher = more movement). Disabled on low-end devices. */
  speed?: number;
  /** Overlay opacity (0-1) */
  overlayOpacity?: number;
  /** Gradient overlay direction */
  gradient?: 'top' | 'bottom' | 'both' | 'none';
  /** Object position for the image */
  objectPosition?: string;
  /** Object position specifically for portrait mode (optional) */
  portraitObjectPosition?: string;
  /** Priority loading for above-the-fold content */
  priority?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Children to render on top of the background */
  children?: ReactNode;
  /** Image quality (1-100) */
  quality?: number;
}

/**
 * AdaptiveBackground - Performance-aware parallax background
 *
 * Combines orientation-responsive images with parallax effects,
 * automatically disabling heavy animations on low-end devices
 * and when users prefer reduced motion.
 *
 * @example
 * ```tsx
 * <AdaptiveBackground
 *   landscapeSrc="/images/section-landscape.webp"
 *   portraitSrc="/images/section-portrait.webp"
 *   alt="Section background"
 *   speed={0.3}
 *   overlayOpacity={0.5}
 *   gradient="both"
 * >
 *   <ContentSection />
 * </AdaptiveBackground>
 * ```
 */
export const AdaptiveBackground: FC<AdaptiveBackgroundProps> = ({
  landscapeSrc,
  portraitSrc,
  alt,
  speed = 0.5,
  overlayOpacity = 0.6,
  gradient = 'both',
  objectPosition = 'center',
  portraitObjectPosition,
  priority = false,
  className,
  children,
  quality = 85,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { enableParallax, parallaxIntensity } = useAdaptiveAnimations();

  // Set up scroll-linked parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate parallax movement based on device capability
  const effectiveSpeed = enableParallax ? speed * parallaxIntensity : 0;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `${effectiveSpeed * 30}%`]
  );

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Parallax image container */}
      <motion.div
        style={enableParallax ? { y } : undefined}
        className={cn(
          'absolute inset-0',
          enableParallax && 'scale-110' // Extra scale for parallax room
        )}
      >
        <ResponsiveImage
          landscapeSrc={landscapeSrc}
          portraitSrc={portraitSrc}
          alt={alt}
          priority={priority}
          objectPosition={objectPosition}
          quality={quality}
          sizes="100vw"
        />
      </motion.div>

      {/* Dark overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-[var(--obsidian-900)]"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Gradient overlays */}
      {(gradient === 'top' || gradient === 'both') && (
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--obsidian-900)] to-transparent" />
      )}
      {(gradient === 'bottom' || gradient === 'both') && (
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--obsidian-900)] to-transparent" />
      )}

      {/* Children content */}
      {children}
    </div>
  );
};

/**
 * Props for StaticBackground - non-parallax version
 */
export interface StaticBackgroundProps {
  /** Landscape-oriented background image */
  landscapeSrc: string;
  /** Portrait-oriented background image */
  portraitSrc: string;
  /** Alt text for the background image */
  alt: string;
  /** Overlay opacity (0-1) */
  overlayOpacity?: number;
  /** Gradient overlay direction */
  gradient?: 'top' | 'bottom' | 'both' | 'none';
  /** Object position for the image */
  objectPosition?: string;
  /** Priority loading */
  priority?: boolean;
  /** Additional className */
  className?: string;
  /** Children to render on top */
  children?: ReactNode;
}

/**
 * StaticBackground - Simple responsive background without parallax
 *
 * Use this for sections where parallax isn't needed or for
 * lightweight background implementations.
 */
export const StaticBackground: FC<StaticBackgroundProps> = ({
  landscapeSrc,
  portraitSrc,
  alt,
  overlayOpacity = 0.6,
  gradient = 'both',
  objectPosition = 'center',
  priority = false,
  className,
  children,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Image */}
      <ResponsiveImage
        landscapeSrc={landscapeSrc}
        portraitSrc={portraitSrc}
        alt={alt}
        priority={priority}
        objectPosition={objectPosition}
        sizes="100vw"
      />

      {/* Dark overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-[var(--obsidian-900)]"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Gradient overlays */}
      {(gradient === 'top' || gradient === 'both') && (
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--obsidian-900)] to-transparent" />
      )}
      {(gradient === 'bottom' || gradient === 'both') && (
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--obsidian-900)] to-transparent" />
      )}

      {/* Children content */}
      {children}
    </div>
  );
};
