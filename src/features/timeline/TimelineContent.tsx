'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { useSession } from '@/features/auth';
import { cn } from '@/shared/utils';
import timelineRaw from '@/content/data/timeline.json';
import loreRaw from '@/content/data/lore-items.json';

// ─── Data normalisation ──────────────────────────────────────────────────────

interface TimelineEvent {
  id: number;
  title: string;
  description?: string;
  slug?: string;
  date: {
    original: string;
    start_year: number;
    end_year: number;
    is_range: boolean;
  };
  metadata?: {
    significance?: number;
    event_type?: string;
    impacts?: string[];
    locations?: string[];
    remarks?: string;
  };
  media?: {
    icon?: string;
    color?: string;
    image?: string;
  };
}

interface LoreItem {
  id: string;
  name: string;
  nameDevanagari?: string;
  category: string;
  subtype?: string;
  tagline?: string;
  description?: string;
  classification?: 'declassified' | 'classified' | string;
  media?: { card?: string; banner?: string };
}

const timelineEvents: TimelineEvent[] =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (timelineRaw as any).timeline?.events ?? (timelineRaw as any).events ?? [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loreItems: LoreItem[] = (loreRaw as any).lore ?? [];

// ─── Era definitions ─────────────────────────────────────────────────────────

interface Era {
  id: string;
  name: string;
  devanagari?: string;
  years: string;
  eventIds: number[];
  blurb: string;
  operatives: number;
  dispatches: number;
}

const ERAS: Era[] = [
  {
    id: 'enlightenment',
    name: 'ENLIGHTENMENT',
    years: '1717–1850',
    eventIds: [1, 2],
    blurb:
      'A reformist charter was denied. Capital stayed local. Three regional polities flourished under shared civic vocabulary. Learning spread laterally, not from a colonial centre. The seeds of a different subcontinent were planted in guild libraries and copperplate presses.',
    operatives: 4,
    dispatches: 6,
  },
  {
    id: 'divergence',
    name: 'DIVERGENCE',
    years: '1850–1895',
    eventIds: [3],
    blurb:
      'Prosperity produced factions. Labour unions matured and splintered. Rail spines sharpened competition for eastern coal seams. The social contract was still forming, yet the incentives of energy and credit increasingly pointed the system toward confrontation.',
    operatives: 5,
    dispatches: 8,
  },
  {
    id: 'republic',
    name: 'REPUBLIC',
    years: '1905–1975',
    eventIds: [4, 5],
    blurb:
      'A democratic republic oversaw the largest buildout in the subcontinent\'s history. Two national ballots. Wartime partnerships. A civilian-first atomic programme. Rail density doubled. By 1975, coalition paralysis and rising sectarian mobilisation dominated cabinet agendas.',
    operatives: 9,
    dispatches: 14,
  },
  {
    id: 'civil-war',
    name: 'CIVIL WAR',
    years: '1975–1985',
    eventIds: [6, 7],
    blurb:
      'Rolling riots, targeted assassinations, and sabotage overwhelmed civil policing. Sectarian fronts radicalised, black markets bloomed, provincial administrations split. A cluster of bombings near decade\'s end forced a reset of institutions—and an army that had run out of patience.',
    operatives: 7,
    dispatches: 11,
  },
  {
    id: 'mesh-era',
    name: 'THE MESH',
    years: '1985–2022',
    eventIds: [8],
    blurb:
      'Governance fused with infrastructure. National ID seeded biometric wallets. Cameras and licence readers formed a lattice from bazaars to expressways. Fines autodebited; subsidies arrived predictably; petty corruption collapsed. So did anonymity. For most citizens, stability felt ordinary again.',
    operatives: 12,
    dispatches: 20,
  },
  {
    id: 'the-crack',
    name: 'THE CRACK',
    years: '2022–2032',
    eventIds: [9],
    blurb:
      'In 2022, the calm cracked. A synchronised bombing campaign struck critical sites across multiple regions. The attacks exposed seams in the Mesh and changed how cities measured risk in everyday routines. Case 0042 was opened. The chronicle you are reading began here.',
    operatives: 3,
    dispatches: 4,
  },
];

// ─── Three-Track Chronology Ledger ──────────────────────────────────────────
// Three parallel tracks carrying the canonical beats from BHARATVARSH_TIMELINE.md.
// Events are positioned proportionally along a shared 1717 → 2025 time axis.
// Turning-point vertical bars at 1717 / 1985 / 2025 span all three tracks to
// show how every political pivot rippled into character fates and technology.

const TIMELINE_START = 1717;
const TIMELINE_END = 2025;
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

function yearToPct(year: number): number {
  return ((year - TIMELINE_START) / TIMELINE_SPAN) * 100;
}

interface TrackEvent {
  year: number;
  label: string;
  turning?: boolean;
}

const POLITICAL_TRACK: TrackEvent[] = [
  { year: 1717, label: 'REFUSAL', turning: true },
  { year: 1918, label: 'WWI ALLY' },
  { year: 1945, label: 'UN VETO' },
  { year: 1947, label: 'NO PARTITION' },
  { year: 1985, label: 'ARMY DECREE', turning: true },
  { year: 2025, label: '20-10 BOMBINGS', turning: true },
];

const CHARACTER_TRACK: TrackEvent[] = [
  { year: 1970, label: 'RUDRA BORN' },
  { year: 1990, label: 'TRIBHUJ FOUNDED' },
  { year: 1999, label: 'KAHAAN BORN' },
  { year: 2003, label: 'RUDRA EXILES' },
  { year: 2021, label: 'AFRICA FRACTURE' },
  { year: 2025, label: 'RETURN' },
];

const TECH_TRACK: TrackEvent[] = [
  { year: 1850, label: 'RAILWAYS' },
  { year: 1990, label: 'GREEN-TECH' },
  { year: 2003, label: 'MESH P1' },
  { year: 2010, label: 'MESH P3' },
  { year: 2015, label: 'KACHA' },
];

const TURNING_YEARS = [1717, 1985, 2025];

// ─── Track marker (helper for the three-track ledger) ───────────────────────
//
// Labels are placed on a 4-slot staircase to prevent overlap when events
// cluster in time:
//
//          above-far    (slot 3)  ── leader line ──┐
//          above-near   (slot 1)                   │
//   ─────────●────────────────────────●────────●───┴───── line
//                          (slot 0)   below-near
//                          (slot 2)   below-far ── leader line ──┐
//
// The parent sorts events chronologically and assigns slot = i % 4, so any
// 4 consecutive events fan out to 4 distinct vertical positions even when
// their dots are physically adjacent.

type LabelSlot = 0 | 1 | 2 | 3;

const NEAR_GAP = 8;
const LABEL_H = 24;
const FAR_EXTRA = 20;

interface MarkerLayout {
  labelTop: number;
  showLeader: boolean;
  leaderTop: number;
  leaderHeight: number;
}

function getMarkerLayout(slot: LabelSlot, dotSize: number): MarkerLayout {
  switch (slot) {
    case 0: // below-near
      return {
        labelTop: dotSize + NEAR_GAP,
        showLeader: false,
        leaderTop: 0,
        leaderHeight: 0,
      };
    case 1: // above-near
      return {
        labelTop: -(NEAR_GAP + LABEL_H),
        showLeader: false,
        leaderTop: 0,
        leaderHeight: 0,
      };
    case 2: // below-far
      return {
        labelTop: dotSize + NEAR_GAP + FAR_EXTRA + LABEL_H,
        showLeader: true,
        leaderTop: dotSize,
        leaderHeight: NEAR_GAP + FAR_EXTRA + LABEL_H,
      };
    case 3: // above-far
      return {
        labelTop: -(NEAR_GAP + LABEL_H + FAR_EXTRA + LABEL_H),
        showLeader: true,
        leaderTop: -(NEAR_GAP + FAR_EXTRA + LABEL_H),
        leaderHeight: NEAR_GAP + FAR_EXTRA + LABEL_H,
      };
  }
}

function TrackMarker({
  ev,
  trackTop,
  slot,
}: {
  ev: TrackEvent;
  trackTop: number;
  slot: LabelSlot;
}) {
  const size = ev.turning ? 14 : 8;
  const color = ev.turning ? 'var(--mustard-dossier)' : 'var(--bone-text)';
  const layout = getMarkerLayout(slot, size);

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{
        top: trackTop - size / 2,
        left: `${yearToPct(ev.year)}%`,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: ev.turning
            ? '0 0 0 4px color-mix(in srgb, var(--mustard-dossier) 25%, transparent)'
            : 'none',
        }}
      />
      {/* Leader line — connects far-slot labels back to the dot for visual association */}
      {layout.showLeader && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-px"
          style={{
            top: layout.leaderTop,
            height: layout.leaderHeight,
            backgroundColor: color,
            opacity: 0.45,
          }}
        />
      )}
      <div
        className="absolute flex flex-col items-center whitespace-nowrap"
        style={{ top: layout.labelTop }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-[0.15em]"
          style={{ color }}
        >
          {ev.year}
        </span>
        <span
          className="font-mono text-[8px] uppercase tracking-[0.1em] mt-0.5"
          style={{ color: 'var(--shadow-text)' }}
        >
          {ev.label}
        </span>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TimelineContent() {
  const [activeEra, setActiveEra] = useState<string>('mesh-era');
  const { isAuthenticated } = useSession();
  const eraContentRef = useRef<HTMLDivElement>(null);
  const beatStripRef = useRef<HTMLDivElement>(null);

  const activeEraObj = ERAS.find((e) => e.id === activeEra) ?? ERAS[4];
  const activeEvents = timelineEvents.filter((ev) =>
    activeEraObj.eventIds.includes(ev.id)
  );

  const characterItems = loreItems.filter((item) => item.category === 'characters');

  function scrollToEraContent() {
    eraContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollTo1717() {
    setActiveEra('enlightenment');
    eraContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Get the ambient image for the active era from the first event's media
  const eraAmbientImage =
    activeEvents.length > 0 ? (activeEvents[0].media?.image ?? null) : null;

  return (
    <>
      {/* ── Section 1: Chronology Hero ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-32 pb-24"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        {/* Giant Devanagari ghost */}
        <span
          aria-hidden="true"
          className="absolute -left-[5vw] top-1/2 -translate-y-1/2 font-devanagari pointer-events-none select-none"
          style={{
            fontFamily: 'var(--font-devanagari)',
            fontSize: 'clamp(8rem, 20vw, 24rem)',
            color: 'var(--powder-signal)',
            opacity: 0.1,
            lineHeight: 1,
          }}
        >
          कालक्रम
        </span>

        <div className="max-w-[1440px] mx-auto px-8 relative z-10 grid grid-cols-12 gap-8 items-center">
          {/* LEFT — headline */}
          <div className="col-span-12 lg:col-span-7">
            <EyebrowLabel
              segments={['CHRONOLOGY', '1717 → 2025', '308 YEARS', 'FROM REFUSAL TO FRACTURE']}
            />

            <div
              className="mt-6 font-display leading-[0.9]"
              style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', color: 'var(--bone-text)' }}
            >
              <div>WHEN</div>
              <div>HISTORY</div>
              <div>
                <span
                  style={{
                    textDecorationLine: 'underline',
                    textDecorationColor: 'var(--mustard-dossier)',
                    textDecorationThickness: '4px',
                    textUnderlineOffset: '8px',
                  }}
                >
                  CRACKED.
                </span>
              </div>
            </div>

            <p
              className="mt-6 text-base leading-relaxed max-w-[65ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              A refused charter in 1717. A military takeover in 1985. Three centuries of an
              India that never was. Walk the beats. Every era has a file. Every file has a scar.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={scrollTo1717}
                className="font-mono uppercase text-[11px] tracking-[0.18em] px-6 py-3 border"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                JUMP TO 1717 →
              </button>
              <button
                onClick={scrollToEraContent}
                className="font-mono uppercase text-[11px] tracking-[0.18em] px-6 py-3 border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--bone-text)',
                }}
              >
                START FROM 1717
              </button>
            </div>
          </div>

          {/* RIGHT — vertical fracture ribbon */}
          <div className="hidden lg:flex col-span-5 justify-center">
            <div className="relative h-[500px] w-[200px] flex flex-col justify-between items-center">
              {/* Central vertical line */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px"
                style={{ backgroundColor: 'var(--navy-signal)' }}
              />

              {/* Mustard highlight at 1717 (the refusal, top of the timeline) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-1 h-10"
                style={{ top: '0px', backgroundColor: 'var(--mustard-dossier)' }}
              />
              {/* Mustard highlight at 1985 (army takeover, ~87% down) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-1 h-10"
                style={{ top: '420px', backgroundColor: 'var(--mustard-dossier)' }}
              />

              {/* Year notches — 1717 and 1985 are the two pivots, rest are context */}
              {[
                { year: '1717', pct: 0, pivot: true },
                { year: '1918', pct: 20, pivot: false },
                { year: '1947', pct: 35, pivot: false },
                { year: '1975', pct: 55, pivot: false },
                { year: '1985', pct: 87, pivot: true },
                { year: '2025', pct: 100, pivot: false },
              ].map(({ year, pct, pivot }) => (
                <div
                  key={year}
                  className="absolute flex items-center gap-2"
                  style={{ top: `${(pct / 100) * 480}px`, left: '50%' }}
                >
                  <div
                    className="w-4 h-px"
                    style={{ backgroundColor: 'var(--navy-signal)' }}
                  />
                  <span
                    className="font-mono uppercase text-[10px] tracking-[0.18em] whitespace-nowrap"
                    style={{ color: pivot ? 'var(--mustard-dossier)' : 'var(--shadow-text)' }}
                  >
                    {year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Era Navigation Tab Bar ─────────────────────────────── */}
      <section
        className="py-6 border-y"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['SELECT AN ERA', 'TAP TO EXPAND']} className="mb-4" />
          <div className="flex items-start gap-2 flex-wrap">
            {ERAS.map((era) => {
              const isActive = activeEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => {
                    setActiveEra(era.id);
                    eraContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    'flex flex-col items-start px-4 py-3 border-t-[3px] transition-colors',
                    isActive ? 'border-t-[var(--mustard-dossier)]' : 'border-t-transparent'
                  )}
                  style={{
                    color: isActive ? 'var(--bone-text)' : 'var(--shadow-text)',
                  }}
                >
                  <span className="font-display text-sm leading-tight">
                    {era.name}
                    {era.devanagari && (
                      <span
                        className="ml-1 text-xs"
                        style={{
                          fontFamily: 'var(--font-devanagari)',
                          color: 'var(--powder-signal)',
                        }}
                      >
                        {era.devanagari}
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.15em] mt-0.5"
                    style={{ color: isActive ? 'var(--steel-text)' : 'var(--shadow-text)' }}
                  >
                    {era.years}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Active Era Content Block ───────────────────────────── */}
      <section
        ref={eraContentRef}
        className="py-24 border-t relative"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8">
          {/* LEFT — era header (sticky-ish) */}
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <EyebrowLabel
              segments={[
                activeEraObj.years,
                `${activeEraObj.eventIds.length} KEY EVENTS`,
              ]}
            />

            <div
              className="mt-4 font-display leading-[0.85] break-words"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--bone-text)' }}
            >
              {activeEraObj.name}
            </div>

            {activeEraObj.devanagari && (
              <div
                className="mt-2 text-4xl"
                style={{
                  fontFamily: 'var(--font-devanagari)',
                  color: 'var(--powder-signal)',
                }}
              >
                {activeEraObj.devanagari}
              </div>
            )}

            <div
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              {activeEraObj.years}
            </div>

            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: 'var(--steel-text)' }}
            >
              {activeEraObj.blurb}
            </p>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                `${activeEraObj.eventIds.length} EVENTS`,
                `${activeEraObj.operatives} OPERATIVES`,
                `${activeEraObj.dispatches} DISPATCHES`,
              ].map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1 border"
                  style={{
                    borderColor: 'var(--navy-signal)',
                    color: 'var(--shadow-text)',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Era ambient image */}
            {eraAmbientImage && (
              <div className="relative mt-6 w-full aspect-video overflow-hidden border"
                style={{ borderColor: 'var(--navy-signal)' }}>
                <Image
                  src={eraAmbientImage}
                  alt={`${activeEraObj.name} era image`}
                  fill
                  className="object-cover"
                  onError={() => {/* graceful silent fail */}}
                />
              </div>
            )}
          </div>

          {/* RIGHT — event list */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-0">
            {activeEvents.length === 0 && (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--shadow-text)' }}>
                NO DECLASSIFIED EVENTS ON FILE FOR THIS ERA.
              </p>
            )}
            {activeEvents.map((event) => {
              const isTurningPoint =
                event.metadata?.significance === 5 ||
                event.id === 9;

              return (
                <div
                  key={event.id}
                  className="border-t pt-6 pb-6 flex items-start gap-4"
                  style={{ borderColor: 'var(--navy-signal)' }}
                >
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3">
                      <div
                        className="font-mono uppercase text-[11px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {event.date.original}
                      </div>
                      {isTurningPoint && (
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-0.5"
                          style={{
                            backgroundColor: 'var(--redaction)',
                            color: '#fff',
                          }}
                        >
                          TURNING POINT
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-display text-2xl mt-2 leading-tight"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {event.title}
                    </h3>

                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: 'var(--steel-text)' }}
                    >
                      {event.description ?? 'No declassified summary on file.'}
                    </p>

                    {/* Connected tags */}
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {(event.metadata?.locations ?? ['INDRAPUR HQ']).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono uppercase text-[10px] tracking-[0.18em]"
                          style={{ color: 'var(--mustard-dossier)' }}
                        >
                          CONNECTS TO: {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {event.media?.image && (
                    <div className="relative w-40 h-24 flex-shrink-0 border overflow-hidden"
                      style={{ borderColor: 'var(--navy-signal)' }}>
                      <Image
                        src={event.media.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Three-Track Chronology Ledger ──────────────────────── */}
      <section
        ref={beatStripRef}
        className="py-24 border-t overflow-x-auto"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['THREE LEDGERS', 'POLITICAL · CHARACTER · TECHNOLOGY', '1717 → 2025']}
          />

          <div
            className="mt-4 font-display leading-[0.9]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            THE LEDGERS.
          </div>

          <p
            className="mt-4 max-w-[65ch] text-sm leading-relaxed"
            style={{ color: 'var(--steel-text)' }}
          >
            Three parallel records. Political acts on top — the decisions made
            in rooms the public never entered. Character beats in the middle —
            when the people who live in these pages drew breath, or lost it.
            Technology underneath — the machines that outlived both. Mustard
            bars mark the three moments when the whole ledger jolted.
          </p>

          {/* The three-track grid.
              Track positions: 90 / 270 / 450 (180px spacing).
              Container height 540 to fit the 4-slot label staircase
              (labels can extend ~76px above the dot and ~84px below). */}
          <div
            className="relative mt-16"
            style={{ minWidth: '1000px' }}
          >
            <div className="flex">
              {/* Label column */}
              <div className="flex-shrink-0 w-32 pr-4 relative" style={{ height: '540px' }}>
                <div
                  className="absolute right-4 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ top: '86px', color: 'var(--shadow-text)' }}
                >
                  POLITICAL
                </div>
                <div
                  className="absolute right-4 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ top: '266px', color: 'var(--shadow-text)' }}
                >
                  CHARACTER
                </div>
                <div
                  className="absolute right-4 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ top: '446px', color: 'var(--shadow-text)' }}
                >
                  TECHNOLOGY
                </div>
              </div>

              {/* Track content area */}
              <div className="relative flex-1" style={{ height: '540px' }}>
                {/* Turning point vertical bars — span all three tracks */}
                {TURNING_YEARS.map((year) => (
                  <div
                    key={`bar-${year}`}
                    className="absolute top-6 bottom-6 w-px pointer-events-none"
                    style={{
                      left: `${yearToPct(year)}%`,
                      backgroundColor: 'var(--mustard-dossier)',
                      opacity: 0.35,
                    }}
                  />
                ))}
                {/* Turning point year labels at top */}
                {TURNING_YEARS.map((year) => (
                  <span
                    key={`turnlabel-${year}`}
                    className="absolute -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.18em] whitespace-nowrap"
                    style={{
                      top: '-8px',
                      left: `${yearToPct(year)}%`,
                      color: 'var(--mustard-dossier)',
                    }}
                  >
                    {year}
                  </span>
                ))}

                {/* Track lines */}
                <div
                  className="absolute left-0 right-0 h-px"
                  style={{ top: '90px', backgroundColor: 'var(--navy-signal)' }}
                />
                <div
                  className="absolute left-0 right-0 h-px"
                  style={{ top: '270px', backgroundColor: 'var(--navy-signal)' }}
                />
                <div
                  className="absolute left-0 right-0 h-px"
                  style={{ top: '450px', backgroundColor: 'var(--navy-signal)' }}
                />

                {/* POLITICAL events — slot = i % 4 cycles
                    [below-near, above-near, below-far, above-far] */}
                {POLITICAL_TRACK.map((ev, i) => (
                  <TrackMarker
                    key={`pol-${ev.year}-${ev.label}`}
                    ev={ev}
                    trackTop={90}
                    slot={(i % 4) as LabelSlot}
                  />
                ))}
                {/* CHARACTER events */}
                {CHARACTER_TRACK.map((ev, i) => (
                  <TrackMarker
                    key={`char-${ev.year}-${ev.label}`}
                    ev={ev}
                    trackTop={270}
                    slot={(i % 4) as LabelSlot}
                  />
                ))}
                {/* TECHNOLOGY events */}
                {TECH_TRACK.map((ev, i) => (
                  <TrackMarker
                    key={`tech-${ev.year}-${ev.label}`}
                    ev={ev}
                    trackTop={450}
                    slot={(i % 4) as LabelSlot}
                  />
                ))}
              </div>
            </div>
          </div>

          <p
            className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--shadow-text)' }}
          >
            MUSTARD BARS = TURNING POINTS ▪ 1717 REFUSAL ▪ 1985 ARMY DECREE ▪ 2025 FRACTURE
          </p>
        </div>
      </section>

      {/* ── Section 6: Connected Files Rail (operatives) ──────────────────── */}
      <section
        id="who-was-watching"
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={[
              'FILES FROM THIS ERA',
              activeEraObj.name,
              `${characterItems.length} CONNECTED OPERATIVES`,
            ]}
          />

          <div
            className="mt-6 font-display"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            WHO WAS WATCHING.
          </div>

          {/* Horizontal scroll rail — cards link DIRECTLY to /lore?item=<id>.
              The lore page handles the modal open via deep link, and its
              origin-aware close handler returns the user back to /timeline
              (this exact section) when they close the dossier. No more
              in-between modal — the lore page IS the dossier surface. */}
          <div
            className="flex gap-5 mt-8 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarColor: 'var(--navy-signal) transparent' }}
          >
            {characterItems.map((item) => {
              const cardSrc =
                item.media?.card ?? `https://picsum.photos/seed/${item.id}-card/450/600`;
              const isClassified = item.classification === 'classified';
              const isLocked = isClassified && !isAuthenticated;

              // Classified variant — silhouette + sign-in CTA, no face leak.
              if (isLocked) {
                return (
                  <Link
                    key={item.id}
                    href="/auth/signin?callbackUrl=/timeline%23who-was-watching"
                    aria-label={`${item.name} — classified. Sign in to unseal.`}
                    className="relative flex-shrink-0 snap-start border overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-dossier)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-deep)]"
                    style={{
                      width: '220px',
                      aspectRatio: '3 / 4',
                      backgroundColor: 'var(--obsidian-panel)',
                      borderColor: 'var(--mustard-dossier)',
                      borderLeftWidth: '4px',
                      borderLeftColor: 'var(--mustard-dossier)',
                    }}
                  >
                    <Image
                      src={cardSrc}
                      alt=""
                      fill
                      className="object-cover"
                      style={{
                        filter:
                          'grayscale(100%) brightness(0.18) contrast(1.3) blur(2px)',
                      }}
                      aria-hidden="true"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          `https://picsum.photos/seed/${item.id}-fallback/450/600`;
                      }}
                    />
                    {/* Navy/obsidian redaction wash */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 35%, rgba(11,39,66,0.55) 0%, rgba(15,20,25,0.92) 70%)',
                      }}
                    />
                    {/* Rotated dashed CLASSIFIED stamp */}
                    <div
                      className="absolute top-2 left-2 font-mono uppercase tracking-[0.22em] text-[8px] px-1.5 py-0.5 border border-dashed"
                      style={{
                        color: 'var(--mustard-dossier)',
                        borderColor: 'var(--mustard-dossier)',
                        transform: 'rotate(-4deg)',
                        backgroundColor: 'rgba(15,20,25,0.65)',
                      }}
                    >
                      CLASSIFIED
                    </div>
                    {/* Center redaction block */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
                      <div
                        className="font-mono uppercase tracking-[0.22em] text-[8px]"
                        style={{ color: 'var(--mustard-dossier)', opacity: 0.9 }}
                      >
                        CLEARANCE · LVL 5
                      </div>
                      <div
                        className="font-display leading-none"
                        style={{
                          fontSize: '1rem',
                          color: 'var(--bone-text)',
                          backgroundColor: 'var(--redaction)',
                          padding: '0.15rem 0.5rem',
                          letterSpacing: '0.1em',
                        }}
                      >
                        [REDACTED]
                      </div>
                      <div
                        className="font-mono uppercase tracking-[0.18em] text-[7px] max-w-[85%] leading-relaxed mt-0.5"
                        style={{ color: 'var(--powder-signal)' }}
                      >
                        IDENTITY WITHHELD
                      </div>
                    </div>
                    {/* Bottom strip — name placeholder + sign-in CTA */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2 text-left border-t"
                      style={{
                        borderColor: 'var(--mustard-dossier)',
                        backgroundColor:
                          'color-mix(in srgb, var(--obsidian-void) 85%, transparent)',
                      }}
                    >
                      <div
                        className="font-mono uppercase text-[11px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        ????????
                      </div>
                      <div
                        className="font-mono text-[8px] uppercase tracking-[0.18em] mt-1"
                        style={{ color: 'var(--mustard-dossier)' }}
                      >
                        SIGN IN TO UNSEAL &rarr;
                      </div>
                    </div>
                  </Link>
                );
              }

              // Declassified (or authenticated viewer) — direct deep link to /lore.
              return (
                <Link
                  key={item.id}
                  href={`/lore?item=${item.id}`}
                  aria-label={`Open dossier for ${item.name}`}
                  className="relative flex-shrink-0 snap-start border overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-dossier)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-deep)]"
                  style={{
                    width: '220px',
                    aspectRatio: '3 / 4',
                    backgroundColor: 'var(--obsidian-panel)',
                    borderColor: 'var(--navy-signal)',
                    borderLeftWidth: '4px',
                    borderLeftColor: isClassified
                      ? 'var(--redaction)'
                      : 'var(--mustard-dossier)',
                  }}
                >
                  <Image
                    src={cardSrc}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        `https://picsum.photos/seed/${item.id}-fallback/450/600`;
                    }}
                  />

                  {/* Tier classification stamp — top-right corner */}
                  <div
                    className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border"
                    style={{
                      borderColor: isClassified
                        ? 'var(--redaction)'
                        : 'var(--mustard-dossier)',
                      color: isClassified
                        ? 'var(--redaction)'
                        : 'var(--mustard-dossier)',
                      backgroundColor:
                        'color-mix(in srgb, var(--obsidian-void) 72%, transparent)',
                    }}
                  >
                    {isClassified ? 'S2 ▪ CLASSIFIED' : 'S1 ▪ DECLASSIFIED'}
                  </div>

                  {/* Devanagari watermark overlay */}
                  {item.nameDevanagari && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                      style={{
                        fontFamily: 'var(--font-devanagari)',
                        fontSize: '5rem',
                        color: 'var(--bone-text)',
                        opacity: 0.22,
                        lineHeight: 1,
                      }}
                    >
                      {item.nameDevanagari}
                    </div>
                  )}

                  {/* Name bar at bottom + open-file hint on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2 text-left"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--obsidian-void) 80%, transparent)' }}
                  >
                    <div
                      className="font-mono uppercase text-[11px] tracking-[0.18em]"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {item.name}
                    </div>
                    <div
                      className="font-mono text-[9px] uppercase tracking-[0.15em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      OPEN FILE &rarr;
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 7: Reading Rhythm ──────────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['READING RHYTHM', 'WHERE TO START IN THE NOVEL']} />

          <div
            className="mt-4 font-display"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            FIND YOUR ENTRY POINT.
          </div>

          <div className="grid grid-cols-12 gap-6 mt-10">
            {/* PATH A — Historian's → /timeline (the chronology itself).
                Wider featured card (6 cols) — Path B and Path C share the
                remaining 6 cols equally (3 each). */}
            <div
              className="col-span-12 lg:col-span-6 border p-8 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <EyebrowLabel segments={['PATH A', 'FOR HISTORIANS']} />
              <div
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--bone-text)' }}
              >
                THE HISTORIAN&apos;S PATH
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
                Start with the chronology. Walk three centuries from the 1717 refusal to
                the 2025 fracture — every charter, every coup, every quiet decision the
                public never saw. Build the world before you meet the people in it.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                308 YEARS ▪ 9 ERAS ▪ ~30 MIN BRIEF
              </div>
              <Link
                href="/timeline"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                WALK THE TIMELINE →
              </Link>
            </div>

            {/* PATH B — Thriller's → /novel */}
            <div
              className="col-span-12 lg:col-span-3 sm:col-span-6 border p-8 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <EyebrowLabel segments={['PATH B', 'FOR THRILLER READERS']} />
              <div
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--bone-text)' }}
              >
                THE THRILLER&apos;S PATH
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
                Open the file cold. The case unfolds the way Kahaan finds it — one lead,
                one dead end, one secret that refuses to stay sealed. No prep. No spoilers.
                Just the dossier in your hand and the floor giving way underneath.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                374 PAGES ▪ ~18 HOURS
              </div>
              <Link
                href="/novel"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--bone-text)',
                  color: 'var(--bone-text)',
                }}
              >
                OPEN THE NOVEL →
              </Link>
            </div>

            {/* PATH C — Archivist's → /lore */}
            <div
              className="col-span-12 lg:col-span-3 sm:col-span-6 border p-8 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <EyebrowLabel segments={['PATH C', 'FOR ARCHIVISTS']} />
              <div
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--bone-text)' }}
              >
                THE ARCHIVIST&apos;S PATH
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
                Pull every file before you read a single page. Operatives, factions,
                locations, classified tech — the whole dossier laid open. Recommended for
                completionists, returning readers, and anyone who reads the appendix first.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                21 FILES ▪ ~45 MIN BROWSE
              </div>
              <Link
                href="/lore"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--bone-text)',
                  color: 'var(--bone-text)',
                }}
              >
                ENTER THE ARCHIVE →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Closing CTA ─────────────────────────────────────────── */}
      <section
        className="py-16 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7">
            <EyebrowLabel segments={['315 YEARS', '480 PAGES', 'ONE CASE']} />
            <div
              className="mt-4 font-display leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: 'var(--bone-text)' }}
            >
              UNSEAL THE CHRONICLE.
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 lg:items-end">
            <Link
              href="/novel"
              className="font-mono uppercase text-[11px] tracking-[0.18em] px-8 py-4 border text-center transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--mustard-dossier)',
                borderColor: 'var(--mustard-dossier)',
                color: 'var(--obsidian-void)',
              }}
            >
              BUY THE NOVEL →
            </Link>
            <Link
              href="/lore"
              className="font-mono uppercase text-[11px] tracking-[0.18em] px-8 py-4 border text-center transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--navy-signal)',
                color: 'var(--bone-text)',
              }}
            >
              BACK TO LORE ARCHIVE
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
