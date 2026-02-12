'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { GlyphWatermark, TextReveal } from '@/shared/ui';

interface LoreHeroProps {
  className?: string;
}

export const LoreHero: FC<LoreHeroProps> = ({ className }) => {
  const [titleRevealed, setTitleRevealed] = useState(false);

  return (
    <section
      className={cn(
        'relative py-20 md:py-28 lg:py-32 overflow-hidden',
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/60 via-[var(--obsidian-900)] to-[var(--obsidian-900)]" />

      {/* Mesh Glyph Watermark - Surveillance aesthetic */}
      <GlyphWatermark
        glyph="mesh"
        opacity={0.03}
        size="80%"
        position="center"
        color="var(--powder-500)"
        animate={true}
        animationType="pulse"
      />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            var(--powder-500) 2px,
            var(--powder-500) 4px
          )`,
        }}
      />

      {/* Grid pattern overlay - enhanced surveillance grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--powder-500) 1px, transparent 1px),
                           linear-gradient(90deg, var(--powder-500) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow in center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, var(--powder-500) 0%, transparent 50%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow text with stamp effect */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xs md:text-sm text-[var(--powder-400)] uppercase tracking-[0.3em] mb-4"
          >
            <span className="inline-block px-4 py-1 border border-[var(--powder-500)]/30 rounded-sm">
              Directorate Archives
            </span>
          </motion.p>

          {/* Title with TextReveal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-[var(--text-primary)] mb-4">
            <TextReveal
              variant="word"
              delay={0.3}
              stagger={0.1}
              duration={0.6}
              glowColor="var(--powder-500)"
              onComplete={() => setTitleRevealed(true)}
            >
              Intelligence Archive
            </TextReveal>
          </h1>

          {/* Subtitle - fades in after title */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={titleRevealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8"
          >
            Classified and declassified briefings on subjects of strategic interest
          </motion.p>

          {/* Tagline quote */}
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={titleRevealed ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-[var(--text-muted)] font-serif italic max-w-xl mx-auto"
          >
            &ldquo;To understand the present, one must first decode the past.&rdquo;
          </motion.blockquote>
        </motion.div>

        {/* Decorative elements with animation */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={titleRevealed ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-12 flex justify-center items-center gap-4"
        >
          <span className="w-16 h-px bg-gradient-to-r from-transparent to-[var(--powder-500)]/50" />
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-[var(--mustard-500)]"
          />
          <span className="w-16 h-px bg-gradient-to-l from-transparent to-[var(--powder-500)]/50" />
        </motion.div>
      </div>
    </section>
  );
};

export default LoreHero;
