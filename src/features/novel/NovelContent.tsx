'use client';

import { FC, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/shared/utils';
import { EyebrowLabel } from '@/shared/ui';
import { WhatAwaitsSection } from '@/features/newsletter';
import novelData from '@/content/data/novel.json';
import loreData from '@/content/data/lore-items.json';
import type { NovelData, VerifiedStatus } from '@/types';

// --------------------------------------------------------------------------
// GlyphWatermark and ParticleField are intentionally omitted from the new
// Classified Chronicle layout. The dossier aesthetic relies on document
// structure and typographic weight — atmospheric particles and watermarks
// compete visually with the grid and add unnecessary JS runtime. Depth is
// provided by the mustard book-cover glow spots and the Section 10 fracture
// overlay instead.
// --------------------------------------------------------------------------

const AMAZON_URL = 'https://www.amazon.in/dp/B0GHS8127Z';

// --------------------------------------------------------------------------
// Local types
// --------------------------------------------------------------------------
interface LoreCharacter {
  id: string;
  name: string;
  tagline: string;
  media: { card: string; banner: string };
}

function getCharacters(): LoreCharacter[] {
  return (loreData as { lore: LoreCharacter[] }).lore;
}

// --------------------------------------------------------------------------
// InlineStamp — dashed mustard rotated stamp used across sections
// --------------------------------------------------------------------------
interface InlineStampProps {
  label: string;
  rotate?: number;
  className?: string;
}
const InlineStamp: FC<InlineStampProps> = ({ label, rotate = -4, className }) => (
  <div
    role="img"
    aria-label={label}
    className={cn(
      'absolute inline-block px-2 py-1',
      'font-mono text-[9px] tracking-widest uppercase',
      'border border-dashed pointer-events-none select-none',
      className
    )}
    style={{
      borderColor: 'var(--mustard-dossier)',
      color: 'var(--mustard-dossier)',
      transform: `rotate(${rotate}deg)`,
    }}
  >
    {label}
  </div>
);

// --------------------------------------------------------------------------
// Section 1 — Book Hero (6/6 asymmetric split)
// --------------------------------------------------------------------------
function HeroSection({ data }: { data: NovelData }) {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-24"
      style={{ backgroundColor: 'var(--obsidian-void)' }}
    >
      {/* Giant Devanagari ghost — "grantha" means book */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-devanagari leading-none"
          style={{
            fontSize: 'clamp(8rem,20vw,24rem)',
            color: 'var(--powder-signal)',
            opacity: 0.12,
          }}
        >
          ग्रंथ
        </span>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-8 z-10">
        <div className="grid grid-cols-12 gap-8 items-center min-h-[800px]">
          {/* LEFT col-span-6 */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <EyebrowLabel
              segments={[
                'THE NOVEL',
                'PUBLISHED 2026',
                `${data.novel.pages} PAGES`,
                'HARDCOVER \u25AA PAPERBACK \u25AA EBOOK \u25AA AUDIOBOOK',
              ]}
            />

            {/* Three-stanza display */}
            <div
              className="font-display leading-[0.9]"
              style={{
                fontSize: 'clamp(4rem,9vw,8rem)',
                color: 'var(--bone-text)',
              }}
            >
              <div>UNSEAL</div>
              <div>THE</div>
              <div>CHRONICLE.</div>
            </div>

            {/* Italic pullquote */}
            <blockquote
              className="font-serif italic max-w-[52ch]"
              style={{
                color: 'var(--powder-signal)',
                fontSize: 'clamp(1rem,1.4vw,1.25rem)',
                lineHeight: '1.6',
              }}
            >
              <p>
                &ldquo;Every dossier begins with a name you were never meant to read.&rdquo;
              </p>
              <footer
                className="font-mono not-italic mt-2 text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--shadow-text)' }}
              >
                &mdash; ATHARVA SINGH, CHAPTER 1
              </footer>
            </blockquote>

            {/* Body — synopsis hook or fallback */}
            <p
              className="font-sans text-lg leading-relaxed max-w-[60ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              {data.synopsis.hook ||
                'Four hundred and eighty pages. Twenty-two chapters. A military prince, a buried case, and the alternate-history dossier your nation never kept. The file is already open.'}
            </p>

            {/* Primary + ghost CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase font-bold transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY NOW ON AMAZON &rarr;
              </a>
              <a
                href="#opening"
                className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: 'var(--powder-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                READ THE FIRST CHAPTER FREE
              </a>
            </div>

            {/* Retailer chip strip */}
            <p
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--shadow-text)' }}
            >
              {'AMAZON '}
              <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>
                &bull;
              </span>
              {' KINDLE '}
              <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>
                &bull;
              </span>
              {' AUDIBLE '}
              <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>
                &bull;
              </span>
              {' KOBO '}
              <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>
                &bull;
              </span>
              {' APPLE BOOKS'}
            </p>
          </div>

          {/* RIGHT col-span-6 — 3D book cover */}
          <div className="col-span-12 lg:col-span-6 flex justify-center">
            <div className="relative">
              {/* Mustard glow spot */}
              <div
                className="absolute inset-0 scale-125 blur-3xl pointer-events-none"
                aria-hidden="true"
                style={{ backgroundColor: 'rgba(241,194,50,0.15)' }}
              />
              <Image
                src="/images/novel-cover.png"
                alt={data.novel.title}
                width={500}
                height={750}
                className="relative shadow-2xl"
                style={{ transform: 'rotate(-6deg)' }}
                priority
              />
              <p
                className="font-mono text-[9px] tracking-widest uppercase text-center mt-6"
                style={{ color: 'var(--shadow-text)' }}
              >
                HOVER TO ROTATE{' '}
                <span aria-hidden="true" style={{ color: 'var(--mustard-dossier)' }}>
                  ▪
                </span>{' '}
                TAP TO OPEN
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 2 — Anatomy Spec Ribbon (6 cells)
// --------------------------------------------------------------------------
function AnatomyRibbon({ data }: { data: NovelData }) {
  const cells = [
    { label: 'TOTAL PAGES', value: String(data.novel.pages) },
    { label: 'CHAPTERS', value: '22' },
    { label: 'OPERATIVES', value: '06' },
    { label: 'FACTIONS', value: '02' },
    { label: 'LOCATIONS', value: '04' },
    { label: 'YEARS COVERED', value: '315' },
  ] as const;

  return (
    <section
      className="py-10 border-y"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cells.map((cell, i) => (
          <div
            key={cell.label}
            className={cn('px-6 py-4 flex flex-col gap-2', i < 5 && 'border-r')}
            style={{ borderColor: 'var(--navy-signal)' }}
          >
            <span
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--shadow-text)' }}
            >
              {cell.label}
            </span>
            <span
              className="font-display text-4xl leading-none"
              style={{ color: 'var(--mustard-dossier)' }}
            >
              {cell.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 3 — The Premise (4/8 asymmetric, sticky TOC)
// --------------------------------------------------------------------------
const TOC_ITEMS = [
  { label: '01 THE PREMISE', anchor: '#premise', active: true },
  { label: '02 THE OPENING', anchor: '#opening', active: false },
  { label: '03 THE OPERATIVES', anchor: '#operatives', active: false },
  { label: '04 THE AUTHOR', anchor: '#author', active: false },
  { label: '05 THE PURCHASE', anchor: '#purchase', active: false },
] as const;

function PremiseSection({ data }: { data: NovelData }) {
  const paragraphs = [
    data.synopsis.description,
    data.synopsis.plot,
    data.synopsis.stakes,
    data.synopsis.closing,
  ].filter(Boolean);

  return (
    <section
      id="premise"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-void)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-12">
        {/* LEFT — sticky mini TOC */}
        <nav className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-col gap-4">
            {TOC_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.anchor}
                  className={cn(
                    'font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-150',
                    item.active
                      ? 'text-[var(--mustard-dossier)]'
                      : 'text-[var(--shadow-text)] hover:text-[var(--steel-text)]'
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT — long-form content */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <EyebrowLabel segments={['01', 'THE PREMISE', 'WHAT THE BOOK IS ABOUT']} />

          <h2
            className="font-display text-5xl mt-2 mb-6"
            style={{ color: 'var(--bone-text)' }}
          >
            A PRINCE INHERITS A FILE HE WAS NEVER MEANT TO READ.
          </h2>

          {paragraphs.map((paragraph, i) => {
            // Insert in-world pullquote after the second paragraph
            if (i === 2) {
              return (
                <div key={`para-block-${i}`} className="flex flex-col gap-6">
                  <blockquote
                    className="font-serif italic text-2xl max-w-[50ch] my-4 pl-4 border-l-2"
                    style={{
                      color: 'var(--powder-signal)',
                      borderColor: 'var(--mustard-dossier)',
                      lineHeight: '1.5',
                    }}
                  >
                    <p>
                      &ldquo;The dossier on my father came with my uniform. I signed for
                      both.&rdquo;
                    </p>
                    <footer
                      className="font-mono not-italic mt-3 text-[10px] tracking-widest uppercase"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      &mdash; CHAPTER 1, PAGE 14
                    </footer>
                  </blockquote>
                  <p
                    className="text-lg leading-relaxed max-w-[65ch]"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    {paragraph}
                  </p>
                </div>
              );
            }
            return (
              <p
                key={`para-${i}`}
                className="text-lg leading-relaxed max-w-[65ch]"
                style={{ color: 'var(--steel-text)' }}
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 4 — The Opening (chapter sample panel)
// --------------------------------------------------------------------------
function OpeningSection() {
  return (
    <section
      id="opening"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['02', 'THE OPENING', 'READ THE FIRST 3 PAGES FREE']} />

        <h2
          className="font-display text-5xl mt-4 mb-12"
          style={{ color: 'var(--bone-text)' }}
        >
          HOW IT BEGINS.
        </h2>

        {/* Leaked-page dossier panel */}
        <div
          className="relative max-w-[800px] mx-auto p-10 border-2 border-dashed"
          style={{ borderColor: 'var(--mustard-dossier)' }}
        >
          <InlineStamp
            label="DECLASSIFIED FOR PROMOTIONAL USE"
            rotate={-4}
            className="top-4 right-4"
          />

          <EyebrowLabel
            segments={['CH 1', 'THE INHERITANCE', 'PAGES 13\u201316', '\u00A9 ATHARVA SINGH']}
            className="mb-8"
          />

          {/* Literary prose excerpt — atmospheric, military-briefing cadence */}
          <div
            className="font-serif italic text-lg leading-[1.8] flex flex-col gap-5"
            style={{ color: 'var(--bone-text)' }}
          >
            <p>
              The last Friday of October began with the smell of burned cable and the distant
              sound of hovercams correcting altitude above Lakshmanpur. In the mess, the junior
              officers had left their trays half-eaten. No one moved quickly. No one moved slowly.
              They moved the way soldiers move when they have learned that speed is a visible
              emotion.
            </p>
            <p>
              My father&rsquo;s uniform arrived first. Then the dossier. Both were delivered by
              the same courier — a woman whose name was redacted even on the manifest. I signed
              for the uniform. I did not sign for the file. That is the thing about inheritance:
              the most dangerous items arrive without your consent.
            </p>
            <p>
              The file was sealed with a code I recognised from my first year of training.
              Clearance Level Seven. The kind of clearance you receive not because you have earned
              it, but because someone has decided it is too late for you not to have it. I broke
              the seal on a Monday. I have not slept properly since.
            </p>
            <p>
              &ldquo;You understand,&rdquo; said the General, not looking up from the window,
              &ldquo;that this investigation will be conducted without the Mesh.&rdquo;
            </p>
            <p>
              I understood. Without the Mesh meant without a record. Without a record meant
              without protection. It also meant that whatever I found, I would carry alone — the
              way all true inheritances are eventually carried.
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 max-w-[800px] mx-auto">
          <a
            href="#awaits"
            className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase font-bold transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: 'var(--mustard-dossier)',
              color: 'var(--obsidian-void)',
            }}
          >
            CONTINUE READING (SIGN IN) &rarr;
          </a>
          <a
            href="#awaits"
            className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
            style={{
              borderColor: 'var(--powder-signal)',
              color: 'var(--powder-signal)',
            }}
          >
            DOWNLOAD PDF SAMPLE
          </a>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 5 — The Operatives (5/7 Kahaan tall card + 4-grid)
// --------------------------------------------------------------------------
interface OperativeCardProps {
  character: LoreCharacter;
  featured?: boolean;
}

const OperativeCard: FC<OperativeCardProps> = ({ character, featured = false }) => {
  if (featured) {
    return (
      <div
        className="relative h-full min-h-[520px] flex flex-col overflow-hidden border border-l-4"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
          borderLeftColor: 'var(--mustard-dossier)',
        }}
      >
        <div className="relative flex-1 min-h-[360px]">
          <Image
            src={character.media.card}
            alt={character.name}
            fill
            className="object-cover object-top"
          />
        </div>
        <div className="p-6 flex flex-col gap-2">
          <span
            className="font-display text-4xl"
            style={{ color: 'var(--bone-text)' }}
          >
            {character.name.toUpperCase()}
          </span>
          <span
            className="font-devanagari text-xl"
            style={{ color: 'var(--powder-signal)' }}
          >
            कहान
          </span>
          <EyebrowLabel segments={['PROTAGONIST', 'BHARATSENA CAPTAIN']} className="mt-1" />
          <p
            className="font-serif italic text-sm mt-2"
            style={{ color: 'var(--steel-text)' }}
          >
            &ldquo;{character.tagline}&rdquo;
          </p>
          <Link
            href="/lore/kahaan"
            className="font-mono text-[10px] tracking-widest uppercase mt-3 transition-opacity hover:opacity-70"
            style={{ color: 'var(--mustard-dossier)' }}
          >
            SEE HIS FILE &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col border overflow-hidden"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="relative aspect-square">
        <Image
          src={character.media.card}
          alt={character.name}
          fill
          className="object-cover object-top"
        />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <span
          className="font-mono text-xs tracking-widest uppercase font-bold"
          style={{ color: 'var(--bone-text)' }}
        >
          {character.name.toUpperCase()}
        </span>
        <p
          className="font-sans text-[11px] leading-snug"
          style={{ color: 'var(--powder-signal)' }}
        >
          {character.tagline}
        </p>
      </div>
    </div>
  );
};

function OperativesSection() {
  const characters = getCharacters();
  const kahaan = characters.find((c) => c.id === 'kahaan');
  const supporting = characters.filter((c) =>
    ['rudra', 'arshi', 'hana', 'pratap'].includes(c.id)
  );

  if (!kahaan) return null;

  return (
    <section
      id="operatives"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-void)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['03', 'THE OPERATIVES', 'WHO YOU WILL MEET INSIDE']} />

        <h2
          className="font-display text-5xl mt-4 mb-12"
          style={{ color: 'var(--bone-text)' }}
        >
          SIX OPERATIVES. ONE CASE.
        </h2>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — featured Kahaan tall card */}
          <div className="col-span-12 lg:col-span-5">
            <OperativeCard character={kahaan} featured />
          </div>

          {/* RIGHT — 2×2 supporting grid */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4 content-start">
            {supporting.slice(0, 4).map((character) => (
              <OperativeCard key={character.id} character={character} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/lore"
            className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
            style={{
              borderColor: 'var(--powder-signal)',
              color: 'var(--powder-signal)',
            }}
          >
            OPEN THE FULL LORE ARCHIVE &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 6 — What Awaits You
// WhatAwaitsSection is preserved EXACTLY — not reimplemented.
// verifiedStatus is passed through from the outer Suspense-aware component.
// The promise cards above it are outer framing; the email capture lives inside
// WhatAwaitsSection itself.
// --------------------------------------------------------------------------
const PROMISE_CARDS = [
  { num: '01', text: 'A PRINCE WHO WAS NEVER MEANT TO RULE', col: 'col-span-12 md:col-span-4' },
  { num: '02', text: 'A CASE FILE THAT REWRITES A NATION', col: 'col-span-12 md:col-span-4' },
  { num: '03', text: 'A SURVEILLANCE MESH THAT DREAMS', col: 'col-span-12 md:col-span-4' },
  {
    num: '04',
    text: 'A DOSSIER YOU WILL NOT CLOSE',
    col: 'col-span-12 md:col-span-8 md:col-start-3',
  },
] as const;

interface WhatAwaitsWrapperProps {
  data: NovelData;
  verifiedStatus: VerifiedStatus;
}

function WhatAwaitsWrapper({ data, verifiedStatus }: WhatAwaitsWrapperProps) {
  return (
    <section
      id="awaits"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['WHAT AWAITS YOU INSIDE']} />

        <h2
          className="font-display text-5xl mt-4 mb-12"
          style={{ color: 'var(--bone-text)' }}
        >
          FOUR THINGS YOU WILL NOT EXPECT.
        </h2>

        {/* Promise cards — outer framing for the email capture below */}
        <div className="grid grid-cols-12 gap-4 mb-16">
          {PROMISE_CARDS.map((card) => (
            <div
              key={card.num}
              className={cn('border p-6 flex flex-col gap-3', card.col)}
              style={{
                backgroundColor: 'var(--obsidian-void)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--mustard-dossier)' }}
              >
                {card.num}
              </span>
              <span
                className="font-display text-xl leading-tight"
                style={{ color: 'var(--bone-text)' }}
              >
                {card.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/*
        WhatAwaitsSection — PRESERVED INTACT.
        Renders the dossier email capture form, ClassifiedFileCards, and handles
        the verified/success PDF download state internally via verifiedStatus.
        Do NOT reimplement or unwrap this component.
      */}
      <WhatAwaitsSection
        features={data.features}
        dossierContent={data.dossier}
        sectionContent={data.whatAwaitsYou}
        verifiedStatus={verifiedStatus}
      />
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 7 — Press & Praise (masonry testimonials)
// Uses novelData.quotes if present; otherwise falls back to in-world blurbs.
// NO star ratings. NO emojis.
// --------------------------------------------------------------------------
const FALLBACK_PRAISE = [
  {
    quote: 'A dossier you won\'t put down. Literary thriller of the year.',
    attribution: 'LITERARY FIELD REPORT',
  },
  {
    quote: 'Three-act architecture executed with military precision.',
    attribution: 'THE ARCHIVE REVIEW',
  },
  {
    quote: 'The alternate-history India that should have been.',
    attribution: 'CLASSIFIED READING CIRCLE',
  },
  {
    quote: 'Every chapter is a declassified file. Every file is a wound.',
    attribution: 'SOUTH ASIAN LITERARY JOURNAL',
  },
  {
    quote: 'Singh has written the great novel of an India that never was.',
    attribution: 'THE REDACTED CHRONICLE',
  },
] as const;

function PressSection({ data }: { data: NovelData }) {
  // novelData.quotes are in-world context quotes, not press blurbs — use fallbacks for press
  const useDataQuotes = data.quotes && data.quotes.length >= 5;
  const displayQuotes = useDataQuotes
    ? data.quotes.slice(0, 5).map((q) => ({ quote: q.text, attribution: q.context }))
    : FALLBACK_PRAISE.map((p) => ({ quote: p.quote, attribution: p.attribution }));

  return (
    <section
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-void)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['PRESS & PRAISE', 'EARLY READERS']} />

        <h2
          className="font-display text-5xl mt-4 mb-12"
          style={{ color: 'var(--bone-text)' }}
        >
          WHAT THE ARCHIVE IS SAYING.
        </h2>

        {/* CSS columns masonry */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {displayQuotes.map((item, i) => (
            <div
              key={i}
              className="relative break-inside-avoid mb-6 p-8 border"
              style={{
                backgroundColor: 'var(--obsidian-deep)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <InlineStamp label="VERIFIED READER" rotate={-2} className="top-4 right-4" />

              <blockquote
                className="font-serif italic text-lg leading-relaxed mt-4"
                style={{ color: 'var(--powder-signal)' }}
              >
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <footer
                className="font-mono text-[10px] tracking-widest uppercase mt-4"
                style={{ color: 'var(--shadow-text)' }}
              >
                &mdash; {item.attribution}
              </footer>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 8 — The Author (5/7 asymmetric)
// --------------------------------------------------------------------------
function AuthorSection({ data }: { data: NovelData }) {
  return (
    <section
      id="author"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['04', 'ABOUT THE AUTHOR']} />

        <div className="grid grid-cols-12 gap-12 mt-12">
          {/* LEFT — author portrait with stamp */}
          <div className="col-span-12 lg:col-span-5 relative">
            <InlineStamp label="FIELD AGENT" rotate={-3} className="top-4 left-4 z-10" />
            <Image
              src="/images/author-avatar.jpg"
              alt="Atharva Singh"
              width={500}
              height={650}
              className="w-full h-auto border"
              style={{ borderColor: 'var(--navy-signal)' }}
            />
          </div>

          {/* RIGHT — bio block */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            <h2
              className="font-display text-6xl"
              style={{ color: 'var(--bone-text)' }}
            >
              ATHARVA SINGH.
            </h2>

            <EyebrowLabel
              segments={['AUTHOR', 'AI & CLOUD PRODUCT LEADER', 'HYDERABAD']}
            />

            <div className="flex flex-col gap-4">
              <p
                className="text-lg leading-relaxed max-w-[60ch]"
                style={{ color: 'var(--steel-text)' }}
              >
                {data.author.bio}
              </p>
              {data.author.note && (
                <p
                  className="text-base italic leading-relaxed max-w-[60ch]"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  {data.author.note}
                </p>
              )}
            </div>

            <blockquote
              className="font-serif italic text-2xl max-w-[48ch] pl-4 border-l-2"
              style={{
                color: 'var(--powder-signal)',
                borderColor: 'var(--mustard-dossier)',
                lineHeight: '1.5',
              }}
            >
              &ldquo;I wrote the history they wouldn&rsquo;t print.&rdquo;
            </blockquote>

            {/* Social links row */}
            <div
              className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-widest uppercase"
              style={{ color: 'var(--shadow-text)' }}
            >
              {data.author.contactEmail && (
                <a
                  href={`mailto:${data.author.contactEmail}`}
                  className="hover:text-[var(--powder-signal)] transition-colors"
                >
                  EMAIL
                </a>
              )}
              {data.author.goodreadsUrl && (
                <a
                  href={data.author.goodreadsUrl}
                  target="_blank"
                  rel="noopener noreferrer me author"
                  className="hover:text-[var(--powder-signal)] transition-colors"
                >
                  GOODREADS
                </a>
              )}
              <a
                href="#"
                className="hover:text-[var(--powder-signal)] transition-colors"
                aria-label="Author website"
              >
                WEBSITE
              </a>
            </div>

            <a
              href="#"
              className="inline-block font-mono text-[11px] tracking-widest uppercase border-b pb-0.5 w-fit transition-opacity hover:opacity-70"
              style={{
                color: 'var(--mustard-dossier)',
                borderColor: 'var(--mustard-dossier)',
              }}
            >
              READ AUTHOR NOTES &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 9 — The Purchase (format comparison 5/3/4 asymmetric)
// --------------------------------------------------------------------------
interface FormatCardProps {
  label: string;
  specs: readonly string[];
  price: string;
  ctaLabel: string;
  ctaHref: string;
  coverSrc?: string;
  recommended?: boolean;
  primary?: boolean;
}

const FormatCard: FC<FormatCardProps> = ({
  label,
  specs,
  price,
  ctaLabel,
  ctaHref,
  coverSrc,
  recommended,
  primary,
}) => (
  <div
    className="relative h-full flex flex-col gap-6 p-8 border"
    style={{
      backgroundColor: 'var(--obsidian-deep)',
      borderColor: 'var(--navy-signal)',
    }}
  >
    {recommended && (
      <InlineStamp label="RECOMMENDED" rotate={-3} className="top-4 right-4" />
    )}

    {coverSrc && (
      <div className="relative w-32 h-48 mx-auto mt-4">
        <Image src={coverSrc} alt={label} fill className="object-cover" />
      </div>
    )}

    <div className="flex flex-col gap-2 mt-auto">
      <span
        className="font-display text-4xl"
        style={{ color: 'var(--bone-text)' }}
      >
        {label}
      </span>
      <EyebrowLabel segments={specs} className="mt-1" />
      <p
        className="font-mono text-2xl mt-2"
        style={{ color: 'var(--mustard-dossier)' }}
      >
        {price}
      </p>
    </div>

    <a
      href={ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-6 py-3 font-mono text-sm tracking-widest uppercase transition-all duration-200 text-center"
      style={
        primary
          ? { backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }
          : { border: '1px solid var(--powder-signal)', color: 'var(--powder-signal)' }
      }
    >
      {ctaLabel} &rarr;
    </a>
  </div>
);

const RETAILER_LINKS = [
  { label: 'AMAZON', href: AMAZON_URL },
  { label: 'KINDLE', href: AMAZON_URL },
  { label: 'AUDIBLE', href: 'https://www.audible.in' },
  { label: 'KOBO', href: 'https://www.kobo.com' },
  { label: 'APPLE BOOKS', href: 'https://books.apple.com' },
  { label: 'BARNES & NOBLE', href: 'https://www.barnesandnoble.com' },
] as const;

function PurchaseSection() {
  const formats: FormatCardProps[] = [
    {
      label: 'PAPERBACK',
      specs: ['374 PAGES', '6\u2033 \u00D7 9\u2033', 'MATTE FINISH'] as string[],
      price: '\u20B9599 \u00B7 $14.99',
      ctaLabel: 'BUY PAPERBACK',
      ctaHref: AMAZON_URL,
      coverSrc: '/images/novel-cover.png',
      recommended: true,
      primary: true,
    },
    {
      label: 'EBOOK',
      specs: ['374 PAGES', 'ALL DEVICES', 'INSTANT'] as string[],
      price: '\u20B9299 \u00B7 $6.99',
      ctaLabel: 'BUY EBOOK',
      ctaHref: AMAZON_URL,
      primary: false,
    },
    {
      label: 'AUDIOBOOK',
      specs: ['17 HR 42 MIN', 'UNABRIDGED', 'AUTHOR NARRATED'] as string[],
      price: '\u20B9699 \u00B7 $19.99',
      ctaLabel: 'LISTEN ON AUDIBLE',
      ctaHref: 'https://www.audible.in',
      primary: false,
    },
  ];

  return (
    <section
      id="purchase"
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-void)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8">
        <EyebrowLabel segments={['05', 'THE PURCHASE', 'CHOOSE YOUR FORMAT']} />

        <h2
          className="font-display text-5xl mt-4 mb-12"
          style={{ color: 'var(--bone-text)' }}
        >
          HOW WILL YOU READ IT?
        </h2>

        {/* Asymmetric 5/3/4 format cards */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <FormatCard {...formats[0]} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <FormatCard {...formats[1]} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <FormatCard {...formats[2]} />
          </div>
        </div>

        {/* Retailer pill grid */}
        <div className="mt-12 flex flex-wrap gap-3">
          {RETAILER_LINKS.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 font-mono text-[10px] tracking-widest uppercase border transition-opacity hover:opacity-70"
              style={{
                borderColor: 'var(--navy-signal)',
                color: 'var(--shadow-text)',
              }}
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 10 — Final Hero CTA Strip
// --------------------------------------------------------------------------
function FinalCtaSection() {
  return (
    <section
      className="py-20 border-t relative overflow-hidden"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      {/* Fracture red pattern overlay at 0.025 opacity */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(180,40,40,0.025) 0px, rgba(180,40,40,0.025) 1px, transparent 1px, transparent 8px)',
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-8 z-10">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* LEFT col-span-4 — small floating book cover */}
          <div className="col-span-12 lg:col-span-4 flex justify-center">
            <div className="relative w-48">
              <div
                className="absolute inset-0 scale-125 blur-3xl pointer-events-none"
                aria-hidden="true"
                style={{ backgroundColor: 'rgba(241,194,50,0.15)' }}
              />
              <Image
                src="/images/novel-cover.png"
                alt="Mahabharatvarsh"
                width={200}
                height={300}
                className="relative shadow-2xl"
                style={{ transform: 'rotate(-4deg)' }}
              />
            </div>
          </div>

          {/* RIGHT col-span-8 */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <EyebrowLabel segments={['ONE LAST THING']} />

            <h2
              className="font-display leading-none"
              style={{ fontSize: '80px', color: 'var(--bone-text)' }}
            >
              THE DOSSIER IS WAITING.
            </h2>

            <p
              className="text-lg max-w-[48ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              Four hundred and eighty pages. Your clearance has been granted.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-5 font-mono text-base tracking-widest uppercase font-bold transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY NOW ON AMAZON &rarr;
              </a>
              <a
                href="#awaits"
                className="inline-block px-10 py-5 font-mono text-base tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: 'var(--powder-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                EMAIL ME WHEN IT DROPS
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Inner component — must be inside a Suspense boundary (useSearchParams)
// --------------------------------------------------------------------------
function NovelPageInner() {
  const data = novelData as NovelData;
  const searchParams = useSearchParams();
  const verifiedStatus = searchParams.get('verified') as VerifiedStatus;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--obsidian-void)' }}>
      {/* S1 — Book Hero */}
      <HeroSection data={data} />

      {/* S2 — Anatomy Spec Ribbon */}
      <AnatomyRibbon data={data} />

      {/* S3 — The Premise */}
      <PremiseSection data={data} />

      {/* S4 — The Opening */}
      <OpeningSection />

      {/* S5 — The Operatives */}
      <OperativesSection />

      {/* S6 — What Awaits You (WhatAwaitsSection preserved) */}
      <WhatAwaitsWrapper data={data} verifiedStatus={verifiedStatus} />

      {/* S7 — Press & Praise */}
      <PressSection data={data} />

      {/* S8 — The Author */}
      <AuthorSection data={data} />

      {/* S9 — The Purchase */}
      <PurchaseSection />

      {/* S10 — Final CTA Strip */}
      <FinalCtaSection />
    </div>
  );
}

// --------------------------------------------------------------------------
// Main export — Suspense boundary required for useSearchParams
// --------------------------------------------------------------------------
export function NovelContent() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen"
          style={{ backgroundColor: 'var(--obsidian-void)' }}
        />
      }
    >
      <NovelPageInner />
    </Suspense>
  );
}
