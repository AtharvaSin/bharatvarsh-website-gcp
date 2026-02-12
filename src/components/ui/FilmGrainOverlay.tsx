'use client';

import { useEffect, useRef, FC } from 'react';
import { cn } from '@/lib/utils';

export interface FilmGrainOverlayProps {
  /** Opacity of the grain effect (0-1). Default: 0.05 */
  opacity?: number;
  /** Whether the grain should animate. Default: true */
  animate?: boolean;
  /** Animation speed in ms. Default: 50 */
  animationSpeed?: number;
  /** Blend mode. Default: 'overlay' */
  blendMode?: 'overlay' | 'multiply' | 'screen' | 'soft-light';
  /** Additional className */
  className?: string;
  /** Z-index for layering. Default: 50 */
  zIndex?: number;
}

/**
 * FilmGrainOverlay - Creates an atmospheric film grain texture
 *
 * Uses canvas for GPU-accelerated performance.
 * The grain adds a cinematic, archival quality to the interface.
 */
export const FilmGrainOverlay: FC<FilmGrainOverlayProps> = ({
  opacity = 0.05,
  animate = true,
  animationSpeed = 50,
  blendMode = 'overlay',
  className,
  zIndex = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size to match window
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Generate grain pattern
    const generateGrain = () => {
      const imageData = ctx.createImageData(
        window.innerWidth,
        window.innerHeight
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Random grayscale value
        const value = Math.random() * 255;
        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = Math.random() * 25; // A - subtle random alpha
      }

      ctx.putImageData(imageData, 0, 0);
    };

    // Animation loop
    const animateGrain = (timestamp: number) => {
      if (timestamp - lastFrameTime.current >= animationSpeed) {
        generateGrain();
        lastFrameTime.current = timestamp;
      }

      if (animate) {
        animationRef.current = requestAnimationFrame(animateGrain);
      }
    };

    // Initial grain generation
    generateGrain();

    // Start animation if enabled
    if (animate) {
      animationRef.current = requestAnimationFrame(animateGrain);
    }

    // Respect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      } else if (!e.matches && animate) {
        animationRef.current = requestAnimationFrame(animateGrain);
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // If reduced motion is already set, don't animate
    if (mediaQuery.matches && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, animationSpeed]);

  const blendModeStyles: Record<string, string> = {
    overlay: 'mix-blend-overlay',
    multiply: 'mix-blend-multiply',
    screen: 'mix-blend-screen',
    'soft-light': 'mix-blend-soft-light',
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 pointer-events-none',
        blendModeStyles[blendMode],
        className
      )}
      style={{
        opacity,
        zIndex,
      }}
      aria-hidden="true"
    />
  );
};

export default FilmGrainOverlay;
