/**
 * Shared Hooks Barrel Export
 *
 * Truly reusable hooks that are not feature-specific.
 */

// Media query hooks
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useIsPortrait,
  useIsLandscape,
  useViewport,
  type ViewportState,
} from './use-media-query';

// Device capability hooks
export {
  useDeviceCapability,
  useIsLowEndDevice,
  type DeviceCapability,
  type DeviceCapabilities,
} from './use-device-capability';

// Adaptive animation hooks
export {
  useAdaptiveAnimations,
  useShouldReduceAnimations,
  type AnimationSettings,
} from './use-adaptive-animations';
