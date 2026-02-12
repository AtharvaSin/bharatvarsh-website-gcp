/**
 * Hooks Barrel Export
 *
 * Central export point for all custom React hooks.
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
  // Orientation hooks
  useIsPortrait,
  useIsLandscape,
  // Combined viewport state
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

// Form hooks
export { useDossierForm } from './use-dossier-form';
// Note: DossierFormData, DossierState, and DossierFormErrors types are in @/types

// Timeline hooks
export {
  useTimelineScroll,
  useScrollValues,
  type UseTimelineScrollOptions,
  type UseTimelineScrollReturn,
} from './use-timeline-scroll';
