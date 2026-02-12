'use client';

import { useState, useEffect } from 'react';

/**
 * Device capability levels for adaptive performance
 */
export type DeviceCapability = 'low' | 'medium' | 'high';

/**
 * Device capabilities detection result
 */
export interface DeviceCapabilities {
  /** Overall capability level */
  capability: DeviceCapability;
  /** Whether the device supports backdrop-filter */
  supportsBackdropFilter: boolean;
  /** Number of logical CPU cores */
  hardwareConcurrency: number;
  /** Device memory in GB (null if not available) */
  deviceMemory: number | null;
  /** Whether this is a touch-capable device */
  isTouchDevice: boolean;
  /** Whether the device is considered low-end */
  isLowEnd: boolean;
}

/**
 * Default capabilities (conservative for SSR)
 */
const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  capability: 'medium',
  supportsBackdropFilter: true,
  hardwareConcurrency: 4,
  deviceMemory: null,
  isTouchDevice: false,
  isLowEnd: false,
};

/**
 * Hook to detect device capabilities for adaptive performance
 *
 * Uses navigator APIs to determine device performance characteristics
 * and suggests appropriate animation/effect levels.
 *
 * @returns DeviceCapabilities object with capability level and feature support
 */
export function useDeviceCapability(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);

  useEffect(() => {
    const detectCapabilities = (): DeviceCapabilities => {
      // Extended Navigator type for experimental APIs
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        hardwareConcurrency?: number;
        connection?: {
          effectiveType?: string;
          saveData?: boolean;
        };
      };

      // Get hardware info
      const hardwareConcurrency = nav.hardwareConcurrency || 4;
      const deviceMemory = nav.deviceMemory || null;

      // Check touch capability
      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      // Check backdrop-filter support
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)');

      // Check for data saver mode
      const dataSaverEnabled = nav.connection?.saveData || false;

      // Check for slow connection
      const slowConnection = nav.connection?.effectiveType === 'slow-2g' ||
                            nav.connection?.effectiveType === '2g';

      // Determine capability level
      let capability: DeviceCapability = 'medium';
      let isLowEnd = false;

      // Low-end detection criteria
      if (
        (deviceMemory !== null && deviceMemory <= 2) ||
        hardwareConcurrency <= 2 ||
        dataSaverEnabled ||
        slowConnection
      ) {
        capability = 'low';
        isLowEnd = true;
      }
      // Also treat small mobile touch devices as low by default
      else if (isTouchDevice && window.innerWidth < 768) {
        capability = 'low';
        isLowEnd = true;
      }
      // High-end detection
      else if (
        deviceMemory !== null &&
        deviceMemory >= 8 &&
        hardwareConcurrency >= 8
      ) {
        capability = 'high';
      }

      return {
        capability,
        supportsBackdropFilter,
        hardwareConcurrency,
        deviceMemory,
        isTouchDevice,
        isLowEnd,
      };
    };

    setCapabilities(detectCapabilities());

    // Re-check on resize (viewport size affects capability detection)
    const handleResize = () => {
      setCapabilities(detectCapabilities());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return capabilities;
}

/**
 * Simple hook to check if device is low-end
 * Useful for quick conditionals in components
 */
export function useIsLowEndDevice(): boolean {
  const { isLowEnd } = useDeviceCapability();
  return isLowEnd;
}
