'use client';

import { FC, useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Fingerprint, Eye, Shield, AlertTriangle } from 'lucide-react'; // Icons for UI
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';
import type { LoreItem, LoreCategory, LoreClassification } from '@/types';

// ========================================
// Types & Constants
// ========================================

interface LoreModalProps {
  item: LoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryLabels: Record<LoreCategory, string> = {
  characters: 'SUBJECT PROFILE',
  locations: 'SECTOR ANALYSIS',
  factions: 'FACTION INTELLIGENCE',
  tech: 'SCHEMATIC BLUEPRINT',
};

const classificationLabels: Record<LoreClassification, string> = {
  classified: 'EYES ONLY - LEVEL 5',
  declassified: 'PUBLIC ACCESS',
};

// ========================================
// Sub-Components
// ========================================

/**
 * Redacted Text Component
 * Decrypts text on hover with a scramble effect
 */
const RedactedText: FC<{ text: string; redactionText?: string }> = ({
  text,
  redactionText = "████████"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(text);

  // Simple "decryption" effect logic could go here, 
  // but for now we'll do a simple swap for performance/clarity
  // A more complex version would scramble letters over time.
  const isRedactedOriginal = text.includes("[REDACTED]");

  return (
    <span
      className={cn(
        "transition-all duration-300",
        isRedactedOriginal ? "cursor-crosshair" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text.split(/(\[REDACTED.*?\])/g).map((part, i) => {
        if (part.startsWith("[REDACTED")) {
          return (
            <span key={i} className="bg-[var(--obsidian-950)] text-[var(--obsidian-950)] hover:text-[var(--mustard-500)] hover:bg-transparent px-1 rounded transition-colors duration-200 select-none hover:select-text">
              {part.replace(/[\[\]]/g, "")}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

/**
 * Visual Hotspot Component
 * Small interactive points on the image
 */
const ImageHotspot: FC<{ x: number; y: number; label: string; description?: string }> = ({ x, y, label, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="absolute z-20 group"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Pulse Anchor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 -ml-2 -mt-2 rounded-full border border-[var(--mustard-500)] bg-[var(--mustard-500)]/20 animate-pulse flex items-center justify-center hover:bg-[var(--mustard-500)] hover:scale-110 transition-all duration-300"
      >
        <div className="w-1 h-1 bg-[var(--mustard-500)] rounded-full" />
      </button>

      {/* Label Connector Line */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: 40, opacity: 1 }}
        className="absolute top-1/2 left-4 h-px bg-[var(--mustard-500)] origin-left pointer-events-none group-hover:block hidden md:block"
      />

      {/* Label Box */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--obsidian-900)]/90 border border-[var(--mustard-500)]/50 px-2 py-1 text-[10px] tracking-widest text-[var(--mustard-500)] uppercase whitespace-nowrap backdrop-blur-sm hidden group-hover:block"
      >
        {label}
      </motion.div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const LoreModal: FC<LoreModalProps> = ({ item, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      // Play sound cue if we had one
      // if (audioRef.current) audioRef.current.play();
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* 1. Backdrop (The Void) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[var(--z-modal)] bg-[var(--obsidian-950)]/95 backdrop-blur-md"
          >
            {/* Subtle Tech Grid Background */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `radial-gradient(var(--mustard-500) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />
          </motion.div>

          {/* 2. Modal Container (The Terminal) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center pointer-events-none p-4 md:p-8"
          >
            <div
              className={cn(
                'relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden',
                'bg-[var(--obsidian-900)]',
                'border border-[var(--obsidian-700)] shadow-2xl',
                'pointer-events-auto rounded-lg'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* === SCAN LINE ANIMATION (Full Height) === */}
              <motion.div
                initial={{ top: '-10%', opacity: 1 }}
                animate={{ top: '120%', opacity: 0 }}
                transition={{ duration: 2, ease: "linear", repeat: 0 }}
                className="absolute left-0 right-0 h-1 bg-[var(--mustard-500)]/50 z-50 pointer-events-none blur-[2px] shadow-[0_0_20px_var(--mustard-500)]"
              />

              {/* Close Button - Thematic "De-Auth" */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 group flex items-center gap-2 px-4 py-1.5 bg-[var(--obsidian-950)]/80 backdrop-blur border border-[var(--status-alert)]/30 hover:border-[var(--status-alert)] transition-all duration-300 rounded-sm"
                aria-label="Close Dossier"
              >
                <span className="text-[10px] font-mono font-bold text-[var(--status-alert)] tracking-widest group-hover:text-red-400 transition-colors uppercase">
                  DE-AUTH
                </span>
                <X className="w-3 h-3 text-[var(--status-alert)] group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* === TOP SECTION: CINEMATIC VISUAL (Landscape) === */}
              <div className="relative w-full aspect-video md:aspect-[21/9] shrink-0 bg-[var(--obsidian-950)] border-b border-[var(--obsidian-800)] overflow-hidden group">
                {/* Main Landscape Image */}
                <Image
                  src={item.media.banner} // RESTORED: Using specific widescreen artwork
                  alt={item.name}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                  priority
                  sizes="(max-width: 1024px) 100vw, 1200px"
                />

                {/* Signal Noise & Overlays */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('/images/noise.png')] animate-grain" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian-900)] via-transparent to-transparent opacity-90" />

                {/* Hotspots Layer */}
                {item.hotspots?.map(spot => (
                  <ImageHotspot key={spot.id} {...spot} />
                ))}

                {/* Header Overlay (Bottom Left of Image) */}
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="bg-[var(--obsidian-900)]/80 backdrop-blur border-[var(--mustard-500)]/30 text-[10px] tracking-[0.2em] font-mono text-[var(--mustard-500)] uppercase">
                      {categoryLabels[item.category]}
                    </Badge>
                    <div className="flex items-center gap-2 text-[10px] tracking-widest text-green-500 font-mono bg-[var(--obsidian-900)]/80 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      ONLINE
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-white tracking-tight leading-none drop-shadow-lg">
                    {item.name}
                  </h1>
                  {item.nameDevanagari && (
                    <p className="text-xl md:text-2xl font-serif text-[var(--powder-200)] opacity-80 font-devanagari mt-1 drop-shadow-md">
                      {item.nameDevanagari}
                    </p>
                  )}
                </div>
              </div>

              {/* === BOTTOM SECTION: DATA STREAM (Scrollable) === */}
              <div className="flex-1 overflow-y-auto bg-[var(--obsidian-900)] relative scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    width: 4px;
                  }
                  .scrollbar-hide::-webkit-scrollbar-track {
                    background: var(--obsidian-950);
                  }
                  .scrollbar-hide::-webkit-scrollbar-thumb {
                    background: var(--obsidian-700);
                    border-radius: 0;
                  }
                  .scrollbar-hide::-webkit-scrollbar-thumb:hover {
                    background: var(--mustard-500);
                  }
                `}</style>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">

                  {/* Left Column: Stats & Metadata (Col Spans 4) */}
                  <div className="lg:col-span-4 space-y-8 border-r border-[var(--obsidian-800)]/50 pr-0 lg:pr-8">
                    {/* Classification Badge */}
                    <div className="p-4 bg-[var(--obsidian-950)] border border-[var(--obsidian-700)] rounded flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Clearance</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--mustard-500)] uppercase tracking-wider">
                        <Shield className="w-3 h-3" />
                        {classificationLabels[item.classification]}
                      </div>
                    </div>

                    {/* Traits */}
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
                        <Fingerprint className="w-3 h-3" />
                        Identity Metrics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.traits?.map(trait => (
                          <span key={trait} className="px-3 py-1.5 text-xs font-mono bg-[var(--obsidian-800)] border border-[var(--obsidian-700)] text-[var(--text-secondary)] uppercase tracking-wider">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quote Block (Moved to side for variety) */}
                    {(item.quote || item.tagline) && (
                      <div className="relative p-6 bg-[var(--mustard-500)]/5 border-l-2 border-[var(--mustard-500)]">
                        <p className="font-display italic text-[var(--text-primary)] text-lg leading-relaxed">
                          &quot;{item.quote || item.tagline}&quot;
                        </p>
                        {item.quoteAuthor && (
                          <p className="mt-3 text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
                            — {item.quoteAuthor}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Narrative Intelligence (Col Spans 8) */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Main Description */}
                    <div className="prose prose-invert prose-lg max-w-none">
                      <h4 className="flex items-center gap-2 text-[10px] font-mono text-[var(--mustard-500)] uppercase tracking-[0.2em] mb-6">
                        <Eye className="w-3 h-3" />
                        Surveillance Report
                      </h4>
                      <p className="font-serif text-[var(--text-secondary)] leading-relaxed text-lg md:text-xl">
                        <RedactedText text={item.description} />
                      </p>
                    </div>

                    {/* Tech Specs (If available) */}
                    {item.specifications && (
                      <div className="mt-8 bg-[var(--obsidian-950)]/30 p-6 border border-[var(--obsidian-800)] rounded-lg">
                        <h4 className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
                          <Cpu className="w-4 h-4" />
                          Hardware Schematics
                        </h4>
                        <div className="font-mono text-sm text-[var(--text-muted)] leading-loose grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {item.specifications.split('|').map((spec, i) => (
                            <div key={i} className="flex items-center gap-2 border-b border-[var(--obsidian-800)]/50 py-2">
                              <div className="w-1 h-1 bg-[var(--mustard-500)]/50 rounded-full" />
                              <span>{spec.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Data Bar */}
                <div className="h-8 mt-auto bg-[var(--obsidian-950)] border-t border-[var(--obsidian-800)] flex items-center px-8 justify-between text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                  <span>SECURE CONNECTION ESTABLISHED</span>
                  <span>DATALINK: {item.id.substring(0, 6).toUpperCase()}-{item.category.substring(0, 3).toUpperCase()} // NODE: INDRAPUR-01</span>
                </div>
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
