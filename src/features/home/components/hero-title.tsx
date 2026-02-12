'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils';
import { TextReveal, GlyphWatermark } from '@/shared/ui';

interface HeroTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  /** Use dramatic character-by-character reveal. Default: true */
  dramaticReveal?: boolean;
}

export const HeroTitle: FC<HeroTitleProps> = ({
  title,
  subtitle,
  className,
  dramaticReveal = true,
}) => {
  const [titleRevealed, setTitleRevealed] = useState(false);

  return (
    <div className={cn('text-center relative', className)}>
      {/* Background glyph watermark */}
      <GlyphWatermark
        glyph="trishul"
        opacity={0.02}
        size="120%"
        position="center"
        color="var(--powder-500)"
        animate={true}
        animationType="pulse"
        className="z-0"
      />

      {/* Glass morphism backdrop for hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 inline-block px-12 py-10 md:px-16 md:py-12 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5"
      >
        {/* Title with dramatic reveal */}
        {dramaticReveal ? (
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[var(--powder-300)] tracking-tight">
            <TextReveal
              variant="character"
              delay={0.3}
              stagger={0.04}
              duration={0.08}
              glowColor="var(--mustard-500)"
              onComplete={() => setTitleRevealed(true)}
            >
              {title}
            </TextReveal>
          </h1>
        ) : (
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[var(--powder-300)] tracking-tight"
            onAnimationComplete={() => setTitleRevealed(true)}
          >
            {title}
          </motion.h1>
        )}

        {/* Subtitle with fade-in after title reveals */}
        <AnimatePresence>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={
                titleRevealed
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 20, filter: 'blur(4px)' }
              }
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-6 text-lg md:text-xl lg:text-2xl text-[var(--text-secondary)] font-serif italic"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Ambient glow effect behind title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: titleRevealed ? 0.3 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, var(--mustard-500) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Scroll indicator - outside backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: titleRevealed ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-[var(--powder-500)] rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-3 bg-[var(--powder-500)] rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroTitle;
