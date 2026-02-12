'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StandaloneStamp, useStampTrigger } from '@/components/ui';
import type { LoreItem, LoreCategory, LoreClassification } from '@/types';

interface LoreCardProps {
  item: LoreItem;
  onClick: () => void;
  className?: string;
}

const categoryLabels: Record<LoreCategory, string> = {
  characters: 'Character',
  locations: 'Location',
  factions: 'Faction',
  tech: 'Tech',
};

const classificationLabels: Record<LoreClassification, string> = {
  classified: 'Classified',
  declassified: 'Declassified',
};

// Category-specific accent colors
const categoryColors: Record<LoreCategory, string> = {
  characters: 'var(--powder-500)',
  locations: 'var(--mustard-500)',
  factions: 'var(--event-era)',
  tech: 'var(--event-governance)',
};

export const LoreCard: FC<LoreCardProps> = ({ item, onClick, className }) => {
  const { isTriggered, triggerStamp, resetStamp } = useStampTrigger();
  const [isHovered, setIsHovered] = useState(false);
  const isClassified = item.classification === 'classified';

  const handleClick = () => {
    triggerStamp();
    setTimeout(() => {
      resetStamp();
      onClick();
    }, 400);
  };

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group cursor-pointer relative',
        'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-700)]',
        'border rounded-lg overflow-hidden',
        'transition-all duration-300',
        // Classification-based border styling
        isClassified
          ? 'border-[var(--status-alert)]/30 hover:border-[var(--status-alert)]/60'
          : 'border-[var(--obsidian-600)] hover:border-[var(--powder-500)]',
        // Enhanced shadow on hover
        isHovered && (isClassified
          ? 'shadow-lg shadow-[var(--status-alert)]/15'
          : 'shadow-lg shadow-[var(--powder-500)]/10'),
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-[var(--obsidian-900)]">
        <Image
          src={item.media.card}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-500',
            'group-hover:scale-110',
            // Slight desaturation for classified items
            isClassified && 'saturate-75'
          )}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian-900)] via-[var(--obsidian-900)]/20 to-transparent" />

        {/* RESTRICTED overlay for classified items */}
        {isClassified && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isHovered ? 0.2 : 0.4 }}
            className="absolute inset-0 bg-[var(--status-alert)]/5 pointer-events-none"
          />
        )}

        {/* Category badge - top left */}
        <Badge
          variant={item.category}
          className="absolute top-3 left-3 text-[10px]"
        >
          {categoryLabels[item.category]}
        </Badge>

        {/* Classification badge - top right with enhanced styling */}
        <motion.div
          animate={isClassified ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Badge
            variant={item.classification}
            className={cn(
              'absolute top-3 right-3 text-[10px]',
              isClassified && 'ring-1 ring-[var(--status-alert)]/50'
            )}
          >
            {classificationLabels[item.classification]}
          </Badge>
        </motion.div>

        {/* Hover glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${categoryColors[item.category]} 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* Stamp Animation */}
        <AnimatePresence>
          {isTriggered && (
            <StandaloneStamp
              type={isClassified ? 'classified' : 'access'}
              color={isClassified ? 'var(--status-alert)' : categoryColors[item.category]}
              size="md"
              position="center"
              className="z-50"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5 relative">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {item.name}
          </h3>
          {item.nameDevanagari && (
            <span className="text-sm text-[var(--text-muted)] font-devanagari shrink-0">
              {item.nameDevanagari}
            </span>
          )}
        </div>

        {/* Hide subtype for characters to avoid spoilers */}
        {item.category !== 'characters' && (
          <p className="text-xs text-[var(--mustard-500)] uppercase tracking-wider mb-2">
            {item.subtype}
          </p>
        )}

        <p className="text-[var(--text-secondary)] text-sm line-clamp-2">
          {item.tagline}
        </p>

        {/* Classification indicator line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
            isClassified
              ? 'bg-gradient-to-r from-[var(--status-alert)] to-transparent'
              : 'bg-gradient-to-r from-[var(--powder-500)] to-transparent'
          )}
        />
      </div>

      {/* Border glow animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: isClassified
            ? 'inset 0 0 20px var(--status-alert)10'
            : 'inset 0 0 20px var(--powder-500)10',
        }}
      />
    </motion.article>
  );
};

export default LoreCard;
