'use client';

import { FC, useRef, ReactNode, ElementType } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/shared/utils';
import { useIsPortrait, useAdaptiveAnimations } from '@/shared/hooks';

interface ScrollSectionProps {
  id: string;
  children: ReactNode;
  background?: ReactNode;
  className?: string;
  height?: 'full' | 'half' | 'auto';
  snap?: boolean;
}

export const ScrollSection: FC<ScrollSectionProps> = ({
  id,
  children,
  background,
  className,
  height = 'full',
  snap = true,
}) => {
  const sectionRef = useRef<HTMLElement>(null);

  const heightClass = {
    full: 'min-h-screen',
    half: 'min-h-[50vh]',
    auto: 'min-h-0',
  }[height];

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        heightClass,
        snap && 'snap-start',
        'relative',
        className
      )}
    >
      {/* Background layer */}
      {background && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {background}
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-20">
        {children}
      </div>
    </section>
  );
};

interface TextRevealProps {
  children: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  tag = 'p',
  delay = 0,
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const Tag = tag as ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

interface ParallaxBackgroundProps {
  className?: string;
  speed?: number;
  overlay?: boolean;
  overlayOpacity?: number;
  gradient?: 'top' | 'bottom' | 'both' | 'none';
  /** Landscape image source (default) */
  imageSrc?: string;
  /** Portrait image source (optional, for mobile portrait mode) */
  imagePortraitSrc?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  objectPosition?: string;
  /** Object position for portrait mode (optional) */
  portraitObjectPosition?: string;
}

export const ParallaxBackground: FC<ParallaxBackgroundProps> = ({
  className,
  speed = 0.5,
  overlay = true,
  overlayOpacity = 0.6,
  gradient = 'both',
  imageSrc,
  imagePortraitSrc,
  imageAlt = 'Background',
  imagePriority = false,
  objectPosition = 'center',
  portraitObjectPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isPortrait = useIsPortrait();
  const { enableParallax, parallaxIntensity } = useAdaptiveAnimations();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate effective parallax - disabled on low-end devices
  const effectiveSpeed = enableParallax ? speed * parallaxIntensity : 0;
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${effectiveSpeed * 30}%`]);

  // Determine which image to show based on orientation
  const currentImageSrc = isPortrait && imagePortraitSrc ? imagePortraitSrc : imageSrc;
  const currentObjectPosition = isPortrait && portraitObjectPosition ? portraitObjectPosition : objectPosition;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        style={enableParallax ? { y } : undefined}
        className={cn(
          'absolute inset-0',
          enableParallax && 'scale-110', // Extra scale only when parallax is enabled
          className
        )}
      >
        {currentImageSrc && (
          <Image
            src={currentImageSrc}
            alt={imageAlt}
            fill
            priority={imagePriority}
            className="object-cover transition-opacity duration-300"
            style={{ objectPosition: currentObjectPosition }}
            sizes="100vw"
          />
        )}
      </motion.div>

      {overlay && (
        <div
          className="absolute inset-0 bg-[var(--obsidian-900)]"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {(gradient === 'top' || gradient === 'both') && (
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--obsidian-900)] to-transparent" />
      )}

      {(gradient === 'bottom' || gradient === 'both') && (
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--obsidian-900)] to-transparent" />
      )}
    </div>
  );
};

export default ScrollSection;
