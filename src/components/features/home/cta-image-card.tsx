'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandaloneStamp, useStampTrigger, GlyphWatermark } from '@/components/ui';

interface CTAImageCardProps {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  accentColor: string;
  index: number;
  isInView: boolean;
  className?: string;
  /** Optional glyph watermark for war-room effect */
  glyph?: 'trishul' | 'mesh' | 'treaty' | 'chakra' | 'script' | 'grid';
}

export const CTAImageCard: FC<CTAImageCardProps> = ({
  title,
  subtitle,
  cta,
  href,
  imageSrc,
  imageAlt,
  accentColor,
  index,
  isInView,
  className,
  glyph,
}) => {
  // Stamp animation hook
  const { isTriggered, triggerStamp, resetStamp } = useStampTrigger();
  const [isHovered, setIsHovered] = useState(false);

  // Handle click to trigger stamp
  const handleClick = () => {
    triggerStamp();
    // Reset after animation
    setTimeout(resetStamp, 1500);
  };

  // Card entrance animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      rotateX: 5,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  // Glow pulse animation when hovered
  const glowVariants = {
    idle: { opacity: 0, scale: 0.95 },
    hover: {
      opacity: 0.5,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={cn('group relative', className)}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <Link
        href={href}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative block aspect-[4/5] overflow-hidden rounded-xl',
          'transition-all duration-500 ease-out',
          'border-2 border-transparent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-900)]',
          // 3D transform on hover
          'group-hover:[transform:rotateX(2deg)_rotateY(-2deg)_translateZ(10px)]',
          // Reduced motion preference
          'motion-reduce:transition-none motion-reduce:group-hover:transform-none'
        )}
        style={{
          // Dynamic border and glow on hover via CSS custom property
          ['--accent-color' as string]: accentColor,
        }}
      >
        {/* Image Layer */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={cn(
              'object-cover',
              'transition-transform duration-700 ease-out',
              'group-hover:scale-110',
              'motion-reduce:group-hover:scale-100'
            )}
            priority={index === 0}
          />
        </div>

        {/* Glyph Watermark - appears on hover */}
        {glyph && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <GlyphWatermark
              glyph={glyph}
              opacity={0.08}
              size="70%"
              position="center"
              color={accentColor}
              animate={isHovered}
              animationType="pulse"
            />
          </motion.div>
        )}

        {/* Gradient Overlay - Intensifies on hover */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-t from-[var(--obsidian-900)] via-[var(--obsidian-900)]/40 to-transparent',
            'transition-all duration-500',
            'group-hover:from-[var(--obsidian-900)] group-hover:via-[var(--obsidian-900)]/70 group-hover:to-[var(--obsidian-900)]/30'
          )}
        />

        {/* Border Glow Effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl',
            'border-2 border-transparent',
            'transition-all duration-500',
            'group-hover:border-[var(--accent-color)]',
            'group-hover:shadow-[0_0_30px_var(--accent-color)]',
            'group-hover:shadow-[var(--accent-color)]/30'
          )}
          style={{
            ['--accent-color' as string]: accentColor,
          }}
        />

        {/* Content Layer */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Title - Always visible */}
          <motion.h3
            className={cn(
              'font-display text-2xl md:text-3xl lg:text-4xl',
              'text-[var(--text-primary)]',
              'tracking-wide uppercase',
              'transition-transform duration-500',
              'group-hover:-translate-y-2'
            )}
          >
            {title}
          </motion.h3>

          {/* Subtitle - Reveals on hover */}
          <div
            className={cn(
              'overflow-hidden',
              'transition-all duration-500 ease-out',
              'max-h-0 opacity-0',
              'group-hover:max-h-20 group-hover:opacity-100',
              'motion-reduce:max-h-20 motion-reduce:opacity-100'
            )}
          >
            <p
              className={cn(
                'text-sm md:text-base text-[var(--text-secondary)]',
                'mt-2 transform translate-y-4',
                'transition-transform duration-500 delay-100',
                'group-hover:translate-y-0'
              )}
            >
              {subtitle}
            </p>
          </div>

          {/* CTA Button - Reveals on hover */}
          <div
            className={cn(
              'overflow-hidden',
              'transition-all duration-500 ease-out delay-75',
              'max-h-0 opacity-0',
              'group-hover:max-h-16 group-hover:opacity-100',
              'motion-reduce:max-h-16 motion-reduce:opacity-100'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 mt-4',
                'transform translate-y-6',
                'transition-transform duration-500 delay-150',
                'group-hover:translate-y-0'
              )}
            >
              <span
                className={cn(
                  'text-sm md:text-base font-semibold',
                  'px-4 py-2 rounded-lg',
                  'bg-[var(--accent-color)]/20',
                  'backdrop-blur-sm',
                  'border border-[var(--accent-color)]/50',
                  'transition-all duration-300',
                  'group-hover:bg-[var(--accent-color)]/30'
                )}
                style={{
                  color: accentColor,
                  ['--accent-color' as string]: accentColor,
                }}
              >
                {cta}
              </span>
              <motion.span
                className="text-[var(--text-primary)]"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-5 h-5" style={{ color: accentColor }} />
              </motion.span>
            </div>
          </div>
        </div>

        {/* Accent Line at Top */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1',
            'transform origin-left scale-x-0',
            'transition-transform duration-500',
            'group-hover:scale-x-100'
          )}
          style={{ backgroundColor: accentColor }}
        />

        {/* Ambient Glow Effect on Hover */}
        <motion.div
          variants={glowVariants}
          initial="idle"
          animate={isHovered ? 'hover' : 'idle'}
          className="absolute inset-0 -z-10 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          aria-hidden="true"
        />

        {/* Stamp Animation on Click */}
        <AnimatePresence>
          {isTriggered && (
            <StandaloneStamp
              type="access"
              color={accentColor}
              size="lg"
              position="center"
              className="z-50"
            />
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};

export default CTAImageCard;
