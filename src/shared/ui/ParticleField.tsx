'use client';

import { useEffect, useRef, FC, useCallback } from 'react';
import { cn } from '@/shared/utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface ParticleFieldProps {
  /** Number of particles. Default: 50 */
  count?: number;
  /** Particle color. Default: 'rgba(201, 219, 238, 0.3)' (powder blue) */
  color?: string;
  /** Minimum particle size. Default: 1 */
  minSize?: number;
  /** Maximum particle size. Default: 3 */
  maxSize?: number;
  /** Particle speed multiplier. Default: 0.2 */
  speed?: number;
  /** Whether particles drift upward. Default: true */
  driftUp?: boolean;
  /** Particle style: 'dust' | 'data' | 'snow'. Default: 'dust' */
  style?: 'dust' | 'data' | 'snow';
  /** Coverage: 'viewport' | 'container'. Default: 'viewport' */
  coverage?: 'viewport' | 'container';
  /** Additional className */
  className?: string;
  /** Z-index for layering. Default: 10 */
  zIndex?: number;
}

/**
 * ParticleField - Creates ambient floating particles
 *
 * Uses canvas with object pooling for performance.
 * Creates an atmospheric, lived-in quality to the interface.
 */
export const ParticleField: FC<ParticleFieldProps> = ({
  count = 50,
  color = 'rgba(201, 219, 238, 0.3)',
  minSize = 1,
  maxSize = 3,
  speed = 0.2,
  driftUp = true,
  style = 'dust',
  coverage = 'viewport',
  className,
  zIndex = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a particle
  const createParticle = useCallback(
    (width: number, height: number, randomY = true): Particle => {
      const particle: Particle = {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * speed,
        vy: driftUp
          ? -Math.random() * speed - 0.1
          : (Math.random() - 0.5) * speed,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };

      // Style-specific modifications
      if (style === 'data') {
        particle.size = Math.random() * 2 + 1;
        particle.vy = -Math.random() * speed * 2 - 0.2;
      } else if (style === 'snow') {
        particle.vy = Math.random() * speed + 0.1;
        particle.vx = Math.sin(Date.now() * 0.001 + particle.x) * 0.1;
      }

      return particle;
    },
    [speed, driftUp, minSize, maxSize, style]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number;
    let height: number;

    // Resize handler
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      if (coverage === 'viewport') {
        width = window.innerWidth;
        height = window.innerHeight;
      } else {
        const rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height, true)
    );

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Add subtle horizontal drift for dust
        if (style === 'dust') {
          particle.vx += (Math.random() - 0.5) * 0.01;
          particle.vx *= 0.99; // Damping
        }

        // Style-specific updates
        if (style === 'snow') {
          particle.vx = Math.sin(Date.now() * 0.001 + particle.x * 0.1) * 0.2;
        }

        // Calculate opacity based on life
        const lifeProgress = particle.life / particle.maxLife;
        const fadeOpacity =
          lifeProgress < 0.1
            ? lifeProgress * 10
            : lifeProgress > 0.9
              ? (1 - lifeProgress) * 10
              : 1;

        // Draw particle
        ctx.beginPath();

        if (style === 'data') {
          // Data particles are small rectangles
          ctx.fillStyle = color.replace(
            /[\d.]+\)$/,
            `${particle.opacity * fadeOpacity})`
          );
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        } else {
          // Dust and snow are circles
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(
            /[\d.]+\)$/,
            `${particle.opacity * fadeOpacity})`
          );
          ctx.fill();
        }

        // Reset particle if out of bounds or life expired
        if (
          particle.y < -10 ||
          particle.y > height + 10 ||
          particle.x < -10 ||
          particle.x > width + 10 ||
          particle.life > particle.maxLife
        ) {
          particlesRef.current[index] = createParticle(width, height, false);

          // For upward drift, spawn at bottom
          if (driftUp) {
            particlesRef.current[index].y = height + 10;
          } else if (style === 'snow') {
            particlesRef.current[index].y = -10;
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Respect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mediaQuery.matches) {
      animationRef.current = requestAnimationFrame(animate);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      } else if (!e.matches) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, color, speed, driftUp, style, coverage, createParticle]);

  const isViewport = coverage === 'viewport';

  return (
    <div
      ref={containerRef}
      className={cn(
        isViewport ? 'fixed inset-0' : 'absolute inset-0',
        'pointer-events-none overflow-hidden',
        className
      )}
      style={{ zIndex }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default ParticleField;
