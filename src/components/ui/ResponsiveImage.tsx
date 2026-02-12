'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { useIsPortrait, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Props for ResponsiveImage component
 */
export interface ResponsiveImageProps {
  /** Landscape-oriented image source (default, used in landscape mode) */
  landscapeSrc: string;
  /** Portrait-oriented image source (used in portrait mode) */
  portraitSrc: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fill container (default: true) */
  fill?: boolean;
  /** Priority loading (for above-the-fold images) */
  priority?: boolean;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Object position (e.g., 'center', 'top', 'center top') */
  objectPosition?: string;
  /** Additional className for the image */
  className?: string;
  /** Sizes attribute for responsive loading optimization */
  sizes?: string;
  /** Image quality (1-100) */
  quality?: number;
  /** Blur placeholder data URL */
  blurDataURL?: string;
  /** Enable smooth transition between images on orientation change */
  enableTransition?: boolean;
  /** Callback when image loads */
  onLoad?: () => void;
}

/**
 * ResponsiveImage - Orientation-aware image component
 *
 * Automatically switches between portrait and landscape image sources
 * based on device orientation. Includes smooth transitions and
 * respects user motion preferences.
 *
 * @example
 * ```tsx
 * <ResponsiveImage
 *   landscapeSrc="/images/hero-landscape.webp"
 *   portraitSrc="/images/hero-portrait.webp"
 *   alt="Hero image"
 *   priority
 *   objectPosition="center top"
 * />
 * ```
 */
export const ResponsiveImage: FC<ResponsiveImageProps> = ({
  landscapeSrc,
  portraitSrc,
  alt,
  fill = true,
  priority = false,
  objectFit = 'cover',
  objectPosition = 'center',
  className,
  sizes = '100vw',
  quality = 85,
  blurDataURL,
  enableTransition = true,
  onLoad,
}) => {
  const isPortrait = useIsPortrait();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(landscapeSrc);

  // Track orientation changes for smooth transitions
  useEffect(() => {
    const newSrc = isPortrait ? portraitSrc : landscapeSrc;
    if (newSrc !== currentSrc) {
      setIsLoaded(false);
      setCurrentSrc(newSrc);
    }
  }, [isPortrait, portraitSrc, landscapeSrc, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Determine if we should animate transitions
  const shouldAnimate = enableTransition && !prefersReducedMotion;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      quality={quality}
      sizes={sizes}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      onLoad={handleLoad}
      className={cn(
        // Base object-fit class
        objectFit === 'cover' && 'object-cover',
        objectFit === 'contain' && 'object-contain',
        objectFit === 'fill' && 'object-fill',
        objectFit === 'none' && 'object-none',
        // Transition for smooth image swaps
        shouldAnimate && 'transition-opacity duration-300',
        shouldAnimate && !isLoaded && 'opacity-0',
        shouldAnimate && isLoaded && 'opacity-100',
        className
      )}
      style={{ objectPosition }}
    />
  );
};

/**
 * Props for OrientationImage - simpler version with optional portrait
 */
export interface OrientationImageProps {
  /** Primary image source (used when portrait variant unavailable) */
  src: string;
  /** Optional portrait variant */
  portraitSrc?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fill container (default: true) */
  fill?: boolean;
  /** Priority loading */
  priority?: boolean;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Object position for landscape mode */
  objectPosition?: string;
  /** Object position for portrait mode (if different) */
  portraitObjectPosition?: string;
  /** Additional className */
  className?: string;
  /** Sizes attribute */
  sizes?: string;
  /** Image quality */
  quality?: number;
}

/**
 * OrientationImage - Fallback-aware orientation image
 *
 * Uses portrait variant if available, otherwise uses the primary image
 * with adjusted object position for portrait mode.
 */
export const OrientationImage: FC<OrientationImageProps> = ({
  src,
  portraitSrc,
  alt,
  fill = true,
  priority = false,
  objectFit = 'cover',
  objectPosition = 'center',
  portraitObjectPosition,
  className,
  sizes = '100vw',
  quality = 85,
}) => {
  const isPortrait = useIsPortrait();

  // If we have a portrait variant, use ResponsiveImage
  if (portraitSrc) {
    return (
      <ResponsiveImage
        landscapeSrc={src}
        portraitSrc={portraitSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        objectFit={objectFit}
        objectPosition={isPortrait && portraitObjectPosition ? portraitObjectPosition : objectPosition}
        className={className}
        sizes={sizes}
        quality={quality}
      />
    );
  }

  // No portrait variant - use single image with position adjustment
  const currentPosition = isPortrait && portraitObjectPosition
    ? portraitObjectPosition
    : objectPosition;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={cn(
        objectFit === 'cover' && 'object-cover',
        objectFit === 'contain' && 'object-contain',
        objectFit === 'fill' && 'object-fill',
        objectFit === 'none' && 'object-none',
        className
      )}
      style={{ objectPosition: currentPosition }}
    />
  );
};
