'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
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
    name: 'JAAL YUG',
    devanagari: 'जाल युग',
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

// ─── Full chronology beats (15 nodes) ────────────────────────────────────────

const CHRONO_BEATS = [
  { year: '1717', label: 'TREATY', turning: false },
  { year: '1750', label: 'GUILDS', turning: false },
  { year: '1790', label: 'REFORM', turning: false },
  { year: '1820', label: 'PRESS', turning: false },
  { year: '1850', label: 'DIVERGENCE', turning: false },
  { year: '1875', label: 'UNIONS', turning: false },
  { year: '1905', label: 'CONCORD', turning: false },
  { year: '1930', label: 'REPUBLIC', turning: false },
  { year: '1960', label: 'REDACTION', turning: true },
  { year: '1975', label: 'CLEAN CITY', turning: false },
  { year: '1980', label: 'BHOOMI', turning: false },
  { year: '1985', label: 'BOMBINGS', turning: true },
  { year: '2000', label: 'CASE 0042', turning: false },
  { year: '2015', label: 'UNSEALING', turning: false },
  { year: '2022', label: 'THE CRACK', turning: true },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function TimelineContent() {
  const [activeEra, setActiveEra] = useState<string>('mesh-era');
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

  function scrollToDivergenceEra() {
    setActiveEra('divergence');
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
              segments={['CHRONOLOGY', '1717 → 2032', '315 YEARS', 'POINT OF DIVERGENCE INSIDE']}
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
              A reformist treaty in 1717. A point of divergence in 1850. Three centuries of an
              India that never was. Walk the beats. Every era has a file. Every file has a scar.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={scrollToDivergenceEra}
                className="font-mono uppercase text-[11px] tracking-[0.18em] px-6 py-3 border"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                JUMP TO POINT OF DIVERGENCE →
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

              {/* Mustard highlight at 1850 (~30% down = top-[150px]) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-1 h-10"
                style={{ top: '150px', backgroundColor: 'var(--mustard-dossier)' }}
              />

              {/* Diverging paths below 1850 */}
              <div
                className="absolute"
                style={{
                  top: '190px',
                  left: 'calc(50% - 1px)',
                  width: '1px',
                  height: '60px',
                  background: `linear-gradient(to bottom-right, var(--navy-signal), transparent)`,
                  transform: 'rotate(-12deg)',
                  transformOrigin: 'top center',
                }}
              />
              <div
                className="absolute"
                style={{
                  top: '190px',
                  left: 'calc(50% - 1px)',
                  width: '1px',
                  height: '60px',
                  background: `linear-gradient(to bottom-left, var(--navy-signal), transparent)`,
                  transform: 'rotate(12deg)',
                  transformOrigin: 'top center',
                }}
              />

              {/* Year notches */}
              {[
                { year: '1717', pct: 0 },
                { year: '1850', pct: 30 },
                { year: '1910', pct: 50 },
                { year: '1975', pct: 70 },
                { year: '1985', pct: 80 },
                { year: '2022', pct: 100 },
              ].map(({ year, pct }) => (
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
                    style={{ color: year === '1850' ? 'var(--mustard-dossier)' : 'var(--shadow-text)' }}
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
              className="mt-4 font-display leading-[0.85]"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', color: 'var(--bone-text)' }}
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

      {/* ── Section 4: Point of Divergence Callout ────────────────────────── */}
      <section
        className="py-24 border-t relative overflow-hidden"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        {/* Fracture overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--redaction) 0 1px, transparent 1px 20px)',
            opacity: 0.025,
          }}
        />

        {/* Diagonal mustard dashed line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '1px',
              height: '150%',
              background: 'repeating-linear-gradient(to bottom, var(--mustard-dossier) 0 8px, transparent 8px 16px)',
              transform: 'rotate(35deg)',
              transformOrigin: 'top left',
              opacity: 0.3,
            }}
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-8 relative z-10 grid grid-cols-12 gap-8 items-center">
          {/* LEFT — rotated year */}
          <div className="col-span-12 lg:col-span-4 flex flex-col items-start">
            <div
              className="font-display leading-none select-none"
              style={{
                fontSize: '200px',
                color: 'var(--mustard-dossier)',
                transform: 'rotate(-4deg)',
                transformOrigin: 'bottom left',
                lineHeight: 1,
              }}
            >
              1850
            </div>
            <div
              className="mt-2 text-[2rem]"
              style={{
                fontFamily: 'var(--font-devanagari)',
                color: 'var(--powder-signal)',
              }}
            >
              विभाजन
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="col-span-12 lg:col-span-8">
            <EyebrowLabel
              segments={['POINT OF DIVERGENCE', 'WHERE THE TIMELINE FORKED']}
            />

            <div
              className="mt-4 font-display leading-[0.9]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--bone-text)' }}
            >
              THE FRACTURE POINT.
            </div>

            <p
              className="mt-6 text-base leading-relaxed max-w-[65ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              In the year the British Crown reached for formal authority, the subcontinent reached
              back. The 1850 Reform Accord was drafted and signed within 43 days. What followed was
              not the empire history records. It was the regime that built itself in its absence.
            </p>

            <Link
              href="/lore"
              className="inline-block mt-6 font-mono uppercase text-[11px] tracking-[0.18em] px-6 py-3 border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--bone-text)',
                color: 'var(--bone-text)',
              }}
            >
              READ THE DIVERGENCE DOSSIER →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 5: Full Chronology Beat Strip ─────────────────────────── */}
      <section
        ref={beatStripRef}
        className="py-24 border-t overflow-x-auto"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['FULL CHRONOLOGY', 'EVERY BEAT', '315 YEARS COMPRESSED']}
          />

          <div className="relative mt-12 pb-8" style={{ minWidth: '900px' }}>
            {/* Horizontal connector line */}
            <div
              className="absolute top-[calc(50%+4px)] left-0 right-0 h-px"
              style={{ backgroundColor: 'var(--navy-signal)' }}
            />

            <div className="relative flex justify-between items-center gap-0">
              {CHRONO_BEATS.map((beat) => (
                <div key={beat.year} className="flex flex-col items-center gap-2 relative z-10">
                  {/* Year label above */}
                  <span
                    className="font-mono text-[10px] tracking-[0.18em] whitespace-nowrap"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    {beat.year}
                  </span>

                  {/* Node dot */}
                  <div
                    className={cn('rounded-full', beat.turning ? 'w-4 h-4' : 'w-3 h-3')}
                    style={{
                      backgroundColor: 'var(--mustard-dossier)',
                      boxShadow: beat.turning
                        ? '0 0 0 4px color-mix(in srgb, var(--mustard-dossier) 25%, transparent)'
                        : 'none',
                    }}
                  />

                  {/* Word label below */}
                  <span
                    className="font-display text-[10px] uppercase tracking-[0.1em] whitespace-nowrap"
                    style={{
                      color: beat.turning ? 'var(--mustard-dossier)' : 'var(--bone-text)',
                    }}
                  >
                    {beat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--shadow-text)' }}
          >
            DRAG TO SCRUB ▪ CLICK A NODE TO JUMP
          </p>
        </div>
      </section>

      {/* ── Section 6: Connected Files Rail (operatives) ──────────────────── */}
      <section
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

          {/* Horizontal scroll rail */}
          <div
            className="flex gap-5 mt-8 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarColor: 'var(--navy-signal) transparent' }}
          >
            {characterItems.map((item) => {
              const cardSrc =
                item.media?.card ?? `https://picsum.photos/seed/${item.id}-card/450/600`;

              return (
                <div
                  key={item.id}
                  className="relative flex-shrink-0 snap-start border overflow-hidden"
                  style={{
                    width: '220px',
                    aspectRatio: '3 / 4',
                    backgroundColor: 'var(--obsidian-panel)',
                    borderColor: 'var(--navy-signal)',
                    borderLeftWidth: '4px',
                    borderLeftColor: 'var(--mustard-dossier)',
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

                  {/* Name bar at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--obsidian-void) 80%, transparent)' }}
                  >
                    <div
                      className="font-mono uppercase text-[11px] tracking-[0.18em]"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {item.name}
                    </div>
                  </div>
                </div>
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
            {/* PATH A — Historian's */}
            <div
              className="col-span-12 lg:col-span-5 border p-8 flex flex-col gap-4"
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
                Read chronologically with timeline context open in a second tab. Recommended for
                world-builders and first-time readers of alternate history.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                ~480 PAGES ▪ ~24 HOURS
              </div>
              <Link
                href="/novel"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                CHOOSE THIS PATH →
              </Link>
            </div>

            {/* PATH B — Thriller's */}
            <div
              className="col-span-12 lg:col-span-3 border p-8 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <EyebrowLabel segments={['PATH B', 'FOR THRILLERS']} />
              <div
                className="font-display leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--bone-text)' }}
              >
                THE THRILLER&apos;S PATH
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
                Read straight through. Discover the timeline as Kahaan does — one revelation at a
                time.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                ~480 PAGES ▪ ~18 HOURS
              </div>
              <Link
                href="/novel"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--bone-text)',
                  color: 'var(--bone-text)',
                }}
              >
                CHOOSE THIS PATH →
              </Link>
            </div>

            {/* PATH C — Archivist's */}
            <div
              className="col-span-12 lg:col-span-4 border p-8 flex flex-col gap-4"
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
                Read the timeline first, then the novel. Recommended for returning readers and lore
                enthusiasts.
              </p>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mt-auto"
                style={{ color: 'var(--shadow-text)' }}
              >
                ~1 DAY PREP ▪ ~480 PAGES
              </div>
              <Link
                href="/novel"
                className="inline-block font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-2.5 text-center border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--bone-text)',
                  color: 'var(--bone-text)',
                }}
              >
                CHOOSE THIS PATH →
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
