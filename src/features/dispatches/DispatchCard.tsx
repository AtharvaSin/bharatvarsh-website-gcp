'use client';

import { FC } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';
import { Dispatch, DispatchPlatform } from '@/features/dispatches/types';

interface DispatchCardProps {
  dispatch: Dispatch;
  index: number;
  className?: string;
}

const angleLabels: Record<string, string> = {
  bharatsena: 'Bharatsena',
  akakpen: 'Akakpen',
  tribhuj: 'Tribhuj',
};

const channelLabels: Record<string, string> = {
  declassified_report: 'Declassified Report',
  graffiti_photo: 'Field Photography',
  news_article: 'News Broadcast',
};

const angleBadgeVariant: Record<string, string> = {
  bharatsena: 'navy-900',
  akakpen: 'success',
  tribhuj: 'alert',
};

const platformIcons: Record<string, FC<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

export const DispatchCard: FC<DispatchCardProps> = ({ dispatch, index }) => {
  const formattedDate = new Date(dispatch.scheduledDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        'group rounded-lg overflow-hidden',
        'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-700)]',
        'border border-[var(--obsidian-600)] hover:border-[var(--powder-500)]/30',
        'transition-all duration-300 hover:-translate-y-0.5'
      )}
    >
      {/* Image or classified placeholder */}
      <div className="relative aspect-[16/9] bg-[var(--obsidian-950)] overflow-hidden">
        {dispatch.image ? (
          <Image
            src={dispatch.image}
            alt={dispatch.topic}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[var(--obsidian-500)] font-mono text-xs tracking-[4px] uppercase mb-2">
              Awaiting Clearance
            </div>
            <div className="w-12 h-px bg-[var(--obsidian-600)]" />
          </div>
        )}

        {/* Status indicator */}
        {dispatch.status === 'rendered' && (
          <div className="absolute top-3 right-3">
            <Badge variant="mustard" className="text-[10px]">
              Declassified
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Taxonomy badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={cn(
            'text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded',
            dispatch.storyAngle === 'bharatsena' && 'text-[var(--powder-300)] bg-[var(--navy-900)]/60',
            dispatch.storyAngle === 'akakpen' && 'text-[#10B981] bg-[#10B981]/10',
            dispatch.storyAngle === 'tribhuj' && 'text-[#DC2626] bg-[#DC2626]/10',
          )}>
            {angleLabels[dispatch.storyAngle] || dispatch.storyAngle}
          </span>
          <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded text-[var(--text-muted)] bg-[var(--obsidian-600)]/50">
            {channelLabels[dispatch.contentChannel] || dispatch.contentChannel}
          </span>
        </div>

        {/* Topic */}
        <h3 className="font-semibold text-[var(--text-primary)] mb-2 leading-snug">
          {dispatch.topic}
        </h3>

        {/* Hook */}
        <p className="text-sm font-serif italic text-[var(--powder-400)] mb-3 leading-relaxed">
          {dispatch.hook}
        </p>

        {/* Caption preview */}
        <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-4">
          {dispatch.caption}
        </p>

        {/* Footer: date + platforms */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--obsidian-600)]">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {formattedDate}
          </span>
          <div className="flex items-center gap-2">
            {(['instagram', 'twitter', 'facebook'] as DispatchPlatform[]).map((platform) => {
              const url = dispatch.publishedUrls?.[platform];
              if (!url) return null;
              const Icon = platformIcons[platform];
              if (!Icon) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View this dispatch on ${platform}`}
                  className="text-[var(--text-muted)] opacity-60 hover:opacity-100 hover:text-[var(--mustard-dossier)] transition-opacity"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
