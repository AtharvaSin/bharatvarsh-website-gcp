'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { HomeDossierModal } from '@/features/newsletter';
import loreRaw from '@/content/data/lore-items.json';
import dispatchesRaw from '@/content/data/dispatches.json';
import novelData from '@/content/data/novel.json';

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
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const platforms = (novelData as { purchase: { platforms: Array<{ name: string; url: string; icon: string }> } }).purchase.platforms;

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
              &ldquo;A green-tech super-state where peace is engineered. Until
              twenty bombs rearrange the map. What is the true price of
              harmony?&rdquo;
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                type="button"
                onClick={() => setDossierModalOpen(true)}
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
                READ THE FIRST CHAPTER →
              </button>
              <Link href="/lore">
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
                  EXPLORE THE WORLD
                </button>
              </Link>
            </div>

            {/* Trust signal */}
            <EyebrowLabel
              segments={['NO SPAM', 'VERIFY BY EMAIL', 'ONE DOSSIER, DIRECTLY TO YOU']}
              className="mt-4 opacity-70"
            />
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
                Begin with the book. 374 pages. A locked case, a fractured
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

                {/* Clearance indicator */}
                <div
                  className="mt-4 px-4 py-3 border-l-2 flex items-center gap-3"
                  style={{
                    backgroundColor: 'var(--obsidian-void)',
                    borderLeftColor: 'var(--mustard-dossier)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                    style={{ backgroundColor: 'var(--declassified)' }}
                  />
                  <div className="font-mono uppercase text-[10px] tracking-[0.18em]" style={{ color: 'var(--shadow-text)' }}>
                    <span style={{ color: 'var(--bone-text)' }}>CLEARANCE:</span> VISITOR{' '}
                    <span style={{ color: 'var(--mustard-dossier)' }}>▪</span> SESSION READY{' '}
                    <span style={{ color: 'var(--mustard-dossier)' }}>▪</span> BHOOMI{' '}
                    <span style={{ color: 'var(--declassified)' }}>ONLINE</span>
                  </div>
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
              <Link
                key={item.id}
                href={`/lore?item=${item.id}`}
                className="flex-shrink-0 relative overflow-hidden group block"
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
              </Link>
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

          {/* Section 5 dual-track fracture visualization — replaces old beat strip */}
          <div className="relative mt-16 py-12 overflow-hidden">
            {/* Container for both tracks */}
            <div className="relative max-w-[1200px] mx-auto px-8">
              {/* Track labels (left side) */}
              <div className="grid grid-cols-[140px_1fr] gap-6 items-start">
                {/* === OUR HISTORY LABEL === */}
                <div className="pt-2 text-right">
                  <div
                    className="font-mono uppercase text-[10px] tracking-[0.18em]"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    OUR HISTORY
                  </div>
                  <div
                    className="font-mono uppercase text-[9px] tracking-[0.15em] mt-1 opacity-60"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    THE TIMELINE
                    <br />THAT HAPPENED
                  </div>
                </div>

                {/* === OUR HISTORY TRACK === */}
                <div className="relative h-16">
                  {/* Dashed horizontal line */}
                  <div
                    className="absolute top-1/2 left-0 right-0 border-t border-dashed"
                    style={{ borderColor: 'var(--navy-signal)', opacity: 0.4 }}
                  />
                  {/* Reference nodes */}
                  {[
                    { year: '1757', label: 'PLASSEY', x: 8 },
                    { year: '1858', label: 'CROWN RULE', x: 28 },
                    { year: '1947', label: 'INDEPENDENCE', x: 58 },
                    { year: '2010s', label: 'MODERN INDIA', x: 88 },
                  ].map((node) => (
                    <div
                      key={node.year}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${node.x}%`, opacity: 0.45 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full border"
                        style={{
                          borderColor: 'var(--shadow-text)',
                          backgroundColor: 'transparent',
                        }}
                      />
                      <div
                        className="mt-2 font-mono uppercase text-[9px] tracking-[0.12em] whitespace-nowrap text-center"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {node.year}
                        <br />
                        <span className="opacity-60">{node.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* === FRACTURE POINT (centered origin between tracks) === */}
              <div className="relative flex justify-start my-2 pl-[160px]">
                <div className="relative" style={{ width: 'calc(100% - 20px)' }}>
                  {/* 1717 crack origin */}
                  <div className="absolute left-0 -top-2 -bottom-2 flex items-center">
                    {/* Crack glyph */}
                    <svg
                      width="56"
                      height="80"
                      viewBox="0 0 56 80"
                      className="overflow-visible"
                      aria-hidden="true"
                    >
                      {/* Central crack vertical */}
                      <path
                        d="M28 0 L26 20 L30 32 L24 44 L30 56 L26 68 L28 80"
                        stroke="var(--mustard-dossier)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Radiating shards */}
                      <path
                        d="M28 30 L14 18 M28 30 L42 18 M28 50 L14 62 M28 50 L42 62 M28 30 L10 34 M28 50 L46 46"
                        stroke="var(--mustard-dossier)"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.6"
                        strokeLinecap="round"
                      />
                      {/* Central impact dot */}
                      <circle cx="28" cy="40" r="3" fill="var(--mustard-dossier)" />
                    </svg>
                  </div>
                  {/* 1717 caption */}
                  <div className="absolute left-16 top-1/2 -translate-y-1/2">
                    <div
                      className="font-mono uppercase text-[10px] tracking-[0.18em] whitespace-nowrap"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      1717 ▪ DIVERGENCE POINT
                    </div>
                    <div
                      className="font-mono uppercase text-[9px] tracking-[0.15em] whitespace-nowrap opacity-70"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      DELHI REFUSED THE EAST INDIA COMPANY CHARTER
                    </div>
                  </div>
                </div>
              </div>

              {/* === BHARATVARSH TRACK === */}
              <div className="grid grid-cols-[140px_1fr] gap-6 items-start mt-2">
                {/* BHARATVARSH LABEL */}
                <div className="pt-2 text-right">
                  <div
                    className="font-mono uppercase text-[10px] tracking-[0.18em]"
                    style={{ color: 'var(--mustard-dossier)' }}
                  >
                    BHARATVARSH
                  </div>
                  <div
                    className="font-mono uppercase text-[9px] tracking-[0.15em] mt-1 opacity-80"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    THE TIMELINE
                    <br />THE WORLD NEVER SAW
                  </div>
                </div>

                {/* BHARATVARSH TRACK */}
                <div className="relative h-20">
                  {/* Solid horizontal line */}
                  <div
                    className="absolute top-1/2 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: 'var(--mustard-dossier)' }}
                  />
                  {/* Beat nodes */}
                  {[
                    { year: '1717', label: 'FRACTURE', x: 4, significance: 5 },
                    { year: '1790–1850', label: 'ENLIGHTENMENT', x: 22, significance: 3 },
                    { year: '1910–1975', label: 'REPUBLIC', x: 48, significance: 4 },
                    { year: '1975–1985', label: 'CIVIL WAR', x: 66, significance: 3 },
                    { year: '1985–2022', label: 'JAAL YUG', x: 82, significance: 5 },
                    { year: '2022', label: 'THE BOMBINGS', x: 96, significance: 5 },
                  ].map((node) => (
                    <div
                      key={node.year}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${node.x}%` }}
                    >
                      {/* Node dot */}
                      <div
                        className="rounded-full"
                        style={{
                          width: node.significance >= 5 ? '14px' : '10px',
                          height: node.significance >= 5 ? '14px' : '10px',
                          backgroundColor: 'var(--mustard-dossier)',
                          boxShadow: node.significance >= 5 ? '0 0 12px rgba(241, 194, 50, 0.6)' : 'none',
                        }}
                      />
                      <div
                        className="mt-3 font-mono uppercase text-[9px] tracking-[0.12em] whitespace-nowrap text-center"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {node.year}
                        <br />
                        <span style={{ color: 'var(--mustard-dossier)' }}>{node.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption below both tracks */}
              <div className="mt-10 text-center">
                <p
                  className="font-serif italic text-lg"
                  style={{ color: 'var(--powder-signal)' }}
                >
                  &ldquo;One decree. Two centuries. A nation the world never saw.&rdquo;
                </p>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-12">
            {previewDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="flex flex-col border-t-2 p-6"
                style={{
                  background: 'var(--obsidian-panel)',
                  borderColor: 'var(--navy-signal)',
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
              segments={['AVAILABLE NOW', 'THREE CHANNELS', 'ONE CHRONICLE']}
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
              374 pages of alternate-history political thriller. Set in a Bharatvarsh
              that was never colonised — a military-technocratic republic where peace
              is engineered and every transaction lives under the Mesh.
            </p>

            {/* Distribution channel cards — 5/3/4 split */}
            <div className="grid grid-cols-12 gap-6 mt-10">
              {/* Card 1 — Notion Press (Featured) */}
              <div
                className="col-span-12 md:col-span-5 p-6 flex flex-col justify-between relative"
                style={{
                  borderTop: '1px solid var(--navy-signal)',
                  backgroundColor: 'var(--obsidian-panel)',
                  minHeight: '280px',
                }}
              >
                {/* DIRECT stamp */}
                <div
                  className="absolute top-4 left-4 font-mono uppercase text-[9px] tracking-[0.18em] px-2 py-1 border border-dashed"
                  style={{
                    color: 'var(--mustard-dossier)',
                    borderColor: 'var(--mustard-dossier)',
                    transform: 'rotate(-4deg)',
                  }}
                >
                  DIRECT
                </div>
                <div className="mt-8">
                  <div
                    className="font-display"
                    style={{ fontSize: '2.5rem', color: 'var(--bone-text)', lineHeight: 1.1 }}
                  >
                    NOTION PRESS
                  </div>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    Hardcover direct from the author. The cleanest path from our desk to your shelf.
                  </p>
                </div>
                <a
                  href={platforms[0]?.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 self-start"
                >
                  <button
                    className="inline-flex items-center gap-2 font-mono uppercase"
                    style={{
                      background: 'var(--mustard-dossier)',
                      color: 'var(--obsidian-void)',
                      padding: '0.75rem 1.5rem',
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                    }}
                  >
                    ORDER DIRECT →
                  </button>
                </a>
              </div>

              {/* Card 2 — Amazon */}
              <div
                className="col-span-12 md:col-span-3 p-6 flex flex-col justify-between"
                style={{
                  borderTop: '1px solid var(--navy-signal)',
                  backgroundColor: 'var(--obsidian-panel)',
                  minHeight: '280px',
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: '2.5rem', color: 'var(--bone-text)', lineHeight: 1.1 }}
                  >
                    AMAZON
                  </div>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    Hardcover and Kindle editions. Fast delivery across India.
                  </p>
                </div>
                <a
                  href={platforms[1]?.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 self-start"
                >
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
                    BUY ON AMAZON →
                  </button>
                </a>
              </div>

              {/* Card 3 — Flipkart */}
              <div
                className="col-span-12 md:col-span-4 p-6 flex flex-col justify-between"
                style={{
                  borderTop: '1px solid var(--navy-signal)',
                  backgroundColor: 'var(--obsidian-panel)',
                  minHeight: '280px',
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: '2.5rem', color: 'var(--bone-text)', lineHeight: 1.1 }}
                  >
                    FLIPKART
                  </div>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    Hardcover edition. Pan-India shipping with Flipkart&apos;s trusted fulfilment.
                  </p>
                </div>
                <a
                  href={platforms[2]?.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 self-start"
                >
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
                    BUY ON FLIPKART →
                  </button>
                </a>
              </div>
            </div>

            {/* Trust signal */}
            <div className="mt-8 text-center">
              <div
                className="font-mono uppercase text-[10px] tracking-[0.18em]"
                style={{ color: 'var(--shadow-text)' }}
              >
                SHIPS PAN-INDIA{' '}
                <span style={{ color: 'var(--mustard-dossier)' }}>▪</span>{' '}
                HARDCOVER EDITIONS{' '}
                <span style={{ color: 'var(--mustard-dossier)' }}>▪</span>{' '}
                DIRECT AUTHOR CHANNEL AVAILABLE
              </div>
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

      {/* Dossier lead magnet modal — triggered by hero primary CTA */}
      <HomeDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
      />
    </div>
  );
}
