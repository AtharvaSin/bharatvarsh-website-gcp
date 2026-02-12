'use client';

import { FC, useRef, useMemo, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { cn } from '@/shared/utils';

export type TextRevealVariant =
  | 'character' // Character by character reveal
  | 'word' // Word by word reveal
  | 'line' // Line by line reveal
  | 'fade' // Simple fade in
  | 'typewriter' // Typewriter effect with cursor
  | 'glitch'; // Glitch reveal effect

export interface TextRevealProps {
  /** The text to reveal */
  children: string;
  /** Animation variant. Default: 'word' */
  variant?: TextRevealVariant;
  /** HTML element to render. Default: 'span' */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number;
  /** Duration of each element's animation in seconds. Default: 0.05 */
  duration?: number;
  /** Stagger delay between elements in seconds. Default: 0.03 */
  stagger?: number;
  /** Whether to trigger on view. Default: true */
  triggerOnView?: boolean;
  /** Viewport margin for trigger. Default: '-100px' */
  viewportMargin?: string;
  /** Whether animation has played. Used for controlled animations */
  hasPlayed?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Show cursor for typewriter effect. Default: true */
  showCursor?: boolean;
  /** Glow color for character reveal. Default: 'var(--mustard-500)' */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

/**
 * TextReveal - Animated text reveal component
 *
 * Supports multiple animation variants for dramatic text reveals.
 * Perfect for hero titles, section headings, and dramatic narrative moments.
 */
export const TextReveal: FC<TextRevealProps> = ({
  children,
  variant = 'word',
  as: Element = 'span',
  delay = 0,
  duration = 0.05,
  stagger = 0.03,
  triggerOnView = true,
  viewportMargin = '-100px',
  hasPlayed,
  onComplete,
  showCursor = true,
  glowColor = 'var(--mustard-500)',
  className,
}) => {
  const ref = useRef<HTMLElement>(null);
  // Pre-compute random values for glitch effect (stable across renders)
  const [glitchValues] = useState(() => ({
    x: Math.random() * 20 - 10,
    y: Math.random() * 10 - 5,
    skewX: Math.random() * 10 - 5,
  }));
  const isInView = useInView(ref, {
    once: true,
    // Type assertion needed because Framer Motion's margin type is more restrictive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    margin: viewportMargin as any,
  });

  // Determine if animation should play
  const shouldAnimate =
    hasPlayed !== undefined ? hasPlayed : triggerOnView ? isInView : true;

  // Split text based on variant
  const elements = useMemo(() => {
    switch (variant) {
      case 'character':
      case 'typewriter':
      case 'glitch':
        return children.split('');
      case 'word':
        return children.split(' ');
      case 'line':
        return children.split('\n');
      case 'fade':
      default:
        return [children];
    }
  }, [children, variant]);

  // Animation variants for container
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  // Animation variants for each element based on variant type
  const getElementVariants = (): Variants => {
    switch (variant) {
      case 'character':
        return {
          hidden: {
            opacity: 0,
            y: 20,
            filter: 'blur(10px)',
          },
          visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              duration: duration * 2,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
        };
      case 'word':
        return {
          hidden: {
            opacity: 0,
            y: 30,
            rotateX: -90,
          },
          visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
        };
      case 'line':
        return {
          hidden: {
            opacity: 0,
            x: -50,
          },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
        };
      case 'typewriter':
        return {
          hidden: {
            opacity: 0,
            display: 'none',
          },
          visible: {
            opacity: 1,
            display: 'inline',
            transition: {
              duration: 0.01,
            },
          },
        };
      case 'glitch':
        // Use pre-computed random values for glitch effect
        return {
          hidden: {
            opacity: 0,
            x: glitchValues.x,
            y: glitchValues.y,
            skewX: glitchValues.skewX,
          },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            skewX: 0,
            transition: {
              duration: 0.3,
              ease: 'easeOut' as const,
            },
          },
        };
      case 'fade':
      default:
        return {
          hidden: {
            opacity: 0,
            y: 20,
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
        };
    }
  };

  const elementVariants = getElementVariants();

  // Render based on variant
  const renderElements = () => {
    return elements.map((element, index) => {
      const isSpace = element === ' ';
      const key = `${element}-${index}`;

      // Handle spaces differently
      if (variant === 'word' && index < elements.length - 1) {
        return (
          <span key={key} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              variants={elementVariants}
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {element}
            </motion.span>
            <span className="inline-block">&nbsp;</span>
          </span>
        );
      }

      if (variant === 'character' || variant === 'typewriter') {
        return (
          <motion.span
            key={key}
            className={cn(
              'inline-block',
              variant === 'character' &&
                'transition-[text-shadow] duration-300',
              isSpace && 'w-[0.25em]'
            )}
            variants={elementVariants}
            style={{
              willChange: 'transform, opacity, filter',
              textShadow:
                variant === 'character' ? `0 0 10px ${glowColor}` : undefined,
            }}
          >
            {isSpace ? '\u00A0' : element}
          </motion.span>
        );
      }

      if (variant === 'glitch') {
        return (
          <motion.span
            key={key}
            className={cn('inline-block', isSpace && 'w-[0.25em]')}
            variants={elementVariants}
            style={{ willChange: 'transform, opacity' }}
          >
            {isSpace ? '\u00A0' : element}
          </motion.span>
        );
      }

      return (
        <span key={key} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={elementVariants}
            style={{ willChange: 'transform, opacity' }}
          >
            {element}
          </motion.span>
        </span>
      );
    });
  };

  // Create the motion element dynamically
  const MotionElement = motion[Element] as typeof motion.span;

  return (
    <MotionElement
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={cn(
        'relative',
        variant === 'word' && '[perspective:1000px]',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      onAnimationComplete={() => onComplete?.()}
      aria-label={children}
    >
      {renderElements()}

      {/* Typewriter cursor */}
      {variant === 'typewriter' && showCursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-1 bg-current align-middle"
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            // Step function for blinking cursor effect
            ease: 'linear' as const,
            times: [0, 0.5, 1],
          }}
          aria-hidden="true"
        />
      )}
    </MotionElement>
  );
};

export default TextReveal;
