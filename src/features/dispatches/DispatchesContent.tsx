'use client';

import { FC, useState, useMemo } from 'react';
import Image from 'next/image';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import dispatchData from '@/content/data/dispatches.json';
import {
  Dispatch,
  DispatchPlatform,
  hasAnyPublishedUrl,
  primaryDispatchUrl,
  publishedPlatforms,
} from '@/features/dispatches/types';

const PLATFORM_ICONS: Record<DispatchPlatform, FC<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

const PLATFORM_LABELS: Record<DispatchPlatform, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  facebook: 'Facebook',
};

interface ReadLinkProps {
  dispatch: Dispatch;
  label: string;
  className?: string;
}

const ReadLink: FC<ReadLinkProps> = ({ dispatch, label, className = '' }) => {
  const url = primaryDispatchUrl(dispatch);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read intercept: ${dispatch.topic}`}
      className={`font-mono uppercase tracking-[0.18em] cursor-pointer hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-dossier)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-void)] ${className}`}
      style={{ color: 'var(--mustard-dossier)' }}
    >
      {label}
    </a>
  );
};

const PlatformIconStrip: FC<{ dispatch: Dispatch }> = ({ dispatch }) => {
  const platforms = publishedPlatforms(dispatch);
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {platforms.map((platform) => {
        const Icon = PLATFORM_ICONS[platform];
        const url = dispatch.publishedUrls![platform]!;
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${dispatch.topic} on ${PLATFORM_LABELS[platform]}`}
            className="opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-dossier)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-panel)]"
            style={{ color: 'var(--steel-text)' }}
          >
            <Icon className="w-3.5 h-3.5" />
          </a>
        );
      })}
    </div>
  );
};

type AngleFilter = 'all' | 'bharatsena' | 'akakpen' | 'tribhuj';
type ChannelFilter = 'all' | 'declassified_report' | 'graffiti_photo' | 'news_article';
type DateRangeFilter = 'last7' | 'last30' | 'all';
type SortOrder = 'newest' | 'oldest';

const angleOptions: { value: AngleFilter; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'bharatsena', label: 'Bharatsena' },
  { value: 'akakpen', label: 'Akakpen' },
  { value: 'tribhuj', label: 'Tribhuj' },
];

const TICKER_TEXT =
  'INDRAPUR CURFEW EXTENDED ▪ AKAKPEN SCOUT PARTY NEAR OXY PLANT ▪ MESH NODE 7-ALPHA OFFLINE ▪ MAGNA CARTA CEREMONY CONFIRMED ▪ BHARATSENA 7TH DEPLOYED ▪ CASE #0042 DECLASSIFIED ▪ ';

/** Dispatches that get a [REDACTED] bar over part of the body copy */
const REDACTED_IDS = new Set(['BHV-20260421-001', 'BHV-20260512-001']);

/** Every 3rd card (0-indexed positions 2, 5, 8…) gets a Devanagari ornament */
const DEVANAGARI_ORNAMENTS = ['सूचना', 'वर्गीकृत', 'गुप्त', 'प्रसारण'];

const CHAPTER_BEATS = [
  { tag: 'CH 1 — THE INHERITANCE', id: 'ch1' },
  { tag: 'CH 4 — THE FIRST LEAK', id: 'ch4' },
  { tag: 'CH 9 — BORDER CROSSING', id: 'ch9' },
  { tag: 'CH 14 — THE MIRROR ROOM', id: 'ch14' },
  { tag: 'CH 19 — THE REVELATION', id: 'ch19' },
];

export const DispatchesContent: FC = () => {
  const [angleFilter, setAngleFilter] = useState<AngleFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');

  const dispatches = dispatchData.dispatches as Dispatch[];

  const filteredDispatches = useMemo(() => {
    const result = dispatches.filter((d: Dispatch) => {
      if (!hasAnyPublishedUrl(d)) return false;   // A1 visibility rule
      if (angleFilter !== 'all' && d.storyAngle !== angleFilter) return false;
      if (channelFilter !== 'all' && d.contentChannel !== channelFilter) return false;
      return true;
    });

    if (sortOrder === 'oldest') {
      result.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    } else {
      result.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    }

    return result;
  }, [angleFilter, channelFilter, sortOrder, dispatches]);

  // Hero + breaking cards must also respect A1 — derive from the filtered+sorted list.
  const publishedDispatches = useMemo(
    () => dispatches.filter((d: Dispatch) => hasAnyPublishedUrl(d)),
    [dispatches],
  );
  const featuredDispatch = publishedDispatches[0];
  const breakingCards = publishedDispatches.slice(0, 3);
  const chapterLinkedDispatches = filteredDispatches.slice(0, 4);

  const countByAngle = (angle: AngleFilter): number =>
    publishedDispatches.filter((d) => d.storyAngle === angle).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--obsidian-void)' }}>

      {/* ─── Section 1 — Live Ticker ──────────────────────────────────────────── */}
      <section
        className="border-y py-3 overflow-hidden"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>

        <div className="max-w-[1440px] mx-auto px-8 flex items-center gap-6">
          {/* Fixed left badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--mustard-dossier)' }}
            />
            <EyebrowLabel segments={['LIVE FEED', 'MESH UPLINK ACTIVE', '03:42 UTC']} />
          </div>

          {/* Scrolling ticker */}
          <div className="overflow-hidden flex-1 min-w-0">
            <div
              className="flex whitespace-nowrap"
              style={{ animation: 'marquee 30s linear infinite' }}
            >
              <span
                className="font-mono uppercase text-[11px] tracking-[0.15em] mr-12"
                style={{ color: 'var(--steel-text)' }}
              >
                {TICKER_TEXT}
                {TICKER_TEXT}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2 — Hero (55/45 asymmetric) ─────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        {/* Devanagari ghost watermark */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none"
          style={{
            fontSize: 'clamp(8rem, 20vw, 24rem)',
            opacity: 0.12,
            color: 'var(--powder-signal)',
            fontFamily: 'var(--font-devanagari)',
          }}
        >
          प्रसारण
        </span>

        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT col-span-7 */}
          <div className="col-span-12 lg:col-span-7">
            <EyebrowLabel
              segments={['DISPATCHES', 'IN-WORLD NEWS FEED', 'UPDATED 2026.04.13']}
              className="mb-6"
            />

            {/* Display headline */}
            <div
              className="font-display leading-[0.9] mb-8"
              style={{
                fontSize: 'clamp(4rem, 9vw, 8rem)',
                color: 'var(--bone-text)',
              }}
            >
              <div>WHAT THE</div>
              <div>
                <span
                  className="inline-flex items-center justify-center px-3 border-2 mr-3"
                  style={{
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                  }}
                >
                  MESH
                </span>
                IS
              </div>
              <div>WATCHING.</div>
            </div>

            {/* Pullquote */}
            <p
              className="font-serif italic text-lg leading-relaxed max-w-2xl mb-10"
              style={{ color: 'var(--steel-text)' }}
            >
              &ldquo;Every morning, the regime releases its approved version of events. Every night,
              operatives leak the other version. This is the feed you&apos;re not supposed to be
              reading.&rdquo;
            </p>

            {/* Sort + subscribe row */}
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="font-mono uppercase text-[11px] tracking-[0.15em] px-4 py-2 border bg-transparent cursor-pointer"
                style={{
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--bone-text)',
                  backgroundColor: 'var(--obsidian-panel)',
                }}
              >
                <option value="newest">NEWEST FIRST</option>
                <option value="oldest">OLDEST FIRST</option>
              </select>

              <button
                className="font-mono uppercase text-[11px] tracking-[0.15em] px-4 py-2 border transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--mustard-dossier)',
                }}
              >
                SUBSCRIBE TO INTERCEPTS →
              </button>
            </div>
          </div>

          {/* RIGHT col-span-5 */}
          <div className="col-span-12 lg:col-span-5">
            {/* BVN masthead badge */}
            <div className="flex justify-end mb-6">
              <Image
                src="/images/brand/bvn-masthead-compact.svg"
                alt="BVN"
                width={120}
                height={40}
                className="opacity-70"
              />
            </div>

            {/* 3 Breaking compact cards */}
            {breakingCards.map((dispatch) => (
              <div
                key={dispatch.id}
                className="border-l-2 p-4 mb-3 relative overflow-hidden"
                style={{
                  borderColor: 'var(--mustard-dossier)',
                  backgroundColor: 'var(--obsidian-panel)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                    style={{ backgroundColor: 'var(--mustard-dossier)' }}
                  />
                  <span
                    className="font-mono uppercase text-[10px] tracking-[0.15em]"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    {dispatch.scheduledDate} ▪ MESH NODE 7-ALPHA
                  </span>
                </div>
                <p
                  className="font-display text-base leading-tight"
                  style={{ color: 'var(--bone-text)' }}
                >
                  {dispatch.topic}
                </p>
                {/* Thin redaction strip */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: 'var(--redaction)', opacity: 0.4 }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3 — Filter Bar ───────────────────────────────────────────── */}
      <section
        className="py-6 border-y"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 flex items-center gap-4 flex-wrap">
          <EyebrowLabel segments={['FILTER BY CATEGORY']} />

          {/* Angle filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAngleFilter('all')}
              className="font-mono uppercase text-[10px] tracking-[0.15em] px-3 py-1.5 border transition-colors"
              style={
                angleFilter === 'all'
                  ? {
                      backgroundColor: 'var(--mustard-dossier)',
                      borderColor: 'var(--mustard-dossier)',
                      color: 'var(--obsidian-void)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: 'var(--navy-signal)',
                      color: 'var(--shadow-text)',
                    }
              }
            >
              ALL ({publishedDispatches.length})
            </button>
            {angleOptions.slice(1).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAngleFilter(opt.value)}
                className="font-mono uppercase text-[10px] tracking-[0.15em] px-3 py-1.5 border transition-colors"
                style={
                  angleFilter === opt.value
                    ? {
                        backgroundColor: 'var(--mustard-dossier)',
                        borderColor: 'var(--mustard-dossier)',
                        color: 'var(--obsidian-void)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--navy-signal)',
                        color: 'var(--shadow-text)',
                      }
                }
              >
                {opt.label.toUpperCase()} ({countByAngle(opt.value)})
              </button>
            ))}
          </div>

          {/* Vertical divider */}
          <div
            className="hidden lg:block w-px h-6 shrink-0"
            style={{ backgroundColor: 'var(--navy-signal)' }}
          />

          {/* Date range mini-toggle */}
          <div className="flex items-center gap-1">
            {(
              [
                { value: 'last7', label: 'LAST 7 DAYS' },
                { value: 'last30', label: 'LAST 30 DAYS' },
                { value: 'all', label: 'ALL TIME' },
              ] as { value: DateRangeFilter; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className="font-mono uppercase text-[10px] tracking-[0.12em] px-3 py-1.5 border transition-colors"
                style={
                  dateRange === opt.value
                    ? {
                        backgroundColor: 'var(--mustard-dossier)',
                        borderColor: 'var(--mustard-dossier)',
                        color: 'var(--obsidian-void)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--navy-signal)',
                        color: 'var(--shadow-text)',
                      }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search input — far right */}
          <div className="ml-auto">
            <input
              type="text"
              placeholder="SEARCH INTERCEPTS…"
              className="font-mono uppercase text-[10px] tracking-[0.15em] px-4 py-2 border bg-transparent outline-none placeholder-opacity-40 w-52"
              style={{
                borderColor: 'var(--navy-signal)',
                color: 'var(--bone-text)',
                backgroundColor: 'var(--obsidian-panel)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── Section 4 — Featured Intercept ──────────────────────────────────── */}
      {featuredDispatch && (
        <section
          className="py-24 border-t"
          style={{
            backgroundColor: 'var(--obsidian-void)',
            borderColor: 'var(--navy-signal)',
          }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <EyebrowLabel
              segments={['FEATURED INTERCEPT', 'TOP PRIORITY', '2026.04.11']}
              className="mb-10"
            />

            <div className="grid grid-cols-12 gap-8 items-start">
              {/* LEFT — image */}
              <div className="col-span-12 lg:col-span-6 relative">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {featuredDispatch.image && (
                    <Image
                      src={featuredDispatch.image}
                      alt={featuredDispatch.topic}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  {/* Classified stamp */}
                  <div
                    className="absolute top-4 left-4 font-mono uppercase text-[10px] tracking-[0.18em] px-3 py-1 border-2"
                    style={{
                      borderColor: 'var(--mustard-dossier)',
                      color: 'var(--mustard-dossier)',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                    }}
                  >
                    CLASSIFIED LVL 3
                  </div>
                </div>
              </div>

              {/* RIGHT — content */}
              <div className="col-span-12 lg:col-span-6">
                <EyebrowLabel
                  segments={[
                    featuredDispatch.storyAngle?.toUpperCase() ?? 'CLASSIFIED',
                    featuredDispatch.scheduledDate,
                    'SRC: MESH NODE 7-ALPHA',
                  ]}
                  className="mb-4"
                />

                <h2
                  className="font-display text-5xl leading-tight mb-6"
                  style={{ color: 'var(--bone-text)' }}
                >
                  {featuredDispatch.topic}
                </h2>

                <p
                  className="font-sans text-base leading-relaxed mb-6"
                  style={{ color: 'var(--steel-text)' }}
                >
                  {featuredDispatch.hook ?? featuredDispatch.caption?.slice(0, 300)}
                </p>

                <p
                  className="font-serif italic text-base leading-relaxed mb-8 pl-4 border-l-2"
                  style={{
                    color: 'var(--powder-signal)',
                    borderColor: 'var(--navy-signal)',
                  }}
                >
                  &ldquo;The Mesh was watching. The Mesh saw nothing. The question nobody is asking: what
                  else isn&apos;t it seeing?&rdquo;
                </p>

                {/* Connects-to tags */}
                <div className="flex gap-3 flex-wrap mb-8">
                  {['KAHAAN', 'INDRAPUR HQ', 'JAAL YUG'].map((tag) => (
                    <span
                      key={tag}
                      className="font-mono uppercase text-[10px] tracking-[0.18em] px-3 py-1 border"
                      style={{
                        borderColor: 'var(--mustard-dossier)',
                        color: 'var(--mustard-dossier)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ReadLink
                  dispatch={featuredDispatch}
                  label="READ FULL INTERCEPT →"
                  className="text-[11px]"
                />
                <div className="mt-4">
                  <PlatformIconStrip dispatch={featuredDispatch} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Section 5 — Main Dispatches Stream ──────────────────────────────── */}
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
              'ALL INTERCEPTS',
              `${filteredDispatches.length} FILES`,
              'MOST RECENT AT THE TOP',
            ]}
            className="mb-4"
          />

          <h2
            className="font-display mb-10"
            style={{
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              color: 'var(--bone-text)',
              lineHeight: '0.9',
            }}
          >
            THE STREAM.
          </h2>

          {filteredDispatches.length === 0 ? (
            /* ── Empty State ──────────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--mustard-dossier)' }}
              />
              <p
                className="font-mono uppercase text-sm tracking-[0.2em]"
                style={{ color: 'var(--shadow-text)' }}
              >
                MESH UPLINK SCANNING ▪ NEXT INTERCEPT IN 04:17
              </p>
              <span
                aria-hidden="true"
                className="text-4xl"
                style={{ color: 'var(--powder-signal)', opacity: 0.2 }}
              >
                सूचना
              </span>
              <button
                onClick={() => {
                  setAngleFilter('all');
                  setChannelFilter('all');
                }}
                className="font-mono uppercase text-[10px] tracking-[0.18em] px-4 py-2 border mt-4"
                style={{
                  borderColor: 'var(--mustard-dossier)',
                  color: 'var(--mustard-dossier)',
                }}
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            /* ── Masonry stream ──────────────────────────────────────────────── */
            <div className="columns-1 md:columns-2 gap-6 mt-8">
              {filteredDispatches.map((dispatch, index) => {
                const isRedacted = REDACTED_IDS.has(dispatch.id);
                const hasOrnament = (index + 1) % 3 === 0;
                const ornament =
                  DEVANAGARI_ORNAMENTS[index % DEVANAGARI_ORNAMENTS.length];

                return (
                  <div
                    key={dispatch.id}
                    className="break-inside-avoid mb-6 border-t-2 flex flex-col relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderTopColor: 'var(--navy-signal)',
                    }}
                  >
                    {/* Image */}
                    {dispatch.image && (
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={dispatch.image}
                          alt={dispatch.topic}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      {/* Meta row */}
                      <div
                        className="font-mono uppercase text-[10px] tracking-[0.18em] mb-2"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {dispatch.scheduledDate} ▪{' '}
                        {dispatch.storyAngle?.toUpperCase() ?? 'CLASSIFIED'} ▪{' '}
                        {dispatch.contentChannel?.toUpperCase().replace(/_/g, ' ')}
                      </div>

                      {/* Headline */}
                      <h3
                        className="font-display text-2xl leading-tight mb-2"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {dispatch.topic}
                      </h3>

                      {/* Body with optional redaction bar */}
                      <div className="relative mt-2">
                        <p
                          className="text-sm leading-relaxed line-clamp-3"
                          style={{ color: 'var(--steel-text)' }}
                        >
                          {dispatch.hook ?? ''}
                        </p>
                        {isRedacted && (
                          <div
                            className="absolute inset-x-0 bottom-0 h-5 flex items-center px-2"
                            style={{ backgroundColor: 'var(--redaction)' }}
                          >
                            <span
                              className="font-mono uppercase text-[9px] tracking-[0.2em]"
                              style={{ color: 'rgba(255,255,255,0.6)' }}
                            >
                              [REDACTED — CLASSIFICATION LEVEL 3]
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Connects-to tags */}
                      <div className="flex gap-2 flex-wrap mt-3">
                        <span
                          className="font-mono uppercase text-[9px] tracking-[0.18em]"
                          style={{ color: 'var(--mustard-dossier)' }}
                        >
                          {dispatch.storyAngle?.toUpperCase() ?? 'CLASSIFIED'}
                        </span>
                        {dispatch.contentChannel && (
                          <span
                            className="font-mono uppercase text-[9px] tracking-[0.18em]"
                            style={{ color: 'var(--navy-signal)' }}
                          >
                            {dispatch.contentChannel.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Footer row: ornament · platform icons · read link */}
                      <div className="flex items-end justify-between mt-4 gap-3">
                        {hasOrnament ? (
                          <span
                            aria-hidden="true"
                            className="font-sans text-xl leading-none select-none"
                            style={{
                              color: 'var(--powder-signal)',
                              opacity: 0.2,
                              fontFamily: 'var(--font-devanagari)',
                            }}
                          >
                            {ornament}
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="flex items-center gap-3">
                          <PlatformIconStrip dispatch={dispatch} />
                          <ReadLink
                            dispatch={dispatch}
                            label="READ →"
                            className="text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── Section 6 — Chapter Connection Strip ────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{
          backgroundColor: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['READ ALONG', 'NOVEL CONNECTIONS']}
            className="mb-6"
          />

          <h2
            className="font-display mb-12"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--bone-text)',
              lineHeight: '0.9',
            }}
          >
            THESE INTERCEPTS APPEAR IN THE NOVEL.
          </h2>

          <div className="grid grid-cols-12 gap-8">
            {/* LEFT — sticky sidebar chapter beats */}
            <div className="col-span-12 lg:col-span-4">
              <div className="space-y-3 lg:sticky lg:top-24">
                {CHAPTER_BEATS.map((beat) => (
                  <div key={beat.id} className="flex items-center gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                    />
                    <span
                      className="font-mono uppercase text-[11px] tracking-[0.15em]"
                      style={{ color: 'var(--steel-text)' }}
                    >
                      {beat.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 2-col chapter-linked dispatch cards */}
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chapterLinkedDispatches.map((dispatch, idx) => {
                  const chapterTag = CHAPTER_BEATS[idx % CHAPTER_BEATS.length];
                  return (
                    <div
                      key={dispatch.id}
                      className="border-t-2 p-4"
                      style={{
                        backgroundColor: 'var(--obsidian-panel)',
                        borderTopColor: 'var(--mustard-dossier)',
                      }}
                    >
                      <span
                        className="font-mono uppercase text-[9px] tracking-[0.18em] px-2 py-0.5 inline-block mb-3"
                        style={{
                          backgroundColor: 'var(--mustard-dossier)',
                          color: 'var(--obsidian-void)',
                        }}
                      >
                        {chapterTag.tag}
                      </span>
                      <p
                        className="font-display text-lg leading-tight"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {dispatch.topic}
                      </p>
                      <p
                        className="font-sans text-xs leading-relaxed mt-2 line-clamp-2"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {dispatch.hook ?? ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 8 — Closing CTA ──────────────────────────────────────────── */}
      <section
        className="py-16 border-t"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* LEFT col-span-5 */}
            <div className="col-span-12 lg:col-span-5">
              <EyebrowLabel
                segments={["DON'T WAIT FOR THEM TO LEAK IT."]}
                className="mb-4"
              />
              <h2
                className="font-display mb-4"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  color: 'var(--bone-text)',
                  lineHeight: '0.9',
                }}
              >
                READ THE FULL CHRONICLE.
              </h2>
              <p
                className="font-serif italic text-base"
                style={{ color: 'var(--steel-text)' }}
              >
                The dispatches are echoes. The novel is the source.
              </p>
            </div>

            {/* RIGHT col-span-7 */}
            <div className="col-span-12 lg:col-span-7 flex items-center gap-4 flex-wrap lg:justify-end">
              <a
                href="/novel"
                className="font-mono uppercase text-[11px] tracking-[0.18em] px-8 py-4 border-2 transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--mustard-dossier)',
                  backgroundColor: 'var(--mustard-dossier)',
                  color: 'var(--obsidian-void)',
                }}
              >
                BUY THE NOVEL →
              </a>
              <button
                className="font-mono uppercase text-[11px] tracking-[0.18em] px-8 py-4 border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--navy-signal)',
                  color: 'var(--steel-text)',
                  backgroundColor: 'transparent',
                }}
              >
                SUBSCRIBE TO DISPATCH ALERTS
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
