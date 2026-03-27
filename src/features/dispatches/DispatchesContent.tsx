'use client';

import { FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { GlyphWatermark } from '@/shared/ui';
import { DispatchCard } from './DispatchCard';
import dispatchData from '@/content/data/dispatches.json';

type AngleFilter = 'all' | 'bharatsena' | 'akakpen' | 'tribhuj';
type ChannelFilter = 'all' | 'declassified_report' | 'graffiti_photo' | 'news_article';

const angleOptions: { value: AngleFilter; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'bharatsena', label: 'Bharatsena' },
  { value: 'akakpen', label: 'Akakpen' },
  { value: 'tribhuj', label: 'Tribhuj' },
];

const channelOptions: { value: ChannelFilter; label: string }[] = [
  { value: 'all', label: 'All Formats' },
  { value: 'declassified_report', label: 'Reports' },
  { value: 'graffiti_photo', label: 'Photography' },
  { value: 'news_article', label: 'Broadcasts' },
];

export const DispatchesContent: FC = () => {
  const [angleFilter, setAngleFilter] = useState<AngleFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');

  const filtered = useMemo(() => {
    return dispatchData.dispatches.filter((d) => {
      if (angleFilter !== 'all' && d.storyAngle !== angleFilter) return false;
      if (channelFilter !== 'all' && d.contentChannel !== channelFilter) return false;
      return true;
    });
  }, [angleFilter, channelFilter]);

  return (
    <div className="min-h-screen bg-[var(--obsidian-900)]">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)] via-[var(--obsidian-900)] to-[var(--obsidian-900)]" />

        <GlyphWatermark
          glyph="mesh"
          opacity={0.02}
          size="80%"
          position="center"
          color="var(--powder-500)"
          animate={true}
          animationType="pulse"
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs tracking-[6px] uppercase text-[var(--mustard-500)] mb-4">
              Intercepted Transmissions
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--powder-300)] tracking-tight mb-4">
              {dispatchData.meta.title}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-serif italic">
              {dispatchData.meta.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Feed */}
      <section className="py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-6 border-b border-[var(--obsidian-700)]">
            {/* Angle filter */}
            <div className="flex flex-wrap gap-2">
              {angleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAngleFilter(opt.value)}
                  className={cn(
                    'text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded transition-all duration-200',
                    angleFilter === opt.value
                      ? 'bg-[var(--mustard-500)] text-[var(--navy-900)]'
                      : 'text-[var(--text-muted)] bg-[var(--obsidian-800)] hover:text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Channel filter */}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {channelOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChannelFilter(opt.value)}
                  className={cn(
                    'text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded transition-all duration-200',
                    channelFilter === opt.value
                      ? 'bg-[var(--powder-300)] text-[var(--navy-900)]'
                      : 'text-[var(--text-muted)] bg-[var(--obsidian-800)] hover:text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch count */}
          <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider mb-6">
            {filtered.length} DISPATCH{filtered.length !== 1 ? 'ES' : ''} FOUND
          </p>

          {/* Card grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((dispatch, index) => (
                <DispatchCard key={dispatch.id} dispatch={dispatch} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-mono text-sm text-[var(--text-muted)] tracking-wider">
                NO MATCHING DISPATCHES IN CURRENT CLASSIFICATION
              </p>
              <button
                onClick={() => { setAngleFilter('all'); setChannelFilter('all'); }}
                className="mt-4 text-xs text-[var(--mustard-400)] hover:text-[var(--mustard-300)] transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
