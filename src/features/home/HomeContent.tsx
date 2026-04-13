'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import loreRaw from '@/content/data/lore-items.json';
import timelineRaw from '@/content/data/timeline.json';
import dispatchesRaw from '@/content/data/dispatches.json';

// ---------------------------------------------------------------------------
// Types inferred from JSON shape
// ---------------------------------------------------------------------------

interface LoreItem {
  id: string;
  name: string;
  nameDevanagari?: string;
  category: string;
  classification: string;
  subtype?: string;
  media: { card: string; banner: string };
  traits?: string[];
  featured?: boolean;
  sortOrder?: number;
}

interface TimelineEvent {
  id: number;
  title: string;
  date: { start_year: number; end_year: number; is_range: boolean };
}

interface Dispatch {
  id: string;
  topic: string;
  hook: string;
  caption: string;
  scheduledDate: string;
  storyAngle: string;
  image: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Data wiring
// ---------------------------------------------------------------------------

const loreItems: LoreItem[] = loreRaw.lore as LoreItem[];
const timelineEvents: TimelineEvent[] = timelineRaw.events as TimelineEvent[];
const dispatches: Dispatch[] = dispatchesRaw.dispatches as Dispatch[];

const archiveIds = ['kahaan', 'rudra', 'arshi', 'hana', 'pratap', 'indrapur'];
const archiveItems = archiveIds
  .map((id) => loreItems.find((item) => item.id === id))
  .filter((item): item is LoreItem => Boolean(item));

const archiveLevels: Record<string, string> = {
  kahaan: 'LVL 4',
  rudra: 'LVL 2',
  arshi: 'LVL 1',
  hana: 'LVL 3',
  pratap: 'LVL 1',
  indrapur: 'LVL 5',
};

// Use the first 6 timeline events for the beat strip
const beatEvents = timelineEvents.slice(0, 6);

// Use 3 dispatches with real image paths
const previewDispatches = dispatches
  .filter((d) =>
    [
      'BHV-20260515-001',
      'BHV-20260512-001',
      'BHV-20260509-001',
    ].includes(d.id)
  )
  .slice(0, 3);

// ---------------------------------------------------------------------------
// Section animation wrapper
// ---------------------------------------------------------------------------

function FadeInSection({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// HomeContent
// ---------------------------------------------------------------------------

export function HomeContent() {
  return (
    <div className="relative">
      {/* ================================================================
          Section 1 — Asymmetric Hero
      ================================================================ */}
      <section
        className="relative overflow-hidden bg-[var(--obsidian-void)] min-h-[100dvh]"
        aria-label="Hero"
      >
        {/* Surveillance grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--navy-signal) 1px, transparent 1px), linear-gradient(90deg, var(--navy-signal) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.03,
          }}
        />

        {/* Giant Devanagari ghost */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute top-0 left-[-4rem] z-0 flex items-center"
          style={{
            height: '100%',
            fontSize: 'clamp(10rem, 30vw, 22rem)',
            lineHeight: 1,
            color: 'var(--powder-signal)',
            opacity: 0.1,
            fontFamily: 'var(--font-devanagari)',
            whiteSpace: 'nowrap',
          }}
        >
          भारतवर्ष
        </div>

        {/* 12-col content grid */}
        <div
          className="relative z-10 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 min-h-[100dvh] items-center py-24"
        >
          {/* LEFT — content */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-0">
            <EyebrowLabel
              segments={[
                'DOSSIER',
                'CASE FILE #0042',
                'INDRAPUR HQ',
                'LEVEL 7 CLEARANCE',
              ]}
            />

            <h1
              className="font-display mt-6"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                lineHeight: 0.9,
                color: 'var(--bone-text)',
              }}
            >
              A MILITARY PRINCE.
              <br />
              A BURIED CASE.
              <br />
              A NATION ABOUT TO
              <br />
              <span style={{ color: 'var(--bone-text)' }}>UN</span>
              <span style={{ color: 'var(--mustard-dossier)' }}>SEAL.</span>
            </h1>

            <p
              className="font-serif italic mt-6"
              style={{
                color: 'var(--powder-signal)',
                fontSize: '1.25rem',
                maxWidth: '50ch',
              }}
            >
              &ldquo;Every dossier begins with a name you were never meant to
              read.&rdquo;
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/lore">
                <button
                  className="inline-flex items-center gap-2 font-mono uppercase transition-colors"
                  style={{
                    background: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'var(--mustard-hot)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'var(--mustard-dossier)')
                  }
                >
                  ENTER THE DOSSIER →
                </button>
              </Link>
              <Link href="/novel">
                <button
                  className="font-mono uppercase transition-colors"
                  style={{
                    border: '1px solid var(--powder-signal)',
                    color: 'var(--bone-text)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'var(--obsidian-panel)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'transparent')
                  }
                >
                  READ THE NOVEL
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT — character portrait */}
          <div className="hidden md:block col-span-5 relative min-h-[70vh]">
            <Image
              src="/images/characters/kahaan-banner.webp"
              alt="Kahaan — Bharatsena Captain"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Gradient fade left */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, var(--obsidian-void), transparent)',
              }}
            />
            {/* Ambient mustard glow */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none rounded-full blur-3xl"
              style={{
                top: '25%',
                right: '25%',
                width: '16rem',
                height: '16rem',
                background: 'rgba(241, 194, 50, 0.10)',
              }}
            />
          </div>
        </div>

        {/* Dispatch ticker strip */}
        <div
          className="relative z-10 border-t border-b overflow-hidden py-3"
          style={{
            borderColor: 'var(--navy-signal)',
            background: 'rgba(26, 31, 46, 0.8)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="flex gap-6 whitespace-nowrap"
            style={{ animation: 'marquee 40s linear infinite' }}
          >
            {[0, 1].map((dupe) => (
              <span
                key={dupe}
                className="flex gap-6 items-center font-mono uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  color: 'var(--shadow-text)',
                }}
              >
                <span>INCOMING</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>▪</span>
                <span>INDRAPUR CURFEW EXTENDED</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>▪</span>
                <span>MAGNA CARTA ANNIVERSARY</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>▪</span>
                <span>SURVEILLANCE MESH UPDATE</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>▪</span>
                <span>AKAKPEN BORDER INCIDENT</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>▪</span>
                <span>CASE #0042 DECLASSIFIED</span>
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)', marginRight: '1.5rem' }}>▪</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Section 2 — Choose Your Path
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t"
        style={{
          background: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['GUIDED ENTRY', 'THREE PATHS', 'PICK ONE']} />
          <h2
            className="font-display mt-4 mb-12"
            style={{
              fontSize: '56px',
              lineHeight: 1,
              color: 'var(--bone-text)',
            }}
          >
            HOW DO YOU WANT TO ENTER THE CHRONICLE?
          </h2>

          <div className="grid grid-cols-12 gap-8">
            {/* Path 01 — Featured tall card */}
            <div
              className="col-span-12 md:col-span-5 flex flex-col relative border-t p-8"
              style={{
                background: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
                minHeight: '500px',
              }}
            >
              {/* Corner numeral */}
              <span
                aria-hidden="true"
                className="absolute top-8 right-8 font-display"
                style={{ fontSize: '4rem', color: 'var(--mustard-dossier)' }}
              >
                01
              </span>

              <EyebrowLabel
                segments={['PATH 01', 'FOR NEW READERS']}
                className="mb-4"
              />
              <h3
                className="font-display"
                style={{ fontSize: '3rem', color: 'var(--bone-text)', marginBottom: '1rem' }}
              >
                READ THE NOVEL
              </h3>
              <p style={{ color: 'var(--steel-text)' }}>
                Begin with the book. 480 pages. A locked case, a fractured
                nation, a prince who was never meant to rule.
              </p>

              <Image
                src="/images/novel-cover.png"
                alt="Bharatvarsh novel cover"
                width={200}
                height={300}
                className="mt-6 shadow-2xl"
                style={{ transform: 'rotate(-4deg)', boxShadow: '0 24px 48px rgba(241,194,50,0.20)' }}
              />

              <div className="flex-1" />

              <Link href="/novel" className="mt-8 self-start">
                <button
                  className="inline-flex items-center gap-2 font-mono uppercase"
                  style={{
                    background: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                  }}
                >
                  BUY NOW →
                </button>
              </Link>
            </div>

            {/* Right stack: paths 02 + 03 */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-8">
              {/* Path 02 */}
              <div
                className="relative border-t p-8"
                style={{
                  background: 'var(--obsidian-panel)',
                  borderColor: 'var(--navy-signal)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-8 right-8 font-display"
                  style={{ fontSize: '4rem', color: 'var(--mustard-dossier)' }}
                >
                  02
                </span>
                <EyebrowLabel segments={['PATH 02', 'FOR WORLD-BUILDERS']} />
                <h3
                  className="font-display mt-2 mb-3"
                  style={{ fontSize: '3rem', color: 'var(--bone-text)' }}
                >
                  EXPLORE THE WORLD
                </h3>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <p style={{ color: 'var(--steel-text)' }}>
                      Six operatives. Two factions. A timeline that forks in 1717.
                      Walk the map, the dossiers, the redacted files.
                    </p>
                    <Link href="/lore" className="mt-6 inline-block">
                      <button
                        className="font-mono uppercase"
                        style={{
                          border: '1px solid var(--powder-signal)',
                          color: 'var(--bone-text)',
                          padding: '0.5rem 1.25rem',
                          fontSize: '11px',
                          letterSpacing: '0.18em',
                          background: 'transparent',
                        }}
                      >
                        OPEN THE LORE →
                      </button>
                    </Link>
                  </div>
                  {/* 3 character thumbnails */}
                  <div className="flex gap-2 flex-shrink-0">
                    {['kahaan', 'rudra', 'arshi'].map((id) => {
                      const item = loreItems.find((i) => i.id === id);
                      if (!item) return null;
                      return (
                        <Image
                          key={id}
                          src={item.media.card}
                          alt={item.name}
                          width={60}
                          height={80}
                          className="object-cover"
                          style={{ width: 60, height: 80 }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Path 03 */}
              <div
                className="relative border-t p-8"
                style={{
                  background: 'var(--obsidian-panel)',
                  borderColor: 'var(--navy-signal)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-8 right-8 font-display"
                  style={{ fontSize: '4rem', color: 'var(--mustard-dossier)' }}
                >
                  03
                </span>
                <EyebrowLabel segments={['PATH 03', 'FOR THE CURIOUS']} />
                <h3
                  className="font-display mt-2 mb-3"
                  style={{ fontSize: '3rem', color: 'var(--bone-text)' }}
                >
                  MEET BHOOMI
                </h3>
                <p style={{ color: 'var(--steel-text)' }}>
                  Ask the in-world AI anything. Bhoomi speaks for the regime,
                  the resistance, and everything in between.
                </p>

                {/* Terminal preview */}
                <div
                  className="mt-4 flex items-center px-4 py-3"
                  style={{
                    background: 'var(--obsidian-deep)',
                    maxWidth: '320px',
                  }}
                >
                  <span
                    className="font-mono animate-pulse"
                    style={{
                      color: 'var(--mustard-dossier)',
                      fontSize: '14px',
                    }}
                  >
                    _
                  </span>
                </div>

                <Link href="/bhoomi" className="mt-6 inline-block">
                  <button
                    className="font-mono uppercase"
                    style={{
                      border: '1px solid var(--powder-signal)',
                      color: 'var(--bone-text)',
                      padding: '0.5rem 1.25rem',
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      background: 'transparent',
                    }}
                  >
                    START THE INTERROGATION →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* ================================================================
          Section 3 — Featured Kahaan Dossier Spotlight
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t relative overflow-hidden"
        style={{
          background: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        {/* Ghost Devanagari */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute top-0 right-8 z-0 flex items-center justify-end"
          style={{
            height: '100%',
            fontSize: 'clamp(8rem, 20vw, 18rem)',
            lineHeight: 1,
            color: 'var(--powder-signal)',
            opacity: 0.08,
            fontFamily: 'var(--font-devanagari)',
          }}
        >
          कहान
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center">
          {/* LEFT — Kahaan banner */}
          <div className="col-span-12 md:col-span-7 relative overflow-hidden" style={{ minHeight: '560px' }}>
            <Image
              src="/images/characters/kahaan-banner.webp"
              alt="Kahaan"
              fill
              className="object-cover"
            />
            {/* Gradient fade right */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, var(--obsidian-deep), transparent 60%)',
              }}
            />
          </div>

          {/* RIGHT — dossier info */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            {/* Classified stamp */}
            <div
              className="self-start font-mono uppercase"
              style={{
                border: '1px dashed var(--mustard-dossier)',
                padding: '0.25rem 0.75rem',
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: 'var(--mustard-dossier)',
                transform: 'rotate(-4deg)',
                display: 'inline-block',
              }}
            >
              CLASSIFIED ▪ LVL 4
            </div>

            <EyebrowLabel
              segments={['FEATURED OPERATIVE', 'RECOMMENDED ENTRY POINT']}
            />

            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(4rem, 10vw, 7.5rem)',
                lineHeight: 0.9,
                color: 'var(--bone-text)',
                marginTop: '0.5rem',
              }}
            >
              KAHAAN
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-devanagari)',
                fontSize: '2.25rem',
                color: 'var(--powder-signal)',
              }}
            >
              कहान
            </p>

            <EyebrowLabel
              segments={['RANK: CAPTAIN', 'FACTION: BHARATSENA', 'STATUS: ACTIVE']}
              className="mt-2"
            />

            {/* Trait chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {['HUD MONOCLE', 'SCAR • RIGHT CHEEK', 'LEGACY HEIR'].map(
                (trait) => (
                  <span
                    key={trait}
                    className="font-mono uppercase"
                    style={{
                      background: 'var(--obsidian-panel)',
                      border: '1px solid var(--navy-signal)',
                      padding: '0.375rem 0.75rem',
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: 'var(--powder-signal)',
                    }}
                  >
                    {trait}
                  </span>
                )
              )}
            </div>

            <p
              className="font-serif italic mt-2"
              style={{ color: 'var(--powder-signal)', fontSize: '1.125rem' }}
            >
              &ldquo;The dossier on my father came with my uniform.&rdquo;
            </p>

            <Link
              href="/lore"
              className="font-mono uppercase mt-2 inline-block"
              style={{
                color: 'var(--mustard-dossier)',
                fontSize: '12px',
                letterSpacing: '0.18em',
              }}
            >
              READ THE FULL FILE →
            </Link>
          </div>
        </div>
      </FadeInSection>

      {/* ================================================================
          Section 4 — Walk the Archive horizontal rail
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t"
        style={{
          background: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={[
              'INTELLIGENCE ARCHIVE',
              'CHARACTERS · FACTIONS · LOCATIONS · TECH',
            ]}
          />

          {/* Headline + descriptor row */}
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8 mt-4">
            <h2
              className="font-display"
              style={{ fontSize: '3.75rem', color: 'var(--bone-text)', lineHeight: 1 }}
            >
              WALK THE ARCHIVE.
            </h2>
            <p
              style={{
                color: 'var(--steel-text)',
                maxWidth: '30ch',
                fontSize: '0.9rem',
              }}
            >
              Six operatives. Two factions. Four locations. Every file tagged,
              every face stamped.
            </p>
          </div>

          {/* Horizontal scrolling rail */}
          <div
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory"
            style={{ scrollbarColor: 'var(--navy-signal) transparent' }}
          >
            {archiveItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 relative overflow-hidden group"
                style={{
                  width: '280px',
                  background: 'var(--obsidian-panel)',
                  border: '1px solid var(--navy-signal)',
                  borderLeft: '4px solid var(--mustard-dossier)',
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Card image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={item.media.card}
                    alt={item.name}
                    width={280}
                    height={373}
                    className="w-full object-cover transition-transform duration-300 group-hover:-translate-y-1"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Devanagari ghost */}
                  {item.nameDevanagari && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-16 left-4 pointer-events-none select-none"
                      style={{
                        fontFamily: 'var(--font-devanagari)',
                        fontSize: '1.375rem',
                        color: 'var(--powder-signal)',
                        opacity: 0.22,
                      }}
                    >
                      {item.nameDevanagari}
                    </span>
                  )}

                  {/* Bottom gradient overlay + name */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background:
                        'linear-gradient(to top, var(--obsidian-void), transparent)',
                    }}
                  >
                    <p
                      className="font-display uppercase"
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--bone-text)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.name.toUpperCase()}
                    </p>
                  </div>

                  {/* Classification chip */}
                  <div
                    className="absolute top-3 right-3 font-mono"
                    style={{
                      background: 'var(--mustard-dossier)',
                      color: 'var(--obsidian-void)',
                      padding: '0.2rem 0.4rem',
                      fontSize: '9px',
                      letterSpacing: '0.18em',
                    }}
                  >
                    {archiveLevels[item.id] ?? 'LVL 1'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* ================================================================
          Section 5 — Timeline Teaser Beat Strip
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t"
        style={{
          background: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={[
              'CHRONOLOGY',
              '1717 → 2032',
              'POINT OF DIVERGENCE INSIDE',
            ]}
          />
          <h2
            className="font-display mt-4"
            style={{ fontSize: '3.75rem', color: 'var(--bone-text)', lineHeight: 1 }}
          >
            WHEN HISTORY CRACKED.
          </h2>

          {/* Beat strip */}
          <div className="relative mt-12 pb-8">
            {/* Connecting line */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0"
              style={{
                top: 'calc(1.5rem + 6px)',
                height: '1px',
                background: 'var(--navy-signal)',
              }}
            />

            <div className="flex justify-between items-start">
              {beatEvents.map((event) => {
                const yearLabel = event.date.is_range
                  ? `${event.date.start_year}`
                  : `${event.date.start_year}`;
                return (
                  <div
                    key={event.id}
                    className="flex flex-col items-center"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    {/* Year */}
                    <span
                      className="font-mono text-center"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        color: 'var(--shadow-text)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {yearLabel}
                    </span>

                    {/* Dot */}
                    <div
                      className="relative z-10 rounded-full flex-shrink-0"
                      style={{
                        width: '12px',
                        height: '12px',
                        background: 'var(--mustard-dossier)',
                      }}
                    />

                    {/* Label */}
                    <p
                      className="font-display text-center mt-3 px-1"
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--bone-text)',
                        lineHeight: 1.2,
                      }}
                    >
                      {event.title.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Link href="/timeline" className="mt-4 inline-block">
            <button
              className="font-mono uppercase mt-6"
              style={{
                border: '1px solid var(--powder-signal)',
                color: 'var(--bone-text)',
                padding: '0.5rem 1.25rem',
                fontSize: '12px',
                letterSpacing: '0.18em',
                background: 'transparent',
              }}
            >
              OPEN THE FULL TIMELINE →
            </button>
          </Link>
        </div>
      </FadeInSection>

      {/* ================================================================
          Section 6 — Dispatches Preview
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t"
        style={{
          background: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['LATEST DISPATCHES', 'FROM THE FIELD']}
          />
          <h2
            className="font-display mt-4"
            style={{ fontSize: '3.75rem', color: 'var(--bone-text)', lineHeight: 1 }}
          >
            WHAT THE MESH IS WATCHING.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
            {previewDispatches.map((dispatch, idx) => (
              <div
                key={dispatch.id}
                className="flex flex-col border-t-2 p-6"
                style={{
                  background: 'var(--obsidian-panel)',
                  borderColor: 'var(--navy-signal)',
                  minHeight: idx === 0 ? '560px' : idx === 1 ? '400px' : '300px',
                }}
              >
                {/* Dispatch image */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={dispatch.image}
                    alt={dispatch.topic}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Meta */}
                <div className="mt-4">
                  <EyebrowLabel
                    segments={[
                      dispatch.scheduledDate,
                      'INDRAPUR',
                      'MESH UPLINK ALPHA',
                    ]}
                  />
                </div>

                {/* Headline */}
                <h3
                  className="font-display mt-3"
                  style={{ fontSize: '1.5rem', color: 'var(--bone-text)', lineHeight: 1.2 }}
                >
                  {dispatch.topic.toUpperCase()}
                </h3>

                {/* Hook (2-line body) */}
                <p
                  className="mt-2 flex-1"
                  style={{
                    color: 'var(--steel-text)',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  } as React.CSSProperties}
                >
                  {dispatch.hook}
                </p>

                {/* CTA */}
                <Link
                  href="/dispatches"
                  className="font-mono uppercase mt-4 inline-block"
                  style={{
                    color: 'var(--mustard-dossier)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                  }}
                >
                  READ →
                </Link>
              </div>
            ))}
          </div>

          <Link href="/dispatches" className="mt-8 inline-block">
            <button
              className="font-mono uppercase"
              style={{
                border: '1px solid var(--powder-signal)',
                color: 'var(--bone-text)',
                padding: '0.5rem 1.25rem',
                fontSize: '12px',
                letterSpacing: '0.18em',
                background: 'transparent',
              }}
            >
              VIEW ALL DISPATCHES →
            </button>
          </Link>
        </div>
      </FadeInSection>

      {/* ================================================================
          Section 7 — Purchase Funnel
      ================================================================ */}
      <FadeInSection
        className="py-24 border-t relative overflow-hidden"
        style={{
          background: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        } as React.CSSProperties}
      >
        {/* Diagonal red fracture pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--redaction) 0 1px, transparent 1px 20px)',
            opacity: 0.025,
          }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center">
          {/* LEFT — book cover */}
          <div className="hidden md:flex col-span-5 justify-center relative">
            {/* Mustard glow behind cover */}
            <div
              aria-hidden="true"
              className="absolute rounded-full blur-3xl pointer-events-none"
              style={{
                width: '20rem',
                height: '20rem',
                background: 'rgba(241, 194, 50, 0.12)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <Image
              src="/images/novel-cover.png"
              alt="Bharatvarsh novel"
              width={400}
              height={600}
              className="relative z-10"
              style={{ transform: 'rotate(-6deg)' }}
            />
          </div>

          {/* RIGHT — CTA copy */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-4">
            <EyebrowLabel
              segments={['AVAILABLE NOW', 'PAPERBACK · EBOOK · AUDIOBOOK']}
            />

            <h2
              className="font-display mt-2"
              style={{
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                lineHeight: 1,
                color: 'var(--bone-text)',
              }}
            >
              UNSEAL THE CHRONICLE.
            </h2>

            <p style={{ color: 'var(--steel-text)', maxWidth: '55ch' }}>
              480 pages. Two factions. One case. The dossier is waiting. Your
              clearance has been granted.
            </p>

            {/* Format pills */}
            <div className="flex gap-3 mt-2 flex-wrap">
              {[
                { label: 'Paperback', active: true },
                { label: 'eBook', active: false },
                { label: 'Audiobook', active: false },
              ].map(({ label, active }) => (
                <span
                  key={label}
                  className="font-mono uppercase"
                  style={{
                    padding: '0.375rem 1rem',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    background: active ? 'var(--mustard-dossier)' : 'transparent',
                    color: active ? 'var(--obsidian-void)' : 'var(--bone-text)',
                    border: active
                      ? 'none'
                      : '1px solid var(--navy-signal)',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-4">
              <a
                href="https://www.amazon.in/dp/B0GHS8127Z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="inline-flex items-center gap-2 font-mono uppercase"
                  style={{
                    background: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                  }}
                >
                  BUY NOW ON AMAZON →
                </button>
              </a>
              <Link href="/novel">
                <button
                  className="font-mono uppercase"
                  style={{
                    border: '1px solid var(--powder-signal)',
                    color: 'var(--bone-text)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                    background: 'transparent',
                  }}
                >
                  READ THE FIRST CHAPTER
                </button>
              </Link>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
