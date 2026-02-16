'use client';

import { FC, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  MapPin,
  Zap,
  Star,
  Calendar,
  Clock,
  BookOpen,
  Coins,
  Building2,
  Users,
  Swords,
  Building,
  Cpu,
} from 'lucide-react';
import { TimelineEvent, ImpactType } from '@/types';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils';
import { useIsPortrait } from '@/shared/hooks/use-media-query';

// Impact type to icon mapping
const IMPACT_ICONS: Record<ImpactType, typeof Coins> = {
  economic: Coins,
  political: Building2,
  social: Users,
  military: Swords,
  infrastructure: Building,
  technological: Cpu,
};

// Base64 blur placeholder for images
const BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAHxAAAgEEAgMAAAAAAAAAAAAAAQIDAAQREgYhEzEi/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADERL/2gAMAwEAAhEDEEA/AN5hOeymOJVt4pJN5QpEQ2m3vB96pSlS04UpKiA57Z//2Q==';

interface TimelineEventModalProps {
  event: TimelineEvent;
  onClose: () => void;
}

/**
 * Full-screen modal for event details
 * Displays complete event information with impacts and locations
 */
export const TimelineEventModal: FC<TimelineEventModalProps> = ({
  event,
  onClose,
}) => {
  // Orientation-aware image selection
  const isPortrait = useIsPortrait();
  const currentImage = isPortrait && event.media.imagePortrait
    ? event.media.imagePortrait
    : event.media.image;

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] safe-area-all">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Scroll Wrapper */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal Content */}
          <motion.div
            className={cn(
              'relative w-full max-w-2xl',
              'my-8', // Add vertical margin for scrolling context
              'overflow-hidden',
              'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-900)]',
              'border border-[var(--obsidian-600)]',
              'rounded-2xl shadow-2xl'
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 z-50', // z-50 to ensure it's above everything
                'w-10 h-10 rounded-full',
                'flex items-center justify-center',
                'bg-black/50 hover:bg-[var(--mustard-500)]', // High contrast background
                'text-white hover:text-[var(--navy-900)]', // High contrast text
                'border border-white/10 hover:border-transparent',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)]',
                'backdrop-blur-md',
                'shadow-lg'
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Container (No internal scroll) */}
            <div className="w-full">
              {/* Hero Image - Orientation-aware */}
              {currentImage && (
                <div className={cn(
                  'relative w-full overflow-hidden',
                  isPortrait ? 'aspect-[3/4]' : 'aspect-[16/9]'
                )}>
                  <Image
                    src={currentImage}
                    alt={`Illustration for ${event.title}`}
                    fill
                    className="object-cover transition-opacity duration-500"
                    sizes="(max-width: 672px) 100vw, 672px"
                    priority={false}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                  />
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian-900)] via-transparent to-transparent opacity-70" />
                </div>
              )}

              {/* Header with color accent */}
              <div
                className="p-6 pb-4"
                style={{
                  borderBottom: `2px solid ${event.media.color}40`,
                }}
              >
                {/* Type Badge and Date */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <Badge variant={event.metadata.event_type}>
                    {event.metadata.event_type}
                  </Badge>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Calendar className="w-4 h-4" />
                    <span className="font-mono text-sm">
                      {event.date.original}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2
                  id="modal-title"
                  className="font-display text-3xl md:text-4xl text-[var(--text-primary)] leading-tight"
                >
                  {event.title}
                </h2>

                {/* Duration for era events */}
                {event.date.is_range && (
                  <div className="flex items-center gap-2 mt-3 text-[var(--text-muted)]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {event.date.end_year - event.date.start_year} years
                    </span>
                  </div>
                )}
              </div>

              {/* Historical Context */}
              <div className="p-6 pt-4">
                <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Historical Context
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-base">
                  {event.description}
                </p>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-[var(--obsidian-700)]" />

              {/* Areas of Impact - with icons */}
              <div className="px-6 py-4">
                <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Areas of Impact
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.metadata.impacts.map((impact) => {
                    const ImpactIcon = IMPACT_ICONS[impact];
                    return (
                      <span
                        key={impact}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                          'bg-[var(--obsidian-700)] text-[var(--text-secondary)]',
                          'capitalize'
                        )}
                      >
                        {ImpactIcon && <ImpactIcon className="w-3.5 h-3.5" />}
                        {impact}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Key Locations */}
              {event.metadata.locations && event.metadata.locations.length > 0 && (
                <div className="px-6 pb-4">
                  <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Key Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.metadata.locations.map((location) => (
                      <span
                        key={location}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm',
                          'bg-[var(--navy-900)] text-[var(--powder-300)]'
                        )}
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Note (if available) */}
              {event.metadata.remarks && (
                <div className="px-6 pb-4">
                  <h3 className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    Historical Note
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] italic border-l-2 border-[var(--mustard-500)]/40 pl-3">
                    {event.metadata.remarks}
                  </p>
                </div>
              )}

              {/* Footer with Significance and Back Button */}
              <div
                className="p-6 mt-2 flex flex-col gap-6"
                style={{
                  backgroundColor: `${event.media.color}10`,
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)] text-sm">
                      Historical Significance:
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < event.metadata.significance
                              ? 'text-[var(--mustard-500)] fill-[var(--mustard-500)]'
                              : 'text-[var(--obsidian-600)]'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Keyboard hint */}
                  <span className="text-xs text-[var(--text-muted)] hidden md:inline-block">
                    Press <kbd className="px-1.5 py-0.5 bg-[var(--obsidian-700)] rounded mx-1">Esc</kbd> to close
                  </span>
                </div>

                {/* Back to Timeline Button */}
                <button
                  onClick={onClose}
                  className={cn(
                    'w-full py-3 rounded-lg',
                    'font-mono text-sm uppercase tracking-wider',
                    'flex items-center justify-center gap-2',
                    'transition-all duration-200',
                    'bg-[var(--obsidian-700)] hover:bg-[var(--obsidian-600)]',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    'border border-[var(--obsidian-600)] hover:border-[var(--mustard-500)]/50'
                  )}
                >
                  <X className="w-4 h-4" />
                  Back to Timeline
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
