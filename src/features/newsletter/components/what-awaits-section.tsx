'use client';

import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query';
import { GlyphWatermark, ParticleField } from '@/shared/ui';
import { ClassifiedFileCard } from './classified-file-card';
import { DossierCard } from './dossier-card';
import type {
  NovelFeature,
  DossierContent,
  WhatAwaitsYouContent,
  VerifiedStatus,
} from '@/types';

interface WhatAwaitsSectionProps {
  features: NovelFeature[];
  dossierContent: DossierContent;
  sectionContent: WhatAwaitsYouContent;
  verifiedStatus?: VerifiedStatus;
  className?: string;
}

export const WhatAwaitsSection: FC<WhatAwaitsSectionProps> = ({
  features,
  dossierContent,
  sectionContent,
  verifiedStatus,
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [typedText, setTypedText] = useState('');
  const fullText = sectionContent.subline;

  const dossierInitialState = verifiedStatus === 'success' ? 'verified' : 'idle';

  // Typewriter effect for subline
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(fullText);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [fullText, prefersReducedMotion]);

  return (
    <section
      id="awaits"
      className={cn(
        'relative py-16 md:py-24 bg-[var(--obsidian-900)] overflow-hidden',
        className
      )}
    >
      {/* Background Elements */}
      <GlyphWatermark
        glyph="mesh"
        opacity={0.025}
        size="70%"
        position="center"
        color="var(--powder-500)"
      />

      <ParticleField
        count={20}
        color="rgba(241, 194, 50, 0.12)"
        minSize={1}
        maxSize={2}
        speed={0.08}
        driftUp={true}
        style="dust"
        coverage="viewport"
        zIndex={1}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 z-10">
        {/* Section Header - Glass Morphism */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 px-6 py-8 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-[var(--powder-300)] text-center mb-4 tracking-tight">
            {sectionContent.heading}
          </h2>
          <p className="text-center text-[var(--text-secondary)] font-mono text-sm md:text-base max-w-2xl mx-auto">
            {typedText}
            {typedText.length < fullText.length && (
              <motion.span
                animate={prefersReducedMotion ? {} : { opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-[var(--powder-400)] ml-0.5 align-middle"
              />
            )}
          </p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Feature Cards - Left Column (2/5 on desktop) */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {features.map((feature, index) => (
              <ClassifiedFileCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                fileNumber={`FILE-00${index + 1}`}
                index={index}
              />
            ))}
          </div>

          {/* Dossier Card - Right Column (3/5 on desktop) */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <DossierCard
              content={dossierContent}
              initialState={dossierInitialState}
              index={0}
            />
          </div>
        </div>

        {/* Section Footer - Hint */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-[var(--text-muted)] font-mono tracking-wide">
            Hover on files to reveal • Verify email to unlock your dossier
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatAwaitsSection;
