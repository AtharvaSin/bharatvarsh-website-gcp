'use client';

import { FC, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CTAImageCard } from './cta-image-card';
import { TextReveal, GlyphWatermark } from '@/components/ui';

interface CTASectionProps {
  className?: string;
}

const ctaCards = [
  {
    title: 'The Archive',
    subtitle: 'Characters | Factions | Locations',
    cta: 'Access the Lore Index',
    href: '/lore',
    imageSrc: '/images/landing/lore-card.webp',
    imageAlt: 'Bharatvarsh Lore Archive - Intelligence dossiers, character files, and faction documents',
    accentColor: 'var(--powder-500)',
    glyph: 'script' as const,
  },
  {
    title: 'The Timeline',
    subtitle: 'From 1717 to Present Day',
    cta: 'Trace the Divergence',
    href: '/timeline',
    imageSrc: '/images/landing/timeline-card.webp',
    imageAlt: 'Bharatvarsh Timeline - Map of India showing the alternate history from 1717',
    accentColor: 'var(--mustard-500)',
    glyph: 'chakra' as const,
  },
  {
    title: 'The Novel',
    subtitle: 'Price of Harmony. Paid by Freedom.',
    cta: 'Read More',
    href: '/novel',
    imageSrc: '/images/landing/novel-card.webp',
    imageAlt: 'Mahabharatvarsh Novel by Atharva Singh - Pre-order file with classified stamp',
    accentColor: 'var(--event-era)',
    glyph: 'trishul' as const,
  },
];

export const CTASection: FC<CTASectionProps> = ({ className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={cn('w-full max-w-7xl mx-auto px-4 md:px-8 relative', className)}>
      {/* Background Glyph Watermark */}
      <GlyphWatermark
        glyph="mesh"
        opacity={0.015}
        size="100%"
        position="center"
        color="var(--powder-500)"
        animate={true}
        animationType="pulse"
        className="z-0"
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-[var(--powder-300)] tracking-wider uppercase">
          {isInView ? (
            <TextReveal
              variant="word"
              delay={0.1}
              stagger={0.1}
              duration={0.6}
              glowColor="var(--mustard-500)"
            >
              Enter Bharatvarsh
            </TextReveal>
          ) : (
            'Enter Bharatvarsh'
          )}
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[var(--mustard-500)] to-transparent origin-center"
        />
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
        {ctaCards.map((card, index) => (
          <CTAImageCard
            key={card.href}
            title={card.title}
            subtitle={card.subtitle}
            cta={card.cta}
            href={card.href}
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt}
            accentColor={card.accentColor}
            glyph={card.glyph}
            index={index}
            isInView={isInView}
          />
        ))}
      </div>
    </div>
  );
};

export default CTASection;
