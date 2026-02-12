'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Search, FileText, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

const iconMap: Record<string, FC<{ className?: string }>> = {
  globe: Globe,
  users: Users,
  search: Search,
  'file-text': FileText,
};

interface ClassifiedFileCardProps {
  icon: string;
  title: string;
  description: string;
  fileNumber: string;
  index: number;
  className?: string;
}

export const ClassifiedFileCard: FC<ClassifiedFileCardProps> = ({
  icon,
  title,
  description,
  fileNumber,
  index,
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedDesc, setDisplayedDesc] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  const Icon = iconMap[icon] || FileText;

  // Typewriter effect for title
  useEffect(() => {
    if (isRevealed && !prefersReducedMotion) {
      setShowCursor(true);
      let titleIndex = 0;
      const titleInterval = setInterval(() => {
        if (titleIndex <= title.length) {
          setDisplayedTitle(title.slice(0, titleIndex));
          titleIndex++;
        } else {
          clearInterval(titleInterval);
          // Start description after title completes
          let descIndex = 0;
          const descInterval = setInterval(() => {
            if (descIndex <= description.length) {
              setDisplayedDesc(description.slice(0, descIndex));
              descIndex++;
            } else {
              clearInterval(descInterval);
              setShowCursor(false);
            }
          }, 8);
        }
      }, 30);

      return () => clearInterval(titleInterval);
    } else if (isRevealed && prefersReducedMotion) {
      setDisplayedTitle(title);
      setDisplayedDesc(description);
    }
  }, [isRevealed, title, description, prefersReducedMotion]);

  // Reset when hover ends
  useEffect(() => {
    if (!isHovered) {
      const timeout = setTimeout(() => {
        setIsRevealed(false);
        setDisplayedTitle('');
        setDisplayedDesc('');
        setShowCursor(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isHovered]);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
    setTimeout(() => setIsRevealed(true), 200);
  };

  const cardAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5, delay: index * 0.1 },
      };

  return (
    <motion.div
      {...cardAnimationProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative group cursor-pointer',
        'min-h-[200px]',
        className
      )}
    >
      {/* Card Container - Simplified styling */}
      <div
        className={cn(
          'relative h-full rounded-xl overflow-hidden',
          'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-700)]',
          'border border-[var(--obsidian-600)]',
          'transition-all duration-300',
          isHovered && 'border-[var(--powder-500)]/40 shadow-lg shadow-[var(--powder-500)]/10'
        )}
      >
        {/* File Header - Simplified */}
        <div className="p-4 border-b border-[var(--obsidian-600)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--powder-400)] tracking-wider">
              {fileNumber}
            </span>
            <div className="flex items-center gap-2">
              {isRevealed ? (
                <Unlock className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-[var(--text-muted)]" />
              )}
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  isRevealed ? 'bg-green-500' : 'bg-red-500/70'
                )}
              />
            </div>
          </div>
          <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {isRevealed ? 'REVEALED' : 'SEALED'}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative p-5">
          {/* Sealed State */}
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="sealed"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Redacted Icon */}
                <div className="w-10 h-10 rounded-lg bg-[var(--obsidian-600)] flex items-center justify-center">
                  <div className="w-6 h-6 bg-[var(--obsidian-500)] rounded animate-pulse" />
                </div>

                {/* Redacted Lines */}
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-[var(--obsidian-600)] rounded" />
                  <div className="h-3 w-full bg-[var(--obsidian-600)]/60 rounded" />
                  <div className="h-3 w-5/6 bg-[var(--obsidian-600)]/60 rounded" />
                </div>

                {/* Hover Prompt */}
                <motion.p
                  animate={prefersReducedMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-mono text-[10px] text-[var(--powder-400)] tracking-wider text-center pt-2"
                >
                  Hover to reveal
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Icon */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 rounded-lg bg-[var(--powder-500)]/10 border border-[var(--powder-500)]/30 flex items-center justify-center"
                >
                  <Icon className="w-5 h-5 text-[var(--powder-400)]" />
                </motion.div>

                {/* Title with Typewriter */}
                <h3 className="font-display text-base text-[var(--powder-300)] min-h-[24px]">
                  {displayedTitle}
                  {showCursor && displayedTitle.length < title.length && (
                    <span className="inline-block w-[2px] h-4 bg-[var(--powder-400)] ml-0.5 animate-pulse" />
                  )}
                </h3>

                {/* Description with Typewriter */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed min-h-[60px]">
                  {displayedDesc}
                  {showCursor &&
                    displayedTitle.length >= title.length &&
                    displayedDesc.length < description.length && (
                      <span className="inline-block w-[2px] h-3 bg-[var(--powder-400)] ml-0.5 animate-pulse" />
                    )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassifiedFileCard;
