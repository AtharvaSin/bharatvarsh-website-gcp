'use client';

import { useMemo } from 'react';
import { usePrefersReducedMotion } from './use-media-query';
import { useDeviceCapability, DeviceCapability } from './use-device-capability';

/**
 * Animation settings based on device capability
 */
export interface AnimationSettings {
  /** Enable parallax scroll effects */
  enableParallax: boolean;
  /** Enable particle/ambient effects */
  enableParticles: boolean;
  /** Enable backdrop blur effects */
  enableBackdropBlur: boolean;
  /** Enable film grain overlay */
  enableFilmGrain: boolean;
  /** Enable scanline effects */
  enableScanlines: boolean;
  /** Enable page transitions */
  enablePageTransitions: boolean;
  /** Enable 3D transforms */
  enable3DTransforms: boolean;
  /** Animation duration multiplier (0.5 = faster, 1 = normal, 2 = slower) */
  durationMultiplier: number;
  /** Maximum particle count for ambient effects */
  maxParticles: number;
  /** Parallax speed multiplier (0 = disabled, 1 = full effect) */
  parallaxIntensity: number;
}

/**
 * Animation settings presets by capability level
 */
const SETTINGS_BY_CAPABILITY: Record<DeviceCapability, AnimationSettings> = {
  low: {
    enableParallax: false,
    enableParticles: false,
    enableBackdropBlur: false,
    enableFilmGrain: false,
    enableScanlines: false,
    enablePageTransitions: true, // Keep basic transitions
    enable3DTransforms: false,
    durationMultiplier: 0.5, // Faster animations
    maxParticles: 0,
    parallaxIntensity: 0,
  },
  medium: {
    enableParallax: true,
    enableParticles: true,
    enableBackdropBlur: true,
    enableFilmGrain: true,
    enableScanlines: false, // Disable scanlines on medium
    enablePageTransitions: true,
    enable3DTransforms: true,
    durationMultiplier: 1,
    maxParticles: 20,
    parallaxIntensity: 0.7,
  },
  high: {
    enableParallax: true,
    enableParticles: true,
    enableBackdropBlur: true,
    enableFilmGrain: true,
    enableScanlines: true,
    enablePageTransitions: true,
    enable3DTransforms: true,
    durationMultiplier: 1,
    maxParticles: 40,
    parallaxIntensity: 1,
  },
};

/**
 * Settings when user prefers reduced motion
 */
const REDUCED_MOTION_SETTINGS: AnimationSettings = {
  enableParallax: false,
  enableParticles: false,
  enableBackdropBlur: true, // Backdrop blur is static, not animation
  enableFilmGrain: false,
  enableScanlines: false,
  enablePageTransitions: false,
  enable3DTransforms: false,
  durationMultiplier: 0.01, // Near-instant
  maxParticles: 0,
  parallaxIntensity: 0,
};

/**
 * Hook that returns adaptive animation settings based on device capability
 * and user preferences (reduced motion).
 *
 * Use this hook to conditionally enable/disable animations for better
 * performance on low-end devices and accessibility compliance.
 *
 * @returns AnimationSettings object with recommended settings
 *
 * @example
 * ```tsx
 * const { enableParallax, enableParticles } = useAdaptiveAnimations();
 *
 * return (
 *   <>
 *     {enableParallax && <ParallaxEffect />}
 *     {enableParticles && <ParticleField count={maxParticles} />}
 *   </>
 * );
 * ```
 */
export function useAdaptiveAnimations(): AnimationSettings {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { capability, supportsBackdropFilter } = useDeviceCapability();

  return useMemo(() => {
    // Reduced motion takes absolute precedence
    if (prefersReducedMotion) {
      return {
        ...REDUCED_MOTION_SETTINGS,
        // Respect actual backdrop-filter support
        enableBackdropBlur: supportsBackdropFilter,
      };
    }

    // Get settings for capability level
    const settings = { ...SETTINGS_BY_CAPABILITY[capability] };

    // Override backdrop blur based on actual browser support
    if (!supportsBackdropFilter) {
      settings.enableBackdropBlur = false;
    }

    return settings;
  }, [capability, prefersReducedMotion, supportsBackdropFilter]);
}

/**
 * Hook that returns whether heavy animations should be disabled
 * Simplified boolean for quick checks
 */
export function useShouldReduceAnimations(): boolean {
  const { enableParallax } = useAdaptiveAnimations();
  return !enableParallax;
}
