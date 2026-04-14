'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LoreModal } from '@/features/lore';
import { useSession } from '@/features/auth';
import { trackEvent } from '@/lib/track';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import loreRaw from '@/content/data/lore-items.json';
import type { LoreItem, LoreCategory, LoreData } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterValue = LoreCategory | 'all';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const data = loreRaw as LoreData;
const allItems = data.lore as LoreItem[];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Masonry grid-span class per operatives sort order (1-indexed within characters). */
const CHAR_GRID_CLASSES: Record<string, string> = {
  rudra: 'col-span-2 row-span-3',
  arshi: 'col-span-1 row-span-2',
  hana: 'col-span-1 row-span-2',
  pratap: 'col-span-1 row-span-2',
  kaali: 'col-span-2 row-span-2',
  surya: 'col-span-1 row-span-2',
  // Kahaan is featured separately at the top; include a fallback
  kahaan: 'col-span-1 row-span-2',
};

const LOCATION_COORDS: Record<string, string> = {
  indrapur: '28.6°N 77.2°E',
  lakshmanpur: '26.8°N 80.9°E',
  'treaty-zone': '31.1°N 77.6°E',
  mysuru: '12.3°N 76.6°E',
};

// Tech card rotation classes (alternating positive/negative)
const TECH_ROTATIONS = [
  'rotate-[1deg]',
  'rotate-[-1deg]',
  'rotate-[2deg]',
  'rotate-[-2deg]',
  'rotate-[1deg]',
  'rotate-[-1deg]',
  'rotate-[2deg]',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface LockedOverlayProps {
  locked: boolean;
}

function LockedOverlay({ locked }: LockedOverlayProps) {
  if (!locked) return null;
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: 'rgba(15,20,25,0.85)' }}
    >
      <div className="h-6 w-4/5" style={{ backgroundColor: 'var(--redaction)' }} />
      <div
        className="font-mono uppercase text-[11px] tracking-[0.18em]"
        style={{ color: 'var(--redaction)' }}
      >
        CLEARANCE REQUIRED
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LoreContent() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [selectedItem, setSelectedItem] = useState<LoreItem | null>(null);
  const [hasHandledDeepLink, setHasHandledDeepLink] = useState(false);
  // Flag set when the modal was auto-opened from a /lore?item=<id> deep link.
  // Used on close to route the user back to the originating page (Home, Novel, etc.)
  // instead of stranding them on /lore.
  const [openedViaDeepLink, setOpenedViaDeepLink] = useState(false);
  const { isAuthenticated } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deep link support: /lore?item=<id> auto-opens that item's modal on mount
  useEffect(() => {
    if (hasHandledDeepLink) return;
    const itemId = searchParams.get('item');
    if (!itemId) return;
    const target = allItems.find((i) => i.id === itemId);
    if (target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial URL param sync on mount
      setSelectedItem(target);
      setOpenedViaDeepLink(true);
      setHasHandledDeepLink(true);
    }
  }, [searchParams, hasHandledDeepLink]);

  // ------------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------------

  const kahaanItem = useMemo(
    () => allItems.find((i) => i.id === 'kahaan') ?? null,
    []
  );

  const bharatsenaItem = useMemo(
    () => allItems.find((i) => i.id === 'bharatsena') ?? null,
    []
  );

  const akakpenItem = useMemo(
    () => allItems.find((i) => i.id === 'akakpen-tribe') ?? null,
    []
  );

  const locationItems = useMemo(
    () => allItems.filter((i) => i.category === 'locations').sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  const techItems = useMemo(
    () => allItems.filter((i) => i.category === 'tech').sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  // Characters excluding Kahaan (he's in the featured section)
  const operativeItems = useMemo(
    () =>
      allItems
        .filter((i) => i.category === 'characters' && i.id !== 'kahaan')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems.sort((a, b) => a.sortOrder - b.sortOrder);
    return allItems
      .filter((i) => i.category === activeFilter)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeFilter]);

  const counts = useMemo(
    () => ({
      all: allItems.length,
      characters: allItems.filter((i) => i.category === 'characters').length,
      factions: allItems.filter((i) => i.category === 'factions').length,
      locations: allItems.filter((i) => i.category === 'locations').length,
      tech: allItems.filter((i) => i.category === 'tech').length,
    }),
    []
  );

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  function handleCardClick(item: LoreItem) {
    if (item.classification === 'classified' && !isAuthenticated) return;
    trackEvent('lore_item_view', { id: item.id, name: item.name, category: item.category });
    setSelectedItem(item);
    // In-page card click isn't a deep link — close should stay on /lore.
    setOpenedViaDeepLink(false);
  }

  function handleModalClose() {
    if (openedViaDeepLink) {
      setOpenedViaDeepLink(false);
      // Only router.back() when we have a same-origin referrer — guards against
      // direct URL loads where back() would navigate away from our site.
      const sameOriginReferrer =
        typeof document !== 'undefined' &&
        document.referrer !== '' &&
        document.referrer.startsWith(window.location.origin);
      if (sameOriginReferrer) {
        router.back();
        return;
      }
    }
    setSelectedItem(null);
  }

  // ------------------------------------------------------------------
  // Portrait thumbnails for the hero cluster
  // ------------------------------------------------------------------

  const heroThumbnails: Array<{ id: string; posClass: string; rotation: string; zIndex: string }> = [
    { id: 'kahaan', posClass: 'top-0 left-0', rotation: '-3deg', zIndex: 'z-10' },
    { id: 'rudra', posClass: 'top-16 left-40', rotation: '2deg', zIndex: 'z-20' },
    { id: 'arshi', posClass: 'top-40 left-8', rotation: '-5deg', zIndex: 'z-30' },
    { id: 'hana', posClass: 'top-56 left-48', rotation: '4deg', zIndex: 'z-40' },
  ];

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--obsidian-void)' }}>

      {/* ================================================================
          SECTION 1 — Archive Hero
      ================================================================ */}
      <section
        className="relative overflow-hidden pt-32 pb-24"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        {/* Giant Devanagari ghost layer */}
        <div
          className="absolute -left-[5vw] top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{
            fontFamily: 'var(--font-devanagari)',
            fontSize: 'clamp(8rem, 20vw, 24rem)',
            color: 'var(--powder-signal)',
            opacity: 0.12,
            lineHeight: 1,
          }}
        >
          अभिलेख
        </div>

        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* LEFT — copy */}
            <div className="col-span-7">
              <EyebrowLabel
                segments={['INTELLIGENCE ARCHIVE', 'CLASSIFIED', 'LEVEL 4 ACCESS']}
                className="mb-6"
              />

              <h1
                className="font-display leading-[0.9] mt-2"
                style={{
                  fontSize: 'clamp(4rem,9vw,8rem)',
                  color: 'var(--bone-text)',
                }}
              >
                WALK THE
                <br />
                <span
                  className="inline-flex items-center justify-center px-3 border-2"
                  style={{
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                  }}
                >
                  A
                </span>
                RCHIVE.
              </h1>

              <p
                className="font-sans text-lg leading-relaxed max-w-[65ch] mt-6"
                style={{ color: 'var(--steel-text)' }}
              >
                Six operatives. Two factions. Four locations. Fourteen pieces of classified
                tech. Every file stamped, every portrait redacted until clearance is granted.
                Start with whoever draws your eye first.
              </p>

              <EyebrowLabel
                segments={[
                  `${counts.all} FILES INDEXED`,
                  `${counts.characters} OPERATIVES`,
                  `${counts.factions} FACTIONS`,
                  `${counts.locations} LOCATIONS`,
                  `${counts.tech} TECH`,
                ]}
                className="mt-8"
              />
            </div>

            {/* RIGHT — floating portrait cluster */}
            <div className="col-span-5">
              <div className="relative h-[500px]">
                {heroThumbnails.map(({ id, posClass, rotation, zIndex }) => {
                  const item = allItems.find((i) => i.id === id);
                  if (!item?.media.card) return null;
                  return (
                    <div
                      key={id}
                      className={`absolute ${posClass} ${zIndex} border-2 shadow-2xl overflow-hidden`}
                      style={{
                        width: 200,
                        height: 267,
                        transform: `rotate(${rotation})`,
                        borderColor: 'var(--mustard-dossier)',
                      }}
                    >
                      <Image
                        src={item.media.card}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                        sizes="200px"
                      />
                    </div>
                  );
                })}

                {/* CLASSIFIED stamp overlay */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border-4 border-dashed px-8 py-4 font-mono uppercase text-2xl tracking-[0.18em] pointer-events-none"
                  style={{
                    transform: 'translate(-50%, -50%) rotate(-6deg)',
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                    backgroundColor: 'rgba(15, 20, 25, 0.6)',
                  }}
                >
                  CLASSIFIED
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — Filter Rail
      ================================================================ */}
      <section
        className="py-6 border-y relative z-10"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 flex items-center gap-6 flex-wrap">
          <EyebrowLabel segments={['FILTER ARCHIVE BY CATEGORY']} />

          {(
            [
              { value: 'all', label: `ALL FILES (${counts.all})` },
              { value: 'characters', label: `OPERATIVES (${counts.characters})` },
              { value: 'factions', label: `FACTIONS (${counts.factions})` },
              { value: 'locations', label: `LOCATIONS (${counts.locations})` },
              { value: 'tech', label: `TECH (${counts.tech})` },
            ] as Array<{ value: FilterValue; label: string }>
          ).map(({ value, label }) => {
            const isActive = activeFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className="px-4 py-2 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors"
                style={
                  isActive
                    ? { backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }
                    : {
                        color: 'var(--powder-signal)',
                        borderColor: 'var(--navy-signal)',
                        border: '1px solid var(--navy-signal)',
                      }
                }
              >
                <span>{isActive ? '●' : '○'}</span>
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          SECTION 3 — Featured Operative Showcase (Kahaan)
          Only when filter is 'all' or 'characters'
      ================================================================ */}
      {(activeFilter === 'all' || activeFilter === 'characters') && kahaanItem && (
        <section
          className="py-24 relative overflow-hidden"
          style={{ backgroundColor: 'var(--obsidian-void)' }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <EyebrowLabel
              segments={['FEATURED FILE', 'RECOMMENDED ENTRY POINT']}
              className="mb-6"
            />

            <div className="grid grid-cols-12 gap-8 items-center">

              {/* LEFT — content stack */}
              <div className="col-span-5">
                {/* Rotated classified stamp */}
                <div
                  className="inline-flex items-center border-2 border-dashed px-4 py-2 mb-6 font-mono uppercase text-xs tracking-[0.18em]"
                  style={{
                    transform: 'rotate(-4deg)',
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                    display: 'inline-flex',
                  }}
                >
                  CLASSIFIED ▪ CASE FILE #0042
                </div>

                <EyebrowLabel
                  segments={['CASE FILE #0042', 'DECLASSIFIED 2032.03.11']}
                />

                <h2
                  className="font-display mt-4"
                  style={{
                    fontSize: 'clamp(4rem, 10vw, 9rem)',
                    lineHeight: 0.85,
                    color: 'var(--bone-text)',
                  }}
                >
                  KAHAAN
                </h2>

                <div
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-devanagari)',
                    fontSize: '2.5rem',
                    color: 'var(--powder-signal)',
                  }}
                >
                  कहान
                </div>

                <EyebrowLabel
                  segments={['RANK: CAPTAIN', 'UNIT: BHARATSENA 7TH', 'STATUS: ACTIVE']}
                  className="mt-4"
                />

                <p
                  className="font-serif italic text-xl leading-relaxed mt-6 max-w-[50ch]"
                  style={{ color: 'var(--powder-signal)' }}
                >
                  &ldquo;The dossier on my father came with my uniform.&rdquo;
                </p>

                {/* Trait chips */}
                <div className="flex gap-2 mt-6 flex-wrap">
                  {['HUD MONOCLE — LEFT EYE', 'SCAR — RIGHT CHEEK', 'LEGACY HEIR'].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center border px-3 py-1.5 text-[11px] tracking-[0.18em] font-mono uppercase"
                      style={{
                        borderColor: 'var(--navy-signal)',
                        backgroundColor: 'var(--obsidian-panel)',
                        color: 'var(--powder-signal)',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => handleCardClick(kahaanItem)}
                  className="mt-8 px-8 py-4 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  OPEN THE FULL FILE →
                </button>
              </div>

              {/* RIGHT — banner image */}
              <div className="col-span-7">
                <div className="relative h-[600px]">
                  <Image
                    src={kahaanItem.media.banner}
                    alt="Kahaan dossier banner"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1440px) 60vw, 800px"
                  />
                  {/* Left-edge gradient fade */}
                  <div
                    className="absolute inset-y-0 left-0 w-1/3 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, var(--obsidian-void), transparent)',
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 4 — Operatives Masonry (or filtered grid)
      ================================================================ */}
      <section
        className="py-24 border-t"
        style={{
          backgroundColor: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['OPERATIVES', `${counts.characters} FILES`, 'CHARACTERS OF BHARATVARSH']}
            className="mb-4"
          />

          <h2
            className="font-display mb-12"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 0.9,
              color: 'var(--bone-text)',
            }}
          >
            THE PEOPLE OF THE DOSSIER.
          </h2>

          {/* ------------- MASONRY (all or characters filter) ------------- */}
          {(activeFilter === 'all' || activeFilter === 'characters') ? (
            <div className="grid grid-cols-4 gap-6 auto-rows-[140px]">
              {operativeItems.map((item) => {
                const gridClass = CHAR_GRID_CLASSES[item.id] ?? 'col-span-1 row-span-2';
                const locked = item.classification === 'classified' && !isAuthenticated;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className={`${gridClass} group relative overflow-hidden border transition-transform hover:-translate-y-1 text-left`}
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderColor: 'var(--navy-signal)',
                      borderLeft: '4px solid var(--mustard-dossier)',
                    }}
                  >
                    <LockedOverlay locked={locked} />

                    {item.media?.card && (
                      <Image
                        src={item.media.card}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}

                    {/* Scan hover line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                    />

                    {/* Bottom gradient + metadata */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-4"
                      style={{
                        background: 'linear-gradient(to top, var(--obsidian-void), transparent)',
                      }}
                    >
                      <div
                        className="font-mono uppercase text-[10px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {item.subtype ?? item.category?.toUpperCase()}
                      </div>
                      <div
                        className="font-display text-xl mt-1"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {item.name}
                      </div>
                    </div>

                    {/* Devanagari overlay */}
                    {item.nameDevanagari && (
                      <div
                        className="absolute bottom-16 left-4 text-3xl pointer-events-none"
                        style={{
                          fontFamily: 'var(--font-devanagari)',
                          color: 'var(--powder-signal)',
                          opacity: 0.22,
                        }}
                      >
                        {item.nameDevanagari}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ------------- SIMPLE 4-COL GRID (factions / locations / tech) ------------- */
            <div className="grid grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const locked = item.classification === 'classified' && !isAuthenticated;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="group relative overflow-hidden border transition-transform hover:-translate-y-1 aspect-[3/4] text-left"
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderColor: 'var(--navy-signal)',
                      borderLeft: '4px solid var(--mustard-dossier)',
                    }}
                  >
                    <LockedOverlay locked={locked} />

                    {item.media?.card && (
                      <Image
                        src={item.media.card}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    )}

                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                    />

                    <div
                      className="absolute inset-x-0 bottom-0 p-4"
                      style={{
                        background: 'linear-gradient(to top, var(--obsidian-void), transparent)',
                      }}
                    >
                      <div
                        className="font-mono uppercase text-[10px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {item.subtype ?? item.category?.toUpperCase()}
                      </div>
                      <div
                        className="font-display text-xl mt-1"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {item.name}
                      </div>
                    </div>

                    {item.nameDevanagari && (
                      <div
                        className="absolute bottom-16 left-4 text-3xl pointer-events-none"
                        style={{
                          fontFamily: 'var(--font-devanagari)',
                          color: 'var(--powder-signal)',
                          opacity: 0.22,
                        }}
                      >
                        {item.nameDevanagari}
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-4 py-16 text-center">
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest block"
                    style={{ color: 'var(--mustard-dossier)' }}
                  >
                    Order Feeds All
                  </span>
                  <p
                    className="mt-2 font-sans text-sm"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    No active records found for this classification.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          SECTION 5 — Factions Split (7/5 asymmetric)
          Only when filter is 'all' or 'factions'
      ================================================================ */}
      {(activeFilter === 'all' || activeFilter === 'factions') && (
        <section
          className="py-24 border-t"
          style={{
            backgroundColor: 'var(--obsidian-deep)',
            borderColor: 'var(--navy-signal)',
          }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <EyebrowLabel
              segments={['FACTIONS', '02 POWER BLOCS', 'THE LINE DOWN THE MIDDLE']}
              className="mb-4"
            />

            <h2
              className="font-display mb-12"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 0.9,
                color: 'var(--bone-text)',
              }}
            >
              TWO SIDES. NO NEUTRAL GROUND.
            </h2>

            <div className="grid grid-cols-12 gap-8">

              {/* LEFT — Bharatsena (large hero) */}
              {bharatsenaItem && (
                <div className="col-span-7">
                  <button
                    type="button"
                    onClick={() => handleCardClick(bharatsenaItem)}
                    className="group relative w-full overflow-hidden border text-left"
                    style={{
                      borderColor: 'var(--mustard-dossier)',
                      height: 480,
                    }}
                  >
                    <Image
                      src={bharatsenaItem.media.banner}
                      alt="Bharatsena"
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1440px) 55vw, 780px"
                    />

                    {/* Faction sigil */}
                    <div className="absolute top-6 right-6 z-10">
                      <Image
                        src="/images/brand/factions/bharatsena.svg"
                        alt="Bharatsena sigil"
                        width={80}
                        height={80}
                        className="opacity-90"
                      />
                    </div>

                    {/* Bottom overlay */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-8 z-10"
                      style={{
                        background:
                          'linear-gradient(to top, var(--obsidian-void) 50%, transparent)',
                      }}
                    >
                      <div
                        className="font-display text-6xl leading-none"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        BHARATSENA
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-devanagari)',
                          fontSize: '1.5rem',
                          color: 'var(--powder-signal)',
                        }}
                      >
                        भारतसेना
                      </div>
                      <p
                        className="font-sans text-sm leading-relaxed mt-3 max-w-[55ch]"
                        style={{ color: 'var(--steel-text)' }}
                      >
                        The ruling military directorate. Four decades of stability, delivered
                        through total surveillance. Every wrist scanned. Every movement logged.
                      </p>
                      <div
                        className="mt-4 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2"
                        style={{ color: 'var(--mustard-dossier)' }}
                      >
                        EXPLORE FACTION FILE →
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* RIGHT — Akakpen (smaller, redaction accents) */}
              {akakpenItem && (
                <div className="col-span-5">
                  <button
                    type="button"
                    onClick={() => handleCardClick(akakpenItem)}
                    className="group relative w-full overflow-hidden border text-left"
                    style={{
                      borderColor: 'var(--redaction)',
                      height: 480,
                    }}
                  >
                    <Image
                      src={akakpenItem.media.banner}
                      alt="Akakpen Tribe"
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1440px) 38vw, 550px"
                    />

                    {/* Faction sigil */}
                    <div className="absolute top-6 right-6 z-10">
                      <Image
                        src="/images/brand/factions/akakpen.svg"
                        alt="Akakpen sigil"
                        width={80}
                        height={80}
                        className="opacity-90"
                      />
                    </div>

                    {/* Bottom overlay */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-8 z-10"
                      style={{
                        background:
                          'linear-gradient(to top, var(--obsidian-void) 50%, transparent)',
                      }}
                    >
                      <div
                        className="font-display text-5xl leading-none"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        AKAKPEN
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-devanagari)',
                          fontSize: '1.5rem',
                          color: 'var(--powder-signal)',
                        }}
                      >
                        आकाकपेन
                      </div>
                      <p
                        className="font-sans text-sm leading-relaxed mt-3 max-w-[45ch]"
                        style={{ color: 'var(--steel-text)' }}
                      >
                        Semi-autonomous treaty people of the Eastern wilds. The crack
                        in the Mesh that the regime cannot seal.
                      </p>
                      <div
                        className="mt-4 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2"
                        style={{ color: 'var(--redaction)' }}
                      >
                        ACCESS ENCRYPTED FILE →
                      </div>
                    </div>
                  </button>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 6 — Locations Rail (horizontal scroll)
          Only when filter is 'all' or 'locations'
      ================================================================ */}
      {(activeFilter === 'all' || activeFilter === 'locations') && (
        <section
          className="py-24 border-t"
          style={{
            backgroundColor: 'var(--obsidian-void)',
            borderColor: 'var(--navy-signal)',
          }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <EyebrowLabel
              segments={[
                'LOCATIONS',
                '04 GEO-TAGGED',
                'WHERE THE FILES WERE COMPILED',
              ]}
              className="mb-4"
            />

            <h2
              className="font-display mb-12"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 0.9,
                color: 'var(--bone-text)',
              }}
            >
              THE PLACES YOU WEREN&apos;T MEANT TO SEE.
            </h2>

            {/* Horizontal scroll rail */}
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {locationItems.map((item) => {
                const locked = item.classification === 'classified' && !isAuthenticated;
                const coords = LOCATION_COORDS[item.id] ?? '00.0°N 00.0°E';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="group relative flex-shrink-0 overflow-hidden border snap-start text-left"
                    style={{
                      width: 380,
                      aspectRatio: '16/9',
                      borderColor: 'var(--navy-signal)',
                    }}
                  >
                    <LockedOverlay locked={locked} />

                    {item.media?.card && (
                      <Image
                        src={item.media.card}
                        alt={item.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        sizes="380px"
                      />
                    )}

                    {/* Coordinate label — top right */}
                    <div
                      className="absolute top-3 right-3 z-10 font-mono text-[10px] tracking-[0.12em] px-2 py-1"
                      style={{
                        backgroundColor: 'rgba(15,20,25,0.8)',
                        color: 'var(--mustard-dossier)',
                      }}
                    >
                      {coords}
                    </div>

                    {/* Bottom metadata */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-end"
                      style={{
                        background:
                          'linear-gradient(to top, var(--obsidian-void), transparent)',
                      }}
                    >
                      <div
                        className="font-display text-2xl leading-tight"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {item.name}
                      </div>
                      {item.nameDevanagari && (
                        <div
                          className="text-xl"
                          style={{
                            fontFamily: 'var(--font-devanagari)',
                            color: 'var(--powder-signal)',
                            opacity: 0.22,
                          }}
                        >
                          {item.nameDevanagari}
                        </div>
                      )}
                    </div>

                    {/* Scan hover line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="/lore?filter=locations"
                className="font-mono uppercase text-[11px] tracking-[0.18em] border px-6 py-3 inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                OPEN WORLD ATLAS →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 7 — Tech Files Grid (tossed-evidence rotation)
          Only when filter is 'all' or 'tech'
      ================================================================ */}
      {(activeFilter === 'all' || activeFilter === 'tech') && (
        <section
          className="py-24 border-t"
          style={{
            backgroundColor: 'var(--obsidian-deep)',
            borderColor: 'var(--navy-signal)',
          }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <EyebrowLabel
              segments={[
                'CLASSIFIED TECH',
                `${counts.tech} ITEMS`,
                'WEAPONS ▪ SURVEILLANCE ▪ COMMS',
              ]}
              className="mb-4"
            />

            <h2
              className="font-display mb-12"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 0.9,
                color: 'var(--bone-text)',
              }}
            >
              HARDWARE THE REGIME PREFERS YOU FORGET.
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {techItems.map((item, idx) => {
                const locked = item.classification === 'classified' && !isAuthenticated;
                const rotClass = TECH_ROTATIONS[idx % TECH_ROTATIONS.length];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className={`group relative overflow-hidden border transition-transform hover:-translate-y-1 text-left ${rotClass}`}
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderColor: 'var(--navy-signal)',
                    }}
                  >
                    <LockedOverlay locked={locked} />

                    {/* 1:1 image on top */}
                    {item.media?.card && (
                      <div className="relative w-full aspect-square">
                        <Image
                          src={item.media.card}
                          alt={item.name}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 1440px) 33vw, 460px"
                        />
                      </div>
                    )}

                    {/* Card body */}
                    <div
                      className="p-4"
                      style={{ backgroundColor: 'var(--obsidian-panel)' }}
                    >
                      {/* Classified badge */}
                      {item.classification === 'classified' && (
                        <div
                          className="inline-flex items-center font-mono uppercase text-[9px] tracking-[0.18em] border px-2 py-0.5 mb-2"
                          style={{
                            borderColor: 'var(--mustard-dossier)',
                            color: 'var(--mustard-dossier)',
                          }}
                        >
                          CLASSIFIED LVL 3
                        </div>
                      )}
                      <div
                        className="font-display text-xl leading-tight"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {item.name}
                      </div>
                      <div
                        className="font-mono text-[10px] tracking-[0.12em] mt-1 uppercase"
                        style={{ color: 'var(--steel-text)' }}
                      >
                        {item.tagline ?? item.subtype}
                      </div>
                    </div>

                    {/* Scan hover line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <button
                type="button"
                onClick={() => setActiveFilter('tech')}
                className="font-mono uppercase text-[11px] tracking-[0.18em] border px-6 py-3 inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                UNSEAL ALL TECH →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 8 — Classified Invitation Strip
      ================================================================ */}
      <section
        className="py-20 border-t relative overflow-hidden"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        {/* Fracture red pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--redaction) 0 1px, transparent 1px 20px)',
            opacity: 0.025,
          }}
        />

        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* LEFT — copy */}
            <div className="col-span-8">
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  lineHeight: 0.9,
                  color: 'var(--bone-text)',
                }}
              >
                SOME FILES REQUIRE CLEARANCE.
              </h2>
              <p
                className="font-sans text-lg leading-relaxed mt-6 max-w-[65ch]"
                style={{ color: 'var(--steel-text)' }}
              >
                Classified operatives, redacted histories, and the full dossier on every
                faction are locked behind access level 4. Request clearance to unlock
                extended files, hidden portraits, and encrypted case notes.
              </p>
            </div>

            {/* RIGHT — CTA cluster */}
            <div className="col-span-4 flex flex-col gap-4 items-end justify-center">
              <a
                href="/auth/signin"
                className="px-8 py-4 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-opacity hover:opacity-90 w-full justify-center"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                REQUEST CLEARANCE →
              </a>

              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="px-8 py-4 font-mono uppercase text-[11px] tracking-[0.18em] border inline-flex items-center gap-2 transition-opacity hover:opacity-80 w-full justify-center"
                style={{
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                BROWSE AS VISITOR
              </button>

              {/* Decorative redaction bar */}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="h-[14px] w-24"
                  style={{ backgroundColor: 'var(--redaction)', opacity: 0.7 }}
                />
                <span
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                  style={{ color: 'var(--redaction)', opacity: 0.7 }}
                >
                  [REDACTED]
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 9 — Modal mount (preserved from existing implementation)
      ================================================================ */}
      <LoreModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleModalClose}
      />
    </div>
  );
}
