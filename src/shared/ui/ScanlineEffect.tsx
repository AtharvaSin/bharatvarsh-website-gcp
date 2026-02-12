'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';

export interface ScanlineEffectProps {
  /** Opacity of the scanlines (0-1). Default: 0.03 */
  opacity?: number;
  /** Space between scanlines in pixels. Default: 4 */
  lineSpacing?: number;
  /** Line thickness in pixels. Default: 1 */
  lineThickness?: number;
  /** Whether to animate. Default: false */
  animate?: boolean;
  /** Animation duration in seconds. Default: 8 */
  animationDuration?: number;
  /** Cover entire viewport or just container. Default: 'viewport' */
  coverage?: 'viewport' | 'container';
  /** Additional className */
  className?: string;
  /** Z-index for layering. Default: 51 */
  zIndex?: number;
}

/**
 * ScanlineEffect - Creates subtle CRT/monitor scanlines
 *
 * Uses CSS for optimal performance with optional animation.
 * Adds a surveillance monitor / retro-tech aesthetic.
 */
export const ScanlineEffect: FC<ScanlineEffectProps> = ({
  opacity = 0.03,
  lineSpacing = 4,
  lineThickness = 1,
  animate = false,
  animationDuration = 8,
  coverage = 'viewport',
  className,
  zIndex = 51,
}) => {
  const isViewport = coverage === 'viewport';

  return (
    <div
      className={cn(
        isViewport ? 'fixed inset-0' : 'absolute inset-0',
        'pointer-events-none overflow-hidden',
        className
      )}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {/* Horizontal scanlines */}
      <div
        className={cn(
          'absolute inset-0',
          animate && 'animate-scanline-scroll'
        )}
        style={{
          opacity,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${lineSpacing - lineThickness}px,
            rgba(0, 0, 0, 0.8) ${lineSpacing - lineThickness}px,
            rgba(0, 0, 0, 0.8) ${lineSpacing}px
          )`,
          backgroundSize: `100% ${lineSpacing}px`,
          animationDuration: animate ? `${animationDuration}s` : undefined,
        }}
      />

      {/* Subtle flicker overlay */}
      {animate && (
        <div
          className="absolute inset-0 animate-screen-flicker"
          style={{
            opacity: 0.01,
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
      )}

      {/* Corner vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, 0.15) 100%
          )`,
        }}
      />
    </div>
  );
};

export default ScanlineEffect;
