'use client';

import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type GlyphType =
  | 'trishul' // Trident symbol
  | 'mesh' // Mesh/network pattern
  | 'treaty' // Treaty glyph (mountain chevrons)
  | 'chakra' // Circular chakra pattern
  | 'script' // Devanagari script elements
  | 'grid'; // Digital grid pattern

export interface GlyphWatermarkProps {
  /** Type of glyph to display. Default: 'trishul' */
  glyph?: GlyphType;
  /** Opacity of the watermark (0-1). Default: 0.03 */
  opacity?: number;
  /** Size of the glyph. Default: '60%' */
  size?: string;
  /** Position of the glyph. Default: 'center' */
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  /** Color of the glyph. Default: 'var(--powder-500)' */
  color?: string;
  /** Whether to animate. Default: false */
  animate?: boolean;
  /** Animation type: 'pulse' | 'rotate' | 'fade'. Default: 'pulse' */
  animationType?: 'pulse' | 'rotate' | 'fade';
  /** Additional className */
  className?: string;
  /** Z-index for layering. Default: 5 */
  zIndex?: number;
}

/**
 * GlyphWatermark - Background sigil/glyph watermarks
 *
 * Adds mystical, archival atmosphere with subtle background symbols.
 * Supports multiple glyph types representing different aspects of Bharatvarsh.
 */
export const GlyphWatermark: FC<GlyphWatermarkProps> = ({
  glyph = 'trishul',
  opacity = 0.03,
  size = '60%',
  position = 'center',
  color = 'var(--powder-500)',
  animate = false,
  animationType = 'pulse',
  className,
  zIndex = 5,
}) => {
  // Position styles
  const positionStyles = useMemo(() => {
    switch (position) {
      case 'top-left':
        return { top: '-10%', left: '-10%', transform: 'none' };
      case 'top-right':
        return { top: '-10%', right: '-10%', transform: 'none' };
      case 'bottom-left':
        return { bottom: '-10%', left: '-10%', transform: 'none' };
      case 'bottom-right':
        return { bottom: '-10%', right: '-10%', transform: 'none' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  }, [position]);

  // Animation variants
  const animationProps = useMemo(() => {
    if (!animate) return {};

    switch (animationType) {
      case 'rotate':
        return {
          animate: { rotate: [0, 360] },
          transition: { duration: 120, repeat: Infinity, ease: 'linear' as const },
        };
      case 'fade':
        return {
          animate: { opacity: [opacity * 0.5, opacity, opacity * 0.5] },
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'pulse':
      default:
        return {
          animate: { scale: [1, 1.02, 1], opacity: [opacity, opacity * 1.2, opacity] },
          transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
        };
    }
  }, [animate, animationType, opacity]);

  // Glyph SVG paths
  const renderGlyph = () => {
    const commonProps = {
      fill: 'none',
      stroke: color,
      strokeWidth: 1,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    };

    switch (glyph) {
      case 'trishul':
        // Trident symbol - the iconic Bharatvarsh symbol
        return (
          <svg viewBox="0 0 100 120" className="w-full h-full">
            {/* Central prong */}
            <path
              d="M50 10 L50 100 M50 10 L50 5 M50 15 C45 15 42 20 42 30 L42 25 M50 15 C55 15 58 20 58 30 L58 25"
              {...commonProps}
            />
            {/* Left prong */}
            <path
              d="M50 25 C35 25 30 15 30 8 M30 15 C28 12 25 12 25 15"
              {...commonProps}
            />
            {/* Right prong */}
            <path
              d="M50 25 C65 25 70 15 70 8 M70 15 C72 12 75 12 75 15"
              {...commonProps}
            />
            {/* Decorative elements */}
            <circle cx="50" cy="40" r="4" {...commonProps} />
            <path d="M42 45 L58 45" {...commonProps} />
            <path d="M45 50 L55 50" {...commonProps} />
          </svg>
        );

      case 'mesh':
        // Network/surveillance mesh pattern
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid lines */}
            {[20, 40, 60, 80].map((pos) => (
              <g key={pos}>
                <line x1={pos} y1="0" x2={pos} y2="100" {...commonProps} />
                <line x1="0" y1={pos} x2="100" y2={pos} {...commonProps} />
              </g>
            ))}
            {/* Nodes */}
            {[20, 40, 60, 80].map((x) =>
              [20, 40, 60, 80].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2" {...commonProps} />
              ))
            )}
            {/* Central hub */}
            <circle cx="50" cy="50" r="8" {...commonProps} />
            <circle cx="50" cy="50" r="4" fill={color} fillOpacity={0.3} stroke="none" />
          </svg>
        );

      case 'treaty':
        // Treaty glyph - mountain chevrons with hollow circle (sanctuary symbol)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer chevron */}
            <path d="M50 20 L20 60 L50 50 L80 60 L50 20" {...commonProps} />
            {/* Inner chevron */}
            <path d="M50 35 L30 55 L50 48 L70 55 L50 35" {...commonProps} />
            {/* Hollow circle (sanctuary) */}
            <circle cx="50" cy="70" r="15" {...commonProps} />
            <circle cx="50" cy="70" r="8" {...commonProps} />
          </svg>
        );

      case 'chakra':
        // Circular chakra pattern
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer rings */}
            <circle cx="50" cy="50" r="45" {...commonProps} />
            <circle cx="50" cy="50" r="35" {...commonProps} />
            <circle cx="50" cy="50" r="25" {...commonProps} />
            <circle cx="50" cy="50" r="15" {...commonProps} />
            <circle cx="50" cy="50" r="5" fill={color} fillOpacity={0.3} stroke="none" />
            {/* Spokes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 50 + Math.cos(rad) * 15;
              const y1 = 50 + Math.sin(rad) * 15;
              const x2 = 50 + Math.cos(rad) * 45;
              const y2 = 50 + Math.sin(rad) * 45;
              return (
                <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} {...commonProps} />
              );
            })}
          </svg>
        );

      case 'script':
        // Devanagari-inspired abstract script elements
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Top line (shirorekha) */}
            <line x1="15" y1="25" x2="85" y2="25" {...commonProps} strokeWidth={2} />
            {/* Abstract letter forms */}
            <path d="M25 25 L25 50 C25 60 35 65 40 55 L40 25" {...commonProps} />
            <path d="M50 25 L50 55 M50 40 C55 35 65 35 65 45 C65 55 55 60 50 55" {...commonProps} />
            <path d="M75 25 L75 45 C75 55 70 60 65 60 L60 60" {...commonProps} />
            {/* Decorative dots (anusvara style) */}
            <circle cx="45" cy="70" r="3" fill={color} fillOpacity={0.5} stroke="none" />
            <circle cx="60" cy="75" r="2" fill={color} fillOpacity={0.3} stroke="none" />
          </svg>
        );

      case 'grid':
        // Digital grid pattern
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Perspective grid */}
            <path
              d="M0 100 L50 30 L100 100"
              {...commonProps}
              fill="none"
            />
            {[40, 50, 60, 70, 80, 90].map((y) => (
              <line
                key={y}
                x1={50 - (y - 30) * 0.7}
                y1={y}
                x2={50 + (y - 30) * 0.7}
                y2={y}
                {...commonProps}
              />
            ))}
            {/* Vertical lines */}
            {[-30, -15, 0, 15, 30].map((offset) => (
              <line
                key={offset}
                x1={50 + offset * 0.3}
                y1="30"
                x2={50 + offset}
                y2="100"
                {...commonProps}
              />
            ))}
            {/* Data points */}
            <circle cx="50" cy="30" r="3" fill={color} fillOpacity={0.5} stroke="none" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute pointer-events-none',
        className
      )}
      style={{
        ...positionStyles,
        width: size,
        height: size,
        opacity,
        zIndex,
      }}
      aria-hidden="true"
      {...animationProps}
    >
      {renderGlyph()}
    </motion.div>
  );
};

export default GlyphWatermark;
