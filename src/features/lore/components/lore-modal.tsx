'use client';

import { FC, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EyebrowLabel, DocumentStamp } from '@/shared/ui';
import { cn } from '@/shared/utils';
import type { LoreItem } from '@/types';

// ========================================
// Types & Helpers
// ========================================

interface QuickIntelCell {
  label: string;
  value: string;
}

/**
 * Returns 6 Quick Intel data cells based on lore category.
 * Falls back to em-dash for unknown data — structure matters more than content.
 */
function getQuickIntelCells(item: LoreItem): QuickIntelCell[] {
  const dash = '—';
  switch (item.category) {
    case 'characters':
      return [
        { label: 'BIRTHPLACE', value: item.traits?.[0] ?? 'INDRAPUR' },
        { label: 'ENLISTED', value: '2022' },
        { label: 'COMMISSION', value: '2024' },
        { label: 'UNIT', value: '7TH BHARATSENA' },
        { label: 'KNOWN ALIASES', value: item.subtype?.toUpperCase() ?? dash },
        { label: 'STATUS', value: item.classification === 'classified' ? 'RESTRICTED' : 'ACTIVE' },
      ];
    case 'factions':
      return [
        { label: 'FOUNDED', value: dash },
        { label: 'MEMBERS', value: dash },
        { label: 'TERRITORIES', value: item.traits?.[0] ?? dash },
        { label: 'STATUS', value: item.subtype?.toUpperCase() ?? dash },
        { label: 'LEADER', value: dash },
        { label: 'ALLEGIANCE', value: item.classification === 'classified' ? 'RESTRICTED' : 'PUBLIC' },
      ];
    case 'locations':
      return [
        { label: 'COORDINATES', value: dash },
        { label: 'ESTABLISHED', value: dash },
        { label: 'POPULATION', value: dash },
        { label: 'JURISDICTION', value: item.subtype?.toUpperCase() ?? dash },
        { label: 'CLEARANCE', value: item.classification?.toUpperCase() ?? dash },
        { label: 'STATUS', value: 'ACTIVE' },
      ];
    case 'tech':
      return [
        { label: 'CLASS', value: item.subtype?.toUpperCase() ?? dash },
        { label: 'ACTIVE SINCE', value: dash },
        { label: 'MANUFACTURER', value: 'BHARATSENA R&D' },
        { label: 'CLEARANCE', value: item.classification?.toUpperCase() ?? dash },
        { label: 'OPERATOR', value: dash },
        { label: 'STATUS', value: 'DEPLOYED' },
      ];
    default:
      return Array(6).fill({ label: dash, value: dash }) as QuickIntelCell[];
  }
}

/**
 * Returns the large display headline for the Profile section.
 */
function getProfileHeadline(item: LoreItem): string {
  if (item.category === 'characters') {
    return item.tagline?.toUpperCase() ?? `THE ${item.subtype?.toUpperCase() ?? 'OPERATIVE'}.`;
  }
  return item.tagline?.toUpperCase() ?? 'FILE OVERVIEW.';
}

// ========================================
// Sub-Components
// ========================================

/**
 * Redacted Text Component — renders text with [REDACTED] segments as
 * obsidian-redacted bars that reveal their hidden content on hover.
 * Preserved from original lore-modal.
 */
const RedactedText: FC<{ text: string; redactionText?: string }> = ({
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redactionText = '████████',
}) => {
  return (
    <span className="transition-all duration-300">
      {text.split(/(\[REDACTED.*?\])/g).map((part, i) => {
        if (part.startsWith('[REDACTED')) {
          return (
            <span
              key={i}
              className="bg-[var(--obsidian-void)] text-[var(--obsidian-void)] hover:text-[var(--mustard-hot)] hover:bg-transparent px-1 rounded transition-colors duration-200 select-none hover:select-text cursor-crosshair"
            >
              {part.replace(/[\[\]]/g, '')}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

/**
 * Visual Hotspot Component — interactive anchor points positioned on the
 * banner image at exact x/y percentages. Preserved from original lore-modal.
 */
const ImageHotspot: FC<{ x: number; y: number; label: string; description?: string }> = ({
  x,
  y,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute z-20 group" style={{ left: `${x}%`, top: `${y}%` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 -ml-2 -mt-2 rounded-full border border-[var(--mustard-dossier)] bg-[var(--mustard-dossier)]/20 animate-pulse flex items-center justify-center hover:bg-[var(--mustard-dossier)] hover:scale-110 transition-all duration-300"
        aria-label={label}
      >
        <div className="w-1 h-1 bg-[var(--mustard-dossier)] rounded-full" />
      </button>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: 40, opacity: 1 }}
        className="absolute top-1/2 left-4 h-px bg-[var(--mustard-dossier)] origin-left pointer-events-none group-hover:block hidden md:block"
      />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
        className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--obsidian-deep)]/90 border border-[var(--mustard-dossier)]/50 px-2 py-1 text-[10px] tracking-widest text-[var(--mustard-dossier)] uppercase whitespace-nowrap backdrop-blur-sm pointer-events-none"
      >
        {label}
      </motion.div>
    </div>
  );
};

// ========================================
// Section: Arc Timeline (characters only)
// ========================================

interface TimelineBeat {
  chapter: string;
  title: string;
  summary: string;
  spoiler?: boolean;
  seen?: boolean;
}

const KAHAAN_BEATS: TimelineBeat[] = [
  { chapter: 'CH. 1',  title: 'THE INHERITANCE',      summary: "A dying commander's final message.", seen: true },
  { chapter: 'CH. 4',  title: 'THE FIRST LEAK',        summary: "The signal that shouldn't exist.", seen: true },
  { chapter: 'CH. 9',  title: 'THE BORDER CROSSING',   summary: 'Into the red zone, alone.', seen: true },
  { chapter: 'CH. 14', title: 'THE MIRROR ROOM',        summary: "A face Kahaan can't forget.", spoiler: true },
  { chapter: 'CH. 19', title: 'THE REVELATION',         summary: 'The file that rewrites everything.', spoiler: true },
  { chapter: 'CH. 22', title: 'THE UNSEALING',          summary: 'The chronicle begins.', spoiler: true },
];

const GENERIC_BEATS: TimelineBeat[] = [
  { chapter: 'ACT I',   title: 'INTRODUCTION',   summary: 'First appearance in the chronicle.', seen: true },
  { chapter: 'ACT II',  title: 'COMPLICATION',   summary: 'Role expands under pressure.', seen: true },
  { chapter: 'ACT III', title: 'CONFRONTATION',  summary: 'The central conflict crystallises.', spoiler: true },
  { chapter: 'ACT IV',  title: 'REVELATION',     summary: 'Hidden truths surface.', spoiler: true },
  { chapter: 'ACT V',   title: 'CONSEQUENCE',    summary: 'The cost becomes clear.', spoiler: true },
  { chapter: 'ACT VI',  title: 'RESOLUTION',     summary: 'Where the chronicle leaves them.', spoiler: true },
];

// ========================================
// Props Interface (preserved from original)
// ========================================

interface LoreModalProps {
  item: LoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// ========================================
// Relationship node data (Kahaan-specific + fallback)
// ========================================

interface RelationshipNode {
  name: string;
  role: string;
  color?: string; // 'ally' | 'rival' | 'neutral'
  posX: string; // CSS left %
  posY: string; // CSS top %
}

function getRelationshipNodes(item: LoreItem): RelationshipNode[] {
  if (item.name === 'Kahaan') {
    return [
      { name: 'Rudra',  role: 'ALLY · MENTOR',       color: 'ally',    posX: '18%', posY: '12%' },
      { name: 'Arshi',  role: 'ROMANTIC INTEREST',    color: 'neutral', posX: '72%', posY: '10%' },
      { name: 'Hana',   role: 'SUBORDINATE',          color: 'ally',    posX: '82%', posY: '50%' },
      { name: 'Pratap', role: 'RIVAL',                color: 'rival',   posX: '62%', posY: '80%' },
      { name: 'Bhoomi', role: 'AI HANDLER',           color: 'neutral', posX: '20%', posY: '75%' },
    ];
  }
  return [];
}

// ========================================
// Main Component
// ========================================

export const LoreModal: FC<LoreModalProps> = ({ item, isOpen, onClose }) => {
  // Hydration safety: default to true when window is already available
  // (client-side navigation), false on SSR. No effect needed.
  const [mounted] = useState(() => typeof window !== 'undefined');

  // Escape key handler (preserved)
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Body scroll lock + ESC listener (preserved)
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ backgroundColor: 'var(--obsidian-void)' }}
          onClick={onClose}
        >
          {/* 1px Mustard Dossier inset border — decorative, pointer-events-none */}
          <div
            className="absolute inset-3 border pointer-events-none z-10"
            style={{ borderColor: 'var(--mustard-dossier)' }}
          />

          {/* Top-left RETURN TO ARCHIVE affordance */}
          <button
            className="absolute top-6 left-6 z-20 border px-4 py-2 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200"
            style={{ borderColor: 'var(--powder-signal)', color: 'var(--bone-text)' }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Return to Archive"
          >
            ← RETURN TO ARCHIVE
          </button>

          {/* Top-right CLOSE FILE affordance */}
          <div
            className="absolute top-6 right-6 z-20 flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: 'var(--obsidian-panel)' }}
              onClick={onClose}
              aria-label="Close dossier"
            >
              <span className="font-mono text-lg leading-none" style={{ color: 'var(--mustard-dossier)' }}>✕</span>
            </button>
            <span
              className="font-mono uppercase text-[9px] tracking-[0.14em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              CLOSE FILE · ESC
            </span>
          </div>

          {/* Inner scrollable content — stopPropagation so clicking inside doesn't close */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ============================================================
                SECTION 1 — DOSSIER COVER (asymmetric 5/7 split)
            ============================================================ */}
            <section
              className="relative min-h-[720px] pt-24"
              style={{ backgroundColor: 'var(--obsidian-void)' }}
            >
              {/* Giant ghost Devanagari watermark */}
              {item.nameDevanagari && (
                <div
                  className="absolute top-0 left-0 font-display select-none pointer-events-none z-0 overflow-hidden leading-none"
                  style={{
                    fontSize: 'clamp(12rem, 25vw, 22rem)',
                    color: 'var(--bone-text)',
                    opacity: 0.05,
                    fontFamily: 'var(--font-devanagari)',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {item.nameDevanagari}
                </div>
              )}

              <div className="relative z-10 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center py-12">

                {/* LEFT: content column (col-span-5) */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Classified stamp sticker */}
                  <div className="mb-2">
                    <DocumentStamp
                      docId={`CASE FILE #${String(item.sortOrder).padStart(4, '0')}`}
                      revision="DECLASSIFIED 2032.03.11"
                      clearance="CLEARANCE LEVEL 4"
                      rotate={-4}
                    />
                  </div>

                  {/* Meta eyebrow */}
                  <EyebrowLabel
                    segments={[
                      `CASE FILE #${String(item.sortOrder).padStart(4, '0')}`,
                      'DECLASSIFIED 2032.03.11',
                      'CLEARANCE LEVEL 4',
                    ]}
                  />

                  {/* Massive display name */}
                  <h1
                    className="font-display uppercase leading-none"
                    style={{
                      fontSize: 'clamp(4rem, 10vw, 9rem)',
                      lineHeight: 0.87,
                      color: 'var(--bone-text)',
                    }}
                  >
                    {item.name.toUpperCase()}
                  </h1>

                  {/* Devanagari subscript */}
                  {item.nameDevanagari && (
                    <p
                      className="leading-tight"
                      style={{
                        fontFamily: 'var(--font-devanagari)',
                        fontSize: '3rem',
                        color: 'var(--powder-signal)',
                        lineHeight: 1.1,
                      }}
                    >
                      {item.nameDevanagari}
                    </p>
                  )}

                  {/* Subtype / category / classification row */}
                  <EyebrowLabel
                    segments={[
                      item.subtype?.toUpperCase() ?? '',
                      item.category?.toUpperCase() ?? '',
                      item.classification?.toUpperCase() ?? '',
                    ].filter(Boolean) as string[]}
                  />

                  {/* Pullquote */}
                  {item.quote && (
                    <div className="mt-4">
                      <p
                        className="font-serif italic text-2xl leading-relaxed max-w-[50ch]"
                        style={{ color: 'var(--powder-signal)' }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div
                        className="font-mono uppercase text-[11px] tracking-[0.18em] mt-2"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        — {item.quoteAuthor ?? 'CLASSIFIED SOURCE'}
                      </div>
                    </div>
                  )}

                  {/* CTA row */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {item.category === 'characters' && (
                      <Link
                        href="/novel"
                        className="px-6 py-3 font-mono uppercase text-[11px] tracking-[0.18em] transition-colors duration-200 inline-flex items-center gap-2"
                        style={{ backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }}
                      >
                        READ THEIR CHAPTER →
                      </Link>
                    )}
                    <button
                      className="px-6 py-3 border font-mono uppercase text-[11px] tracking-[0.18em] transition-colors duration-200 inline-flex items-center gap-2 hover:opacity-80"
                      style={{ borderColor: 'var(--powder-signal)', color: 'var(--bone-text)' }}
                      onClick={onClose}
                    >
                      ← BACK TO ARCHIVE
                    </button>
                  </div>
                </div>

                {/* RIGHT: image column (col-span-7) */}
                <div className="col-span-12 lg:col-span-7 relative min-h-[500px] lg:min-h-[700px]">
                  {/* Mustard glow spot */}
                  <div
                    className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0"
                    style={{ backgroundColor: 'rgba(241, 194, 50, 0.12)' }}
                    aria-hidden="true"
                  />

                  {/* Banner image */}
                  <div className="relative w-full h-[500px] lg:h-[700px] overflow-hidden">
                    <Image
                      src={item.media.banner}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />

                    {/* Left-edge gradient fade */}
                    <div
                      className="absolute inset-y-0 left-0 w-1/3 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to right, var(--obsidian-void), transparent)' }}
                      aria-hidden="true"
                    />

                    {/* Hotspots overlay (preserved) */}
                    {item.hotspots?.map((spot) => (
                      <ImageHotspot key={spot.id} {...spot} />
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* ============================================================
                SECTION 2 — QUICK INTEL STRIP (6-cell metadata ribbon)
            ============================================================ */}
            <section
              className="py-8 border-y"
              style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
                {getQuickIntelCells(item).map((cell, i, arr) => (
                  <div
                    key={i}
                    className={cn(
                      'px-6 py-4',
                      i < arr.length - 1 ? 'border-r' : ''
                    )}
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <div
                      className="font-mono uppercase text-[10px] tracking-[0.18em] mb-2"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      {cell.label}
                    </div>
                    <div
                      className="font-display text-lg uppercase"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      {cell.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ============================================================
                SECTION 3 — BIOGRAPHY / PROFILE (sticky sidebar + long content)
            ============================================================ */}
            <section
              className="py-24 relative"
              style={{ backgroundColor: 'var(--obsidian-void)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8">

                {/* LEFT: mini table of contents (sticky) */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start">
                  <EyebrowLabel segments={['DOSSIER SECTIONS']} className="mb-6" />
                  <nav className="flex flex-col gap-0">
                    {[
                      { num: '01', label: 'PROFILE', show: true },
                      { num: '02', label: 'TRAITS', show: (item.traits?.length ?? 0) > 0 },
                      { num: '03', label: 'RELATIONSHIPS', show: item.category === 'characters' },
                      { num: '04', label: 'ARC TIMELINE', show: item.category === 'characters' },
                      { num: '05', label: 'GALLERY', show: true },
                      { num: '06', label: 'IN THEIR OWN WORDS', show: true },
                    ]
                      .filter((s) => s.show)
                      .map((s, i) => (
                        <div
                          key={s.num}
                          className={cn(
                            'flex items-center gap-4 py-3 border-l-2 pl-4 font-mono uppercase text-[11px] tracking-[0.18em]',
                            i === 0
                              ? 'border-l-[var(--mustard-dossier)]'
                              : 'border-l-transparent'
                          )}
                          style={{
                            color: i === 0 ? 'var(--bone-text)' : 'var(--shadow-text)',
                            borderLeftColor: i === 0 ? 'var(--mustard-dossier)' : 'transparent',
                          }}
                        >
                          <span style={{ color: 'var(--mustard-dossier)' }}>{s.num}</span>
                          <span>{s.label}</span>
                        </div>
                      ))}
                  </nav>
                </div>

                {/* RIGHT: long content column */}
                <div className="col-span-12 lg:col-span-8 max-w-[65ch]">
                  <EyebrowLabel segments={['01', 'PROFILE']} className="mb-4" />
                  <h3
                    className="font-display text-5xl mt-2 mb-8 uppercase"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {getProfileHeadline(item)}
                  </h3>

                  <div
                    className="font-sans text-lg leading-relaxed space-y-4"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    <RedactedText text={item.description} />
                  </div>

                  {/* Mid-paragraph pullquote (if not already shown in cover) */}
                  {item.quote && !item.nameDevanagari && (
                    <blockquote
                      className="font-serif italic text-2xl my-10 pl-6 border-l-2"
                      style={{
                        color: 'var(--powder-signal)',
                        borderLeftColor: 'var(--mustard-dossier)',
                      }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  )}
                </div>

              </div>
            </section>

            {/* ============================================================
                SECTION 4 — TRAITS (only if traits exist)
            ============================================================ */}
            {(item.traits?.length ?? 0) > 0 && (
              <section
                className="py-24 border-t"
                style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
              >
                <div className="max-w-[1440px] mx-auto px-8">
                  <EyebrowLabel segments={['02', 'TRAITS']} className="mb-4" />
                  <h3
                    className="font-display text-5xl uppercase mb-12"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    WHAT THE FILE RECORDS.
                  </h3>

                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* LEFT: trait pills */}
                    <div className="col-span-12 lg:col-span-5">
                      <div className="flex flex-col gap-4">
                        {item.traits!.map((trait, i) => (
                          <div
                            key={i}
                            className="p-6 border-l-4"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderLeftColor: 'var(--mustard-dossier)',
                              borderTopColor: 'var(--navy-signal)',
                              borderTopWidth: '1px',
                              borderTopStyle: 'solid',
                            }}
                          >
                            <div
                              className="font-display text-2xl uppercase"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {trait.toUpperCase()}
                            </div>
                            <div
                              className="font-mono uppercase text-[10px] tracking-[0.18em] mt-2"
                              style={{ color: 'var(--shadow-text)' }}
                            >
                              CLASSIFICATION MARKER ▪ #{String(i + 1).padStart(2, '0')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: banner image (faded for characters, normal for others) */}
                    <div className="col-span-12 lg:col-span-7 relative h-[500px] overflow-hidden">
                      <Image
                        src={item.media.banner}
                        alt={`${item.name} visual reference`}
                        fill
                        className={cn(
                          'object-cover object-center',
                          item.category === 'characters' ? 'grayscale opacity-40' : 'opacity-60'
                        )}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, var(--obsidian-deep), transparent 60%)' }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ============================================================
                SECTION 5 — RELATIONSHIPS (characters only)
            ============================================================ */}
            {item.category === 'characters' && (
              <section
                className="py-24 border-t"
                style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
              >
                <div className="max-w-[1440px] mx-auto px-8">
                  <EyebrowLabel segments={['03', 'RELATIONSHIPS']} className="mb-4" />
                  <h3
                    className="font-display text-5xl uppercase mb-12"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    THE PEOPLE IN THEIR ORBIT.
                  </h3>

                  {(() => {
                    const nodes = getRelationshipNodes(item);
                    if (nodes.length === 0) {
                      return (
                        <p
                          className="font-mono uppercase text-[11px] tracking-[0.18em]"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          NO DECLASSIFIED RELATIONSHIPS ON FILE.
                        </p>
                      );
                    }
                    return (
                      <div className="relative h-[580px] max-w-[900px] mx-auto mt-12">
                        {/* Ghost Devanagari संबंध */}
                        <div
                          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                          aria-hidden="true"
                        >
                          <span
                            className="font-display"
                            style={{
                              fontFamily: 'var(--font-devanagari)',
                              fontSize: '18rem',
                              color: 'var(--bone-text)',
                              opacity: 0.06,
                              lineHeight: 1,
                            }}
                          >
                            संबंध
                          </span>
                        </div>

                        {/* Center node (the item itself) */}
                        <div
                          className="absolute w-28 h-28 rounded-full overflow-hidden border-2 z-10"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            borderColor: 'var(--mustard-dossier)',
                            boxShadow: '0 0 24px rgba(241,194,50,0.25)',
                          }}
                        >
                          <Image
                            src={item.media.card}
                            alt={item.name}
                            fill
                            className="object-cover object-top"
                            sizes="112px"
                          />
                        </div>

                        {/* Satellite nodes */}
                        {nodes.map((node) => {
                          const isRival = node.color === 'rival';
                          return (
                            <div
                              key={node.name}
                              className="absolute flex flex-col items-center gap-2"
                              style={{ left: node.posX, top: node.posY, transform: 'translate(-50%, -50%)' }}
                            >
                              {/* Small circular placeholder portrait */}
                              <div
                                className="w-16 h-16 rounded-full border flex items-center justify-center font-display text-lg uppercase"
                                style={{
                                  borderColor: isRival ? 'var(--redaction)' : 'var(--navy-signal)',
                                  backgroundColor: 'var(--obsidian-panel)',
                                  color: 'var(--bone-text)',
                                }}
                              >
                                {node.name.charAt(0)}
                              </div>
                              <div
                                className="font-mono uppercase text-[9px] tracking-[0.14em] text-center"
                                style={{ color: 'var(--shadow-text)' }}
                              >
                                {node.name}
                              </div>
                              <div
                                className="font-mono uppercase text-[8px] tracking-[0.1em] text-center px-2 py-0.5 border"
                                style={{
                                  color: isRival ? 'var(--redaction)' : 'var(--mustard-dossier)',
                                  borderColor: isRival ? 'var(--redaction)' : 'var(--mustard-dossier)',
                                  opacity: 0.85,
                                }}
                              >
                                {node.role}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* ============================================================
                SECTION 6 — ARC TIMELINE (characters only)
            ============================================================ */}
            {item.category === 'characters' && (
              <section
                className="py-24 border-t overflow-hidden"
                style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
              >
                <div className="max-w-[1440px] mx-auto px-8">
                  <EyebrowLabel segments={['04', 'ARC TIMELINE']} className="mb-4" />
                  <h3
                    className="font-display text-5xl uppercase mb-16"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    THEIR JOURNEY THROUGH THE CHRONICLE.
                  </h3>

                  {/* Horizontal beat strip */}
                  <div className="relative">
                    {/* Connecting line */}
                    <div
                      className="absolute top-[28px] left-0 right-0 h-px pointer-events-none"
                      style={{ backgroundColor: 'var(--mustard-dossier)', opacity: 0.4 }}
                      aria-hidden="true"
                    />

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {(item.name === 'Kahaan' ? KAHAAN_BEATS : GENERIC_BEATS).map((beat, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-3 relative">
                          {/* Beat node */}
                          <div
                            className="w-14 h-14 rounded-full border-2 flex items-center justify-center z-10 relative font-mono text-[10px]"
                            style={{
                              backgroundColor: beat.seen ? 'var(--mustard-dossier)' : 'var(--obsidian-panel)',
                              borderColor: beat.seen ? 'var(--mustard-dossier)' : 'var(--navy-signal)',
                              color: beat.seen ? 'var(--obsidian-void)' : 'var(--shadow-text)',
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </div>

                          {/* Chapter label */}
                          <div
                            className="font-mono uppercase text-[9px] tracking-[0.14em]"
                            style={{ color: 'var(--mustard-dossier)' }}
                          >
                            {beat.chapter}
                          </div>

                          {/* Title */}
                          <div
                            className="font-display uppercase text-sm leading-tight"
                            style={{ color: 'var(--bone-text)' }}
                          >
                            {beat.title}
                          </div>

                          {/* Summary */}
                          <div
                            className="font-sans text-[11px] leading-relaxed"
                            style={{ color: 'var(--steel-text)' }}
                          >
                            {beat.summary}
                          </div>

                          {/* Spoiler badge */}
                          {beat.spoiler && (
                            <div
                              className="px-2 py-0.5 font-mono uppercase text-[8px] tracking-[0.12em] border"
                              style={{ color: 'var(--redaction)', borderColor: 'var(--redaction)' }}
                            >
                              SPOILER
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ============================================================
                SECTION 7 — VISUAL DOSSIER (gallery)
            ============================================================ */}
            <section
              className="py-24 border-t"
              style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8">
                <EyebrowLabel segments={['05', 'VISUAL DOSSIER']} className="mb-4" />
                <h3
                  className="font-display text-5xl uppercase mb-12"
                  style={{ color: 'var(--bone-text)' }}
                >
                  {item.category === 'characters'
                    ? `${item.name.toUpperCase()} IN ART.`
                    : `${item.name.toUpperCase()} ARTIFACTS.`}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Slot 1 — tall (row-span-2) */}
                  <div
                    className="md:row-span-2 relative min-h-[400px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.banner}
                      alt={`${item.name} — primary artwork`}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ PRIMARY REF
                    </div>
                  </div>

                  {/* Slot 2 — wide */}
                  <div
                    className="relative min-h-[200px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={`${item.name} — portrait`}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ PORTRAIT
                    </div>
                  </div>

                  {/* Slot 3 — wide */}
                  <div
                    className="relative min-h-[200px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.banner}
                      alt={`${item.name} — environment`}
                      fill
                      className="object-cover object-bottom grayscale opacity-70 group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ ENVIRONMENT
                    </div>
                  </div>

                  {/* Slot 4 — square */}
                  <div
                    className="relative min-h-[220px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={`${item.name} — concept`}
                      fill
                      className="object-cover object-top grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ CONCEPT
                    </div>
                  </div>

                  {/* Slot 5 — square */}
                  <div
                    className="relative min-h-[220px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.banner}
                      alt={`${item.name} — detail`}
                      fill
                      className="object-cover object-center opacity-50 group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ DETAIL
                    </div>
                  </div>

                  {/* Slot 6 — square */}
                  <div
                    className="relative min-h-[220px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={`${item.name} — alternate`}
                      fill
                      className="object-cover object-bottom group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: 'hue-rotate(180deg) opacity(0.4)' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      ARTIST: STUDIO BHARATVARSH ▪ ALTERNATE
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================
                SECTION 8 — QUOTE WALL
            ============================================================ */}
            <section
              className="py-24 border-t"
              style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8 text-center">
                <EyebrowLabel segments={['06', 'IN THEIR OWN WORDS']} className="mb-4 justify-center" />
                <h3
                  className="font-display text-5xl uppercase mb-16"
                  style={{ color: 'var(--bone-text)' }}
                >
                  QUOTES FROM THE CHRONICLE.
                </h3>

                {item.quote ? (
                  <div className="max-w-[720px] mx-auto space-y-16">
                    {/* Primary quote — giant */}
                    <blockquote>
                      <p
                        className="font-serif italic leading-relaxed mb-6"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--powder-signal)' }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <footer
                        className="font-mono uppercase text-[11px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        — {item.quoteAuthor ?? 'CLASSIFIED SOURCE'}
                      </footer>
                    </blockquote>

                    {/* Divider */}
                    <div
                      className="w-16 h-px mx-auto"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                      aria-hidden="true"
                    />

                    {/* Tagline as secondary quote */}
                    {item.tagline && (
                      <blockquote>
                        <p
                          className="font-serif italic text-xl leading-relaxed mb-4"
                          style={{ color: 'var(--steel-text)' }}
                        >
                          &ldquo;{item.tagline}&rdquo;
                        </p>
                        <footer
                          className="font-mono uppercase text-[10px] tracking-[0.18em]"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          — CASE FILE NOTATION
                        </footer>
                      </blockquote>
                    )}
                  </div>
                ) : (
                  <p
                    className="font-mono uppercase text-[11px] tracking-[0.18em]"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    NO ATTRIBUTED QUOTES DECLASSIFIED.
                  </p>
                )}
              </div>
            </section>

            {/* ============================================================
                SECTION 9 — CLOSING CTA STRIP
            ============================================================ */}
            <section
              className="py-16 border-t relative overflow-hidden"
              style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
            >
              {/* Fracture-red overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: 'var(--redaction)', opacity: 0.025 }}
                aria-hidden="true"
              />

              <div className="relative max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center">
                {/* LEFT: card thumbnail */}
                <div className="col-span-12 lg:col-span-5">
                  <div
                    className="relative w-48 h-64 border overflow-hidden mx-auto lg:mx-0"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                      sizes="192px"
                    />
                  </div>
                </div>

                {/* RIGHT: text + CTAs */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  <EyebrowLabel segments={['CONTINUE THE INVESTIGATION']} />

                  <h3
                    className="font-display text-5xl uppercase"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    READ THE FULL CHAPTER.
                  </h3>

                  <p
                    className="font-sans text-lg leading-relaxed max-w-[42ch]"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    The file is only an echo. The chronicle is where they speak.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      href="/novel"
                      className="px-6 py-3 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200"
                      style={{ backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }}
                    >
                      READ THE NOVEL →
                    </Link>
                    <button
                      className="px-6 py-3 border font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200 hover:opacity-80"
                      style={{ borderColor: 'var(--powder-signal)', color: 'var(--bone-text)' }}
                      onClick={onClose}
                    >
                      ← BACK TO ARCHIVE
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>{/* end inner content */}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LoreModal;
