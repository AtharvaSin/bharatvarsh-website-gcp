'use client';

import { FC, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { TextReveal, GlyphWatermark } from '@/components/ui';

export interface ContentSectionProps {
  headline: string;
  content: string;
  subtext?: string;
  accentColor?: string;
  /** Glyph watermark behind content */
  glyph?: 'trishul' | 'mesh' | 'treaty' | 'chakra' | 'script' | 'grid';
  /** Use dramatic word-by-word reveal for content */
  dramaticReveal?: boolean;
}

/**
 * ContentSection - Scrollytelling content block with animations
 *
 * Features:
 * - 3D perspective transforms based on scroll
 * - Glass morphism backdrop
 * - Optional glyph watermark background
 * - Word-by-word text reveal for dramatic sections
 */
export const ContentSection: FC<ContentSectionProps> = ({
  headline,
  content,
  subtext,
  accentColor,
  glyph,
  dramaticReveal = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  // Parallax text effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  // 3D perspective transform based on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [3, 0, -3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateX: 5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
  };

  // Content paragraph variants - with extra delay for dramaticReveal to wait for headline animation
  const contentVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        // Add delay for dramaticReveal sections to wait for headline word-by-word animation
        delay: dramaticReveal ? 1.2 : 0,
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.4,
      transition: { delay: 0.8, duration: 1.2 },
    },
  };

  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 text-center perspective-1000"
    >
      <motion.div
        style={{ y: textY, rotateX, scale }}
        className="transform-gpu"
      >
        {/* Glass morphism backdrop with enhanced effects */}
        <motion.div
          className="relative px-8 py-12 md:px-12 md:py-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Background glyph watermark */}
          {glyph && (
            <GlyphWatermark
              glyph={glyph}
              opacity={0.03}
              size="80%"
              position="center"
              color={accentColor || 'var(--powder-500)'}
              animate={true}
              animationType="pulse"
              className="z-0"
            />
          )}

          {/* Headline with TextReveal or standard animation */}
          <motion.h2
            variants={itemVariants}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-8 relative z-10"
            style={{ color: accentColor || 'var(--powder-300)' }}
          >
            {dramaticReveal ? (
              <TextReveal
                variant="word"
                delay={0.2}
                stagger={0.08}
                duration={0.6}
                glowColor={accentColor || 'var(--mustard-500)'}
              >
                {headline}
              </TextReveal>
            ) : (
              headline
            )}
          </motion.h2>

          {/* Content paragraph with timed delay for dramatic reveals */}
          <motion.p
            variants={contentVariants}
            className="text-base md:text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto relative z-10"
          >
            {content}
          </motion.p>

          {/* Subtext with serif italic styling */}
          {subtext && (
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg md:text-xl font-serif italic text-[var(--powder-400)] relative z-10"
            >
              {subtext}
            </motion.p>
          )}

          {/* Ambient glow effect */}
          <motion.div
            variants={glowVariants}
            className="absolute inset-0 -z-10 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${accentColor || 'var(--powder-500)'} 0%, transparent 70%)`,
              filter: 'blur(50px)',
            }}
            aria-hidden="true"
          />

          {/* Border glow animation on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              boxShadow: `0 0 30px 5px ${accentColor || 'var(--powder-500)'}20`,
            }}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContentSection;
