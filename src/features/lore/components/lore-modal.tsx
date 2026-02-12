'use client';

import { FC, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';
import type { LoreItem, LoreCategory, LoreClassification } from '@/types';

interface LoreModalProps {
  item: LoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryLabels: Record<LoreCategory, string> = {
  characters: 'Character',
  locations: 'Location',
  factions: 'Faction',
  tech: 'Technology',
};

const classificationLabels: Record<LoreClassification, string> = {
  classified: 'Classified',
  declassified: 'Declassified',
};

export const LoreModal: FC<LoreModalProps> = ({ item, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  // Standard hydration safety pattern - render portal only on client
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration safety pattern
    setMounted(true);
  }, []);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  // Don't render anything on server
  if (!mounted) return null;

  // Use portal to render modal outside of transformed parent
  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[var(--z-modal)] bg-[var(--obsidian-950)]/90 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[var(--z-modal)] flex items-center justify-center pointer-events-none safe-area-all"
          >
            <div
              className={cn(
                'relative w-full max-w-3xl max-h-full overflow-y-auto',
                'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-900)]',
                'border border-[var(--obsidian-600)] rounded-xl',
                'pointer-events-auto shadow-2xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={cn(
                  'absolute top-4 right-4 z-10',
                  'w-11 h-11 rounded-full touch-target', // 44px for touch target
                  'bg-[var(--obsidian-900)]/80 backdrop-blur-sm',
                  'border border-[var(--obsidian-600)]',
                  'flex items-center justify-center',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  'transition-colors duration-200',
                  'hover:bg-[var(--obsidian-800)]',
                  'tap-highlight-none'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Banner image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                <Image
                  src={item.media.banner}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian-900)] via-transparent to-transparent" />

                {/* Badges on banner */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Badge variant={item.category}>
                    {categoryLabels[item.category]}
                  </Badge>
                  <Badge variant={item.classification}>
                    {classificationLabels[item.classification]}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h2 className="text-2xl md:text-3xl font-display text-[var(--text-primary)]">
                      {item.name}
                    </h2>
                    {item.nameDevanagari && (
                      <span className="text-lg md:text-xl text-[var(--text-muted)] font-devanagari">
                        {item.nameDevanagari}
                      </span>
                    )}
                  </div>
                  {/* Hide subtype for characters to avoid spoilers */}
                  {item.category !== 'characters' && (
                    <p className="text-sm text-[var(--mustard-500)] uppercase tracking-wider">
                      {item.subtype}
                    </p>
                  )}
                </div>

                {/* Intelligence Briefing */}
                <div className="mb-6">
                  <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-8 h-px bg-[var(--obsidian-600)]" />
                    Intelligence Briefing
                    <span className="flex-1 h-px bg-[var(--obsidian-600)]" />
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Traits or Specifications */}
                {(item.traits || item.specifications) && (
                  <div>
                    <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-8 h-px bg-[var(--obsidian-600)]" />
                      {item.specifications ? 'Technical Specifications' : 'Key Attributes'}
                      <span className="flex-1 h-px bg-[var(--obsidian-600)]" />
                    </h3>

                    {item.traits && (
                      <div className="flex flex-wrap gap-2">
                        {item.traits.map((trait) => (
                          <span
                            key={trait}
                            className={cn(
                              'px-3 py-1 rounded-full text-sm',
                              'bg-[var(--obsidian-700)] text-[var(--text-secondary)]',
                              'border border-[var(--obsidian-600)]'
                            )}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.specifications && (
                      <p className="text-sm text-[var(--text-muted)] font-mono">
                        {item.specifications}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LoreModal;
