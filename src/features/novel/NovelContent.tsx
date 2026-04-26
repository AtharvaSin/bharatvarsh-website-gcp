'use client';

import { FC, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/shared/utils';
import { EyebrowLabel } from '@/shared/ui';
import { HomeDossierModal } from '@/features/newsletter';
import { useSession } from '@/features/auth';
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
const FLIPKART_URL = 'https://dl.flipkart.com/s/zo1xOSuuuN';
const NOTION_PRESS_URL = 'https://direct.notionpress.com/in/read/mahabharatvarsh-hardcover/';
const SAMPLE_PDF_URL = '/downloads/Bharatvarsh-Dossier-Chapter-1.pdf';
const AUTHOR_WEBSITE_URL = 'https://atharva-singh-profile.vercel.app/';

// --------------------------------------------------------------------------
// Local types
// --------------------------------------------------------------------------
interface LoreCharacter {
  id: string;
  name: string;
  tagline: string;
  classification?: 'classified' | 'declassified';
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
                'HARDCOVER \u25AA PAPERBACK \u25AA EBOOK',
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

            {/* Italic pullquote — author voice pulling from the novel's core premise */}
            <blockquote
              className="font-serif italic max-w-[52ch]"
              style={{
                color: 'var(--powder-signal)',
                fontSize: 'clamp(1rem,1.4vw,1.25rem)',
                lineHeight: '1.6',
              }}
            >
              <p>
                &ldquo;I wrote a nation that engineered peace. This is the file where it shattered.&rdquo;
              </p>
              <footer
                className="font-mono not-italic mt-2 text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--shadow-text)' }}
              >
                &mdash; ATHARVA SINGH, ON CHAPTER 1
              </footer>
            </blockquote>

            {/* Body — synopsis hook or fallback */}
            <p
              className="font-sans text-lg leading-relaxed max-w-[60ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              {data.synopsis.hook ||
                'Three hundred and seventy-four pages. Twenty-two chapters. A military prince, a buried case, and the alternate-history dossier your nation never kept. The file is already open.'}
            </p>

            {/* CTAs — 2x2 grid: Amazon / Flipkart / Notion Press / ghost Read-First-Chapter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-4 font-mono text-sm tracking-widest uppercase font-bold text-center transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY ON AMAZON &rarr;
              </a>
              <a
                href={FLIPKART_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-4 font-mono text-sm tracking-widest uppercase font-bold text-center transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY ON FLIPKART &rarr;
              </a>
              <a
                href={NOTION_PRESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-4 font-mono text-sm tracking-widest uppercase font-bold text-center transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY ON NOTION PRESS &rarr;
              </a>
              <a
                href="#opening"
                className="inline-block px-6 py-4 font-mono text-sm tracking-widest uppercase text-center border transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: 'var(--powder-signal)',
                  color: 'var(--powder-signal)',
                }}
              >
                READ THE FIRST CHAPTER FREE
              </a>
            </div>
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
  // Values verified against lore-items.json on 2026-04-14:
  // 3 factions (Bharatsena, Akakpen, Tribhuj), 4 locations
  // (Indrapur, Lakshmanpur, Treaty Zone, Mysuru). 6 operatives
  // are the novel's investigation principals — Kahaan, Rudra, Pratap,
  // Hana, Arshi, Surya. "Years covered" removed per page refinement.
  const cells = [
    { label: 'TOTAL PAGES', value: String(data.novel.pages) },
    { label: 'CHAPTERS', value: '22' },
    { label: 'OPERATIVES', value: '06' },
    { label: 'FACTIONS', value: '03' },
    { label: 'LOCATIONS', value: '04' },
  ] as const;

  return (
    <section
      className="py-10 border-y"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {cells.map((cell, i) => (
          <div
            key={cell.label}
            className={cn('px-6 py-4 flex flex-col gap-2', i < cells.length - 1 && 'border-r')}
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
                      &ldquo;They handed me the uniform. The questions came with the
                      case.&rdquo;
                    </p>
                    <footer
                      className="font-mono not-italic mt-3 text-[10px] tracking-widest uppercase"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      &mdash; KAHAAN, CHAPTER 1
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
// Continue Reading → HomeDossierModal (lead capture) for unauthenticated users.
// Signed-in users skip the lead capture entirely and download the sample PDF
// directly. Button visibility is gated on isAuthenticated.
// --------------------------------------------------------------------------
function OpeningSection() {
  const { isAuthenticated } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

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

        {/* CTA row — auth-aware.
            Not signed in: Continue Reading (opens HomeDossierModal) + disabled Download PDF.
            Signed in:     Download PDF (direct) — Continue Reading is hidden. */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 max-w-[800px] mx-auto">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase font-bold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'var(--mustard-dossier)',
                color: 'var(--obsidian-void)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              CONTINUE READING &rarr;
            </button>
          )}
          {isAuthenticated ? (
            <a
              href={SAMPLE_PDF_URL}
              download
              className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase font-bold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'var(--mustard-dossier)',
                color: 'var(--obsidian-void)',
              }}
            >
              DOWNLOAD PDF SAMPLE &rarr;
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Sign in to download the PDF sample"
              className="inline-block px-8 py-4 font-mono text-sm tracking-widest uppercase border"
              style={{
                borderColor: 'var(--shadow-text)',
                color: 'var(--shadow-text)',
                backgroundColor: 'transparent',
                cursor: 'not-allowed',
                opacity: 0.55,
              }}
            >
              DOWNLOAD PDF SAMPLE (SIGN IN)
            </button>
          )}
        </div>
      </div>

      {/* Lead-capture modal — same wrapper as Home page */}
      <HomeDossierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 5 — The Operatives (6 equal cards in a 3×2 grid).
// Declassified cards are <Link> → /lore?item=<id>, which opens that character's
// dossier modal via the LoreContent deep-link handler. The LoreContent modal
// close handler will router.back() the user to /novel when they came via deep
// link, preserving the return journey.
//
// Classified operatives (Surya, Arshi) render a shadowy silhouette variant for
// unauthenticated visitors: image heavily darkened + desaturated, name redacted,
// CLASSIFIED stamp, and a SIGN IN TO UNSEAL CTA that links to /auth/signin with
// callbackUrl=/novel. Once signed in, the normal dossier card renders.
// --------------------------------------------------------------------------
const OPERATIVE_IDS = ['kahaan', 'rudra', 'pratap', 'hana', 'arshi', 'surya'] as const;

interface OperativeCardProps {
  character: LoreCharacter;
  isAuthenticated: boolean;
}

const OperativeCard: FC<OperativeCardProps> = ({ character, isAuthenticated }) => {
  const isLocked =
    character.classification === 'classified' && !isAuthenticated;

  if (isLocked) {
    return (
      <Link
        href="/auth/signin?callbackUrl=/novel#operatives"
        className="group relative flex flex-col border overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--mustard-dossier)',
        }}
        aria-label={`${character.name} — classified. Sign in to unseal.`}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Silhouette: real image under a heavy darken + desaturate + blur filter.
              Authenticated users see the full-color version in the other branch. */}
          <Image
            src={character.media.card}
            alt=""
            fill
            className="object-cover object-top"
            style={{
              filter: 'grayscale(100%) brightness(0.18) contrast(1.3) blur(2px)',
            }}
            aria-hidden="true"
          />

          {/* Navy-mustard redaction wash over the silhouette */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 35%, rgba(11,39,66,0.55) 0%, rgba(15,20,25,0.9) 70%)',
            }}
          />

          {/* Diagonal classified stamp — rotated, dashed mustard border */}
          <div
            className="absolute top-4 left-4 font-mono uppercase tracking-[0.22em] text-[10px] px-2 py-1 border border-dashed"
            style={{
              color: 'var(--mustard-dossier)',
              borderColor: 'var(--mustard-dossier)',
              transform: 'rotate(-4deg)',
              backgroundColor: 'rgba(15,20,25,0.65)',
            }}
          >
            CLASSIFIED
          </div>

          {/* Center — redaction bar + big REDACTED label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <div
              className="font-mono uppercase tracking-[0.22em] text-[10px]"
              style={{ color: 'var(--mustard-dossier)', opacity: 0.9 }}
            >
              CLEARANCE · LVL 5
            </div>
            <div
              className="font-display text-2xl leading-none"
              style={{
                color: 'var(--bone-text)',
                backgroundColor: 'var(--redaction)',
                padding: '0.25rem 0.75rem',
                letterSpacing: '0.12em',
              }}
            >
              [REDACTED]
            </div>
            <div
              className="font-mono uppercase tracking-[0.22em] text-[9px] max-w-[80%] leading-relaxed"
              style={{ color: 'var(--powder-signal)' }}
            >
              IDENTITY WITHHELD PENDING VERIFICATION
            </div>
          </div>
        </div>

        {/* Footer strip — sign-in CTA */}
        <div
          className="p-4 flex flex-col gap-2 border-t"
          style={{ borderColor: 'var(--mustard-dossier)' }}
        >
          <span
            className="font-display text-2xl leading-none"
            style={{ color: 'var(--shadow-text)', letterSpacing: '0.08em' }}
          >
            ????????
          </span>
          <p
            className="font-sans text-[11px] leading-snug"
            style={{ color: 'var(--shadow-text)' }}
          >
            This operative&rsquo;s file is sealed. Clearance required to
            review identity, background, and mission record.
          </p>
          <span
            className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase transition-opacity group-hover:opacity-100"
            style={{ color: 'var(--mustard-dossier)', opacity: 0.95 }}
          >
            SIGN IN TO UNSEAL &rarr;
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/lore?item=${character.id}`}
      className="group flex flex-col border overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--obsidian-deep)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={character.media.card}
          alt={character.name}
          fill
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Gradient bottom for legibility of name overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, var(--obsidian-deep) 0%, rgba(26,31,46,0.55) 55%, transparent 100%)',
          }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span
          className="font-display text-2xl leading-none"
          style={{ color: 'var(--bone-text)' }}
        >
          {character.name.toUpperCase()}
        </span>
        <p
          className="font-sans text-[11px] leading-snug line-clamp-2"
          style={{ color: 'var(--powder-signal)' }}
        >
          {character.tagline}
        </p>
        <span
          className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase transition-opacity group-hover:opacity-100"
          style={{ color: 'var(--mustard-dossier)', opacity: 0.85 }}
        >
          OPEN FILE &rarr;
        </span>
      </div>
    </Link>
  );
};

function OperativesSection() {
  const { isAuthenticated } = useSession();
  const characters = getCharacters();
  const operatives = OPERATIVE_IDS
    .map((id) => characters.find((c) => c.id === id))
    .filter((c): c is LoreCharacter => Boolean(c));

  if (operatives.length === 0) return null;

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {operatives.map((character) => (
            <OperativeCard
              key={character.id}
              character={character}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        <div className="mt-12">
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
// Section 6 — Inside the Dossier
// Replaces the old "Press & Praise / What the Archive is Saying" section,
// which relied on fabricated press blurbs from non-existent publications.
// This section is fully honest — every line is either a canonical quote from
// the novel itself (novel.json → quotes) or a confirmed thematic pillar
// (novel.json → themes). No fake sources, no invented endorsements.
// --------------------------------------------------------------------------
function InsideTheDossierSection({ data }: { data: NovelData }) {
  const quotes = data.quotes ?? [];
  const themes = data.themes ?? [];

  return (
    <section
      className="py-24 border-t"
      style={{
        backgroundColor: 'var(--obsidian-void)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-8">
        <EyebrowLabel
          segments={['INSIDE THE DOSSIER', 'FROM THE CHRONICLE ITSELF']}
        />

        <h2
          className="font-display text-5xl mt-4 mb-4"
          style={{ color: 'var(--bone-text)' }}
        >
          THE BOOK SPEAKS FOR ITSELF.
        </h2>
        <p
          className="font-serif italic text-lg max-w-[58ch] mb-16"
          style={{ color: 'var(--powder-signal)' }}
        >
          No press blurbs. No invented endorsements. These are excerpts from
          the dossier itself — what you will actually read on the page.
        </p>

        {/* In-world fragments — stacked, alternating left/right for rhythm */}
        <div className="flex flex-col gap-14 mb-24">
          {quotes.slice(0, 3).map((q, i) => {
            const isAlignRight = i % 2 === 1;
            return (
              <div
                key={i}
                className={cn(
                  'relative px-8 py-2 border-l-2 max-w-[780px]',
                  isAlignRight && 'md:ml-auto md:border-l-0 md:border-r-2 md:pl-8 md:pr-8 md:text-right'
                )}
                style={{ borderColor: 'var(--mustard-dossier)' }}
              >
                <div
                  className="font-mono uppercase text-[10px] tracking-[0.22em] mb-4"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  FRAGMENT {String(i + 1).padStart(2, '0')}
                  <span
                    aria-hidden="true"
                    className="mx-2"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    ▪
                  </span>
                  <span style={{ color: 'var(--shadow-text)' }}>
                    MAHABHARATVARSH
                  </span>
                </div>
                <blockquote
                  className="font-serif italic"
                  style={{
                    color: 'var(--bone-text)',
                    fontSize: 'clamp(1.375rem, 2.4vw, 2rem)',
                    lineHeight: 1.45,
                  }}
                >
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <footer
                  className="mt-5 font-mono text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  &mdash; {q.context}
                </footer>
              </div>
            );
          })}
        </div>

        {/* Themes strip — 4 canonical thematic pillars from novel.json */}
        <div
          className="pt-12 border-t"
          style={{ borderColor: 'var(--navy-signal)' }}
        >
          <EyebrowLabel
            segments={['KEY THEMES', 'WHAT THIS FILE IS ABOUT']}
            className="mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {themes.slice(0, 4).map((theme, i) => (
              <div
                key={theme.title}
                className="flex gap-5 p-6 border"
                style={{
                  backgroundColor: 'var(--obsidian-deep)',
                  borderColor: 'var(--navy-signal)',
                }}
              >
                <div
                  className="font-mono text-[10px] tracking-[0.22em] pt-1 flex-shrink-0"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className="font-display text-2xl leading-tight"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {theme.title.toUpperCase()}
                  </span>
                  <p
                    className="font-sans text-sm leading-relaxed"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    {theme.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
              &ldquo;I wrote the India we almost had. Come walk through it with me.&rdquo;
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
                href={AUTHOR_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer me author"
                className="hover:text-[var(--powder-signal)] transition-colors"
                aria-label="Author website"
              >
                WEBSITE
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Section 7 — The Purchase (2 formats × 3 channels each)
// Audiobook removed. Paperback and Ebook each list all three canonical
// purchase channels (Amazon, Flipkart, Notion Press) with direct links.
// --------------------------------------------------------------------------
interface ChannelLink {
  label: string;
  href: string;
}

interface FormatCardProps {
  label: string;
  specs: readonly string[];
  price: string;
  channels: readonly ChannelLink[];
  coverSrc?: string;
  recommended?: boolean;
}

const FormatCard: FC<FormatCardProps> = ({
  label,
  specs,
  price,
  channels,
  coverSrc,
  recommended,
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

    <div className="flex flex-col gap-2">
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

    {/* Three per-channel CTAs stacked */}
    <div className="flex flex-col gap-2 mt-auto">
      {channels.map((ch, idx) => (
        <a
          key={ch.label}
          href={ch.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 font-mono text-xs tracking-widest uppercase transition-all duration-200 text-center"
          style={
            idx === 0
              ? { backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }
              : { border: '1px solid var(--powder-signal)', color: 'var(--powder-signal)' }
          }
        >
          BUY ON {ch.label} &rarr;
        </a>
      ))}
    </div>
  </div>
);

const RETAILER_LINKS = [
  { label: 'AMAZON KINDLE', href: AMAZON_URL },
  { label: 'NOTION PRESS', href: NOTION_PRESS_URL },
] as const;

const PURCHASE_CHANNELS: readonly ChannelLink[] = [
  { label: 'AMAZON', href: AMAZON_URL },
  { label: 'FLIPKART', href: FLIPKART_URL },
  { label: 'NOTION PRESS', href: NOTION_PRESS_URL },
];

function PurchaseSection() {
  const formats: FormatCardProps[] = [
    {
      label: 'PAPERBACK',
      specs: ['374 PAGES', '6\u2033 \u00D7 9\u2033', 'MATTE FINISH'] as string[],
      price: '\u20B9599 \u00B7 $14.99',
      channels: PURCHASE_CHANNELS,
      coverSrc: '/images/novel-cover.png',
      recommended: true,
    },
    {
      label: 'EBOOK',
      specs: ['374 PAGES', 'ALL DEVICES', 'INSTANT'] as string[],
      price: '\u20B9299 \u00B7 $6.99',
      channels: PURCHASE_CHANNELS,
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

        {/* Two-format side-by-side grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px]">
          <FormatCard {...formats[0]} />
          <FormatCard {...formats[1]} />
        </div>

        {/* Retailer pills — only the two canonical surfaces left standing */}
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
// Inner component — must be inside a Suspense boundary (useSearchParams)
// --------------------------------------------------------------------------
function NovelPageInner() {
  const data = novelData as NovelData;
  const searchParams = useSearchParams();
  const verifiedStatus = searchParams.get('verified') as VerifiedStatus;

  // Cross-tab signal: when the user lands here via the email verification
  // link (?verified=success), broadcast so any home tab with the open dossier
  // modal can reset and close itself. Storage write is the fallback for
  // browsers without BroadcastChannel support.
  useEffect(() => {
    if (verifiedStatus !== 'success') return;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('bharatvarsh-dossier-verify');
        channel.postMessage({ type: 'verified', at: Date.now() });
        channel.close();
      }
      window.localStorage.setItem(
        'bharatvarsh_dossier_verified',
        new Date().toISOString()
      );
    } catch {
      // localStorage / BroadcastChannel may be unavailable (private mode etc.)
    }
  }, [verifiedStatus]);

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

      {/* S6 — Inside the Dossier (in-world quotes + themes, no fake press) */}
      <InsideTheDossierSection data={data} />

      {/* S7 — The Author */}
      <AuthorSection data={data} />

      {/* S8 — The Purchase */}
      <PurchaseSection />
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
