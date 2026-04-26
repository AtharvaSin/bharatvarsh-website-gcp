'use client';

import { FC } from 'react';
import Link from 'next/link';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { useSession } from '@/features/auth';
import { useThreads } from './hooks/use-threads';
import { useTopics } from './hooks/use-topics';
import { TopicBadge } from './components/topic-badge';
import type { ThreadListItem, SortOption, TopicView } from './types';

/** Compact relative time label for the compact feeds in this view. */
function forumTimeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}D AGO`;
  const months = Math.floor(days / 30);
  return `${months}MO AGO`;
}

// The top banner stats + marquee are now data-driven — computed from
// useThreads() and useTopics() inside the component. No hardcoded fake counts.

const SORT_LABELS: { label: string; value: SortOption }[] = [
  { label: 'HOTTEST', value: 'popular' },
  { label: 'NEWEST', value: 'latest' },
  { label: 'MOST REPLIES', value: 'unanswered' },
];

// Aligned with the four Ground Rules in the seeded Welcome to the Archives
// thread (prisma/forum-seed-threads.ts, Thread 1). Single source of truth for
// the rules of engagement.
const CONDUCT_RULES = [
  'SPOILERS WRAP IN [CLASSIFIED] TAGS. WARN BEFORE YOU REVEAL.',
  'ATTACK THE ARGUMENT. NEVER THE PERSON BEHIND IT.',
  'NO REAL-WORLD POLITICAL MAPPING. THIS IS A FICTION ABOUT 1717.',
  'EVERY POST ADDS SOMETHING — A QUESTION, OBSERVATION, THEORY, OR COUNTERPOINT.',
];

/** Converts a date string into a relative time label. */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Forum community hub — Classified Chronicle field intelligence network layout. */
export const ForumContent: FC = () => {
  const { topics } = useTopics();
  const { threads, pagination, isLoading, sort, setSort, setPage } = useThreads();
  const { isMember } = useSession();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--obsidian-void)' }}>

      {/* ─── Live Network Banner ─────────────────────────────────────────────── */}
      {/* Data-driven: thread count + topic count come from the API, and the
          marquee streams the actual latest thread titles instead of hardcoded
          placeholder headlines. */}
      <style>{`
        @keyframes forum-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <section
        className="border-y py-3 overflow-hidden"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between gap-6 overflow-hidden">
          {/* LEFT: pulsing dot + real counts */}
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--mustard-dossier)' }}
            />
            <EyebrowLabel
              segments={[
                'FIELD NETWORK ACTIVE',
                `${pagination?.total ?? 0} TRANSMISSIONS`,
                `${topics.length} CHANNELS`,
              ]}
            />
          </div>
          {/* RIGHT: scrolling ticker — real latest thread titles */}
          <div className="overflow-hidden flex-1 min-w-0">
            {threads.length > 0 && (
              <div
                className="flex whitespace-nowrap"
                style={{ animation: 'forum-marquee 60s linear infinite' }}
              >
                <span
                  className="font-mono uppercase text-[11px] tracking-[0.15em]"
                  style={{ color: 'var(--steel-text)' }}
                >
                  {(() => {
                    const titles = threads
                      .slice(0, 8)
                      .map((t) => t.title.toUpperCase());
                    // Double the list so the marquee loops seamlessly
                    const stream = [...titles, ...titles]
                      .map((t) => `${t} ▪ `)
                      .join('');
                    return stream;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section 1 — Field Dispatch Hero ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        {/* Devanagari ghost: मंच (mañcha = stage/forum) */}
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
          मंच
        </span>

        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center relative z-10">

          {/* LEFT col-span-7 */}
          <div className="col-span-12 lg:col-span-7">
            <EyebrowLabel
              segments={['FIELD INTELLIGENCE NETWORK', 'READER COMMUNITY', 'EST. 2026']}
              className="mb-6"
            />

            {/* 3-stanza display headline */}
            <div
              className="font-display leading-[0.9] mb-8"
              style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', color: 'var(--bone-text)' }}
            >
              <div>THE FIELD</div>
              <div>NETWORK</div>
              <div>
                IS{' '}
                <span
                  className="inline-flex items-center justify-center px-4 border-2"
                  style={{
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                    backgroundColor: 'var(--mustard-dossier)' + '1a',
                  }}
                >
                  OPEN.
                </span>
              </div>
            </div>

            {/* Pullquote */}
            <p
              className="font-serif text-xl italic mb-6 leading-relaxed"
              style={{ color: 'var(--powder-signal)' }}
            >
              &ldquo;Every dossier has a second reader. Find yours.&rdquo;
            </p>

            {/* Body copy */}
            <p
              className="font-sans text-base leading-relaxed mb-10 max-w-[65ch]"
              style={{ color: 'var(--steel-text)' }}
            >
              A community of operatives trading lore digs, theories, fan transmissions,
              and direct Q&A with the author. Not a comment section — a field network.
              Sign the manifest to transmit.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              {isMember && (
                <Link
                  href="/forum/new"
                  className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  NEW TRANSMISSION →
                </Link>
              )}
              <a
                href="#channels"
                className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{
                  border: '1px solid var(--navy-signal)',
                  color: 'var(--steel-text)',
                }}
              >
                BROWSE CHANNELS →
              </a>
            </div>
          </div>

          {/* RIGHT col-span-5: LATEST TRANSMISSIONS feed (data-driven).
              Replaces the previous fake "LIVE NETWORK PULSE" radial graph —
              which was 12 random dots with hardcoded post counts and a "YOU"
              center node that meant nothing. This feed instead surfaces the
              real top transmissions so readers can step into the conversation
              directly from the hero without scrolling or clicking filters. */}
          <div className="hidden lg:block col-span-5">
            <div
              className="border-l-4"
              style={{
                borderLeftColor: 'var(--mustard-dossier)',
                borderTop: '1px solid var(--navy-signal)',
                borderRight: '1px solid var(--navy-signal)',
                borderBottom: '1px solid var(--navy-signal)',
                backgroundColor: 'var(--obsidian-panel)',
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 border-b"
                style={{ borderBottomColor: 'var(--navy-signal)' }}
              >
                <EyebrowLabel
                  segments={[
                    'INCOMING',
                    'LATEST TRANSMISSIONS',
                    pagination?.total
                      ? `${pagination.total} IN ARCHIVE`
                      : '—',
                  ]}
                />
              </div>

              {/* Feed */}
              {isLoading ? (
                <div
                  className="p-8 text-center font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  DECRYPTING FEED…
                </div>
              ) : threads.length === 0 ? (
                <div
                  className="p-8 text-center font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  NO TRANSMISSIONS YET. BE THE FIRST.
                </div>
              ) : (
                <div className="flex flex-col">
                  {threads.slice(0, 5).map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/forum/thread/${thread.id}`}
                      className="group block px-5 py-4 border-b transition-colors"
                      style={{
                        borderBottomColor: 'var(--navy-signal)',
                      }}
                    >
                      {/* Top row: topic pill + pinned marker */}
                      <div className="flex items-center gap-2 mb-2">
                        {thread.isPinned && (
                          <span
                            className="font-mono text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: 'var(--mustard-dossier)' }}
                          >
                            ▸ PINNED
                          </span>
                        )}
                        {thread.tags.slice(0, 1).map((tag) => (
                          <TopicBadge
                            key={tag.slug}
                            name={tag.name}
                            color={tag.color}
                            maxChars={16}
                          />
                        ))}
                      </div>
                      {/* Title */}
                      <div
                        className="font-display leading-[1.15] line-clamp-2 mb-2 transition-colors"
                        style={{
                          fontSize: '1.125rem',
                          color: 'var(--bone-text)',
                        }}
                      >
                        {thread.title.toUpperCase()}
                      </div>
                      {/* Metadata */}
                      <div
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        <span>
                          {thread.author.name || 'ANONYMOUS'}
                        </span>
                        <span>{forumTimeAgo(thread.createdAt)}</span>
                        <span>{thread.postCount} REPLIES</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Footer link */}
              <div className="px-5 py-3 text-right">
                <Link
                  href="#channels"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  BROWSE BY CHANNEL →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2 — Channels (real seeded topics) ───────────────────────── */}
      {/* Previously this section hard-coded 6 fake topic cards with slugs like
          `theories-deep-digs` that don't exist in the seeded DB — so every
          click 404'd or showed empty results. It's now fully data-driven:
          the channel with the most transmissions gets the featured card,
          the rest stack next to it. Counts come from the API. */}
      <section
        id="channels"
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={[
              'CHANNELS',
              `${topics.length || '—'} ${topics.length === 1 ? 'CHANNEL' : 'CHANNELS'}`,
              'CHOOSE YOUR FREQUENCY',
            ]}
            className="mb-6"
          />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            WHERE ARE YOU TRANSMITTING FROM?
          </h2>

          {topics.length === 0 ? (
            <div
              className="py-16 text-center border border-dashed"
              style={{ borderColor: 'var(--navy-signal)' }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--shadow-text)' }}
              >
                DECRYPTING CHANNELS…
              </p>
            </div>
          ) : (
            (() => {
              // Rank by threadCount so the busiest channel is featured.
              const sortedTopics: TopicView[] = [...topics].sort(
                (a, b) => (b.threadCount ?? 0) - (a.threadCount ?? 0),
              );
              const featured = sortedTopics[0];
              const others = sortedTopics.slice(1);

              return (
                <div className="grid grid-cols-12 gap-4">
                  {/* FEATURED — busiest channel */}
                  {featured && (
                    <Link
                      href={`/forum/topic/${featured.slug}`}
                      className="col-span-12 lg:col-span-6 group"
                    >
                      <div
                        className="relative p-8 h-full min-h-[280px] flex flex-col justify-between transition-opacity hover:opacity-90 border-t-2"
                        style={{
                          backgroundColor: 'var(--obsidian-panel)',
                          borderTopColor: 'var(--mustard-dossier)',
                        }}
                      >
                        <div>
                          <div
                            className="font-mono text-4xl font-bold mb-4"
                            style={{ color: 'var(--mustard-dossier)' }}
                          >
                            01
                          </div>
                          <h3
                            className="font-display text-3xl uppercase mb-3 leading-tight"
                            style={{ color: 'var(--bone-text)' }}
                          >
                            {featured.name}
                          </h3>
                          {featured.description && (
                            <p
                              className="font-sans text-sm mb-6 max-w-[50ch]"
                              style={{ color: 'var(--shadow-text)' }}
                            >
                              {featured.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: 'var(--shadow-text)' }}
                          >
                            {featured.threadCount}{' '}
                            {featured.threadCount === 1
                              ? 'TRANSMISSION'
                              : 'TRANSMISSIONS'}{' '}
                            ▪ FEATURED CHANNEL
                          </span>
                          <span
                            className="font-mono text-xs transition-transform group-hover:translate-x-1"
                            style={{ color: 'var(--mustard-dossier)' }}
                          >
                            ENTER →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* OTHER CHANNELS — fills the right 6 cols in a responsive grid */}
                  <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {others.map((topic, i) => {
                      const num = String(i + 2).padStart(2, '0');
                      return (
                        <Link
                          key={topic.slug}
                          href={`/forum/topic/${topic.slug}`}
                          className="group"
                        >
                          <div
                            className="relative p-6 h-full min-h-[180px] flex flex-col justify-between transition-opacity hover:opacity-90 border-t-2"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderTopColor: 'var(--navy-signal)',
                            }}
                          >
                            <div>
                              <div
                                className="font-mono text-2xl font-bold mb-2"
                                style={{ color: 'var(--mustard-dossier)' }}
                              >
                                {num}
                              </div>
                              <h3
                                className="font-display text-xl uppercase mb-2 leading-tight"
                                style={{ color: 'var(--bone-text)' }}
                              >
                                {topic.name}
                              </h3>
                              {topic.description && (
                                <p
                                  className="font-sans text-xs"
                                  style={{ color: 'var(--shadow-text)' }}
                                >
                                  {topic.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <span
                                className="font-mono text-[10px] uppercase tracking-widest"
                                style={{ color: 'var(--shadow-text)' }}
                              >
                                {topic.threadCount}{' '}
                                {topic.threadCount === 1
                                  ? 'TRANSMISSION'
                                  : 'TRANSMISSIONS'}
                              </span>
                              <span
                                className="font-mono text-[10px] transition-transform group-hover:translate-x-1"
                                style={{ color: 'var(--mustard-dossier)' }}
                              >
                                →
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </section>

      {/* ─── Section 3 — All Transmissions (complete field log) ──────────────────
          Grid of every seeded thread. Previously only 5 of 9 rendered (the
          hero-right feed was hard-capped at `threads.slice(0, 5)`); this
          section surfaces the full log as cards regardless of pinned state
          so nothing from the seed file is silently dropped.
      */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={[
              'COMPLETE FIELD LOG',
              isLoading
                ? 'INDEXING...'
                : `${pagination?.total ?? threads.length} TRANSMISSIONS`,
              'ALL CHANNELS',
            ]}
            className="mb-6"
          />
          <h2
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            ALL TRANSMISSIONS.
          </h2>
          <p
            className="mb-12 max-w-[65ch] text-sm leading-relaxed"
            style={{ color: 'var(--steel-text)' }}
          >
            Every thread currently on record, newest first. The hero feed shows
            only the five most-recent transmissions — this is the full archive.
          </p>

          {isLoading ? (
            <p
              className="font-mono uppercase text-[11px] tracking-[0.18em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              ◦ INDEXING FIELD LOG ◦
            </p>
          ) : threads.length === 0 ? (
            <p
              className="font-mono uppercase text-[11px] tracking-[0.18em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              NO DECLASSIFIED TRANSMISSIONS ON FILE.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {threads.map((thread, index) => {
                const topic = thread.tags?.[0];
                const author = thread.author?.name ?? 'ANONYMOUS';
                return (
                  <Link
                    key={thread.id}
                    href={`/forum/thread/${thread.id}`}
                    className="group relative flex flex-col p-6 border transition-colors"
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderColor: 'var(--navy-signal)',
                    }}
                  >
                    {/* Case number + pinned / locked badges */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        CASE #{String(index + 1).padStart(3, '0')}
                      </span>
                      <div className="flex items-center gap-2">
                        {thread.isPinned && (
                          <span
                            className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 border"
                            style={{
                              borderColor: 'var(--mustard-dossier)',
                              color: 'var(--mustard-dossier)',
                            }}
                          >
                            PINNED
                          </span>
                        )}
                        {thread.isLocked && (
                          <span
                            className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 border"
                            style={{
                              borderColor: 'var(--redaction)',
                              color: 'var(--redaction)',
                            }}
                          >
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Topic badge (first tag only) */}
                    {topic && (
                      <div className="mb-3">
                        <TopicBadge name={topic.name} color={topic.color} />
                      </div>
                    )}

                    {/* Title */}
                    <h3
                      className="font-display text-xl uppercase tracking-wide leading-tight mb-3 transition-colors group-hover:opacity-100"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {thread.title}
                    </h3>

                    {/* Excerpt */}
                    {thread.excerpt && (
                      <p
                        className="text-[13px] leading-relaxed mb-5 line-clamp-3"
                        style={{ color: 'var(--steel-text)' }}
                      >
                        {thread.excerpt}
                      </p>
                    )}

                    {/* Footer — author + replies + time */}
                    <div
                      className="mt-auto pt-4 border-t flex items-center justify-between gap-3 flex-wrap"
                      style={{ borderColor: 'var(--navy-signal)' }}
                    >
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.14em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {author.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.14em]"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          {thread.postCount} {thread.postCount === 1 ? 'REPLY' : 'REPLIES'}
                        </span>
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.14em]"
                          style={{ color: 'var(--mustard-dossier)' }}
                        >
                          {forumTimeAgo(thread.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Mustard border-hover accent */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none border opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: 'var(--mustard-dossier)' }}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── Section 4 — Code of Conduct ──────────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['COMMUNITY PROTOCOLS', 'THE FIELD CODE']} className="mb-6" />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            RULES OF TRANSMISSION.
          </h2>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT: giant numeral */}
            <div className="col-span-12 lg:col-span-4">
              <div
                className="font-display leading-none select-none"
                style={{
                  fontSize: '200px',
                  color: 'var(--mustard-dossier)',
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                04
              </div>
              <div
                className="font-mono text-[11px] uppercase tracking-widest mt-2"
                style={{ color: 'var(--shadow-text)' }}
              >
                PROTOCOLS ▪ NON-NEGOTIABLE
              </div>
            </div>

            {/* RIGHT: numbered rules */}
            <div className="col-span-12 lg:col-span-8">
              <ol className="space-y-0">
                {CONDUCT_RULES.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-6 py-5 border-t items-start"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <span
                      className="font-mono text-sm shrink-0 w-6 pt-0.5"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="font-display text-xl leading-tight"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {rule}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 7 — Join the Network CTA ────────────────────────────────── */}
      <section
        className="py-16 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* LEFT: stylized clearance stamp — no fake user counts, no fake
                avatars. Just a dossier-tile that visually balances the CTA. */}
            <div className="col-span-12 lg:col-span-4 flex items-center justify-center lg:justify-start">
              <div
                className="relative border-2 border-dashed p-8 text-center"
                style={{
                  borderColor: 'var(--mustard-dossier)',
                  backgroundColor: 'var(--obsidian-panel)',
                  transform: 'rotate(-2deg)',
                  minWidth: '260px',
                }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  REQUEST FORM
                </div>
                <div
                  className="font-display leading-[0.95]"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    color: 'var(--bone-text)',
                  }}
                >
                  CLEARANCE
                  <br />
                  PENDING.
                </div>
                <div
                  className="font-mono text-[9px] uppercase tracking-[0.22em] mt-4 pt-3 border-t"
                  style={{
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                  }}
                >
                  AWAITING SIGNATURE ▪ FIELD CODE
                </div>
              </div>
            </div>

            {/* RIGHT: CTA */}
            <div className="col-span-12 lg:col-span-8">
              <EyebrowLabel segments={['READY TO TRANSMIT?']} className="mb-4" />
              <h2
                className="font-display mb-4"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--bone-text)' }}
              >
                JOIN THE FIELD NETWORK.
              </h2>
              <p
                className="font-sans text-base leading-relaxed mb-8 max-w-[55ch]"
                style={{ color: 'var(--steel-text)' }}
              >
                Create an operative profile. Start a thread. Decode a chapter.
                The network is listening.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  REQUEST OPERATIVE PROFILE →
                </Link>
                <a
                  href="#channels"
                  className="inline-flex items-center gap-2 px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                  style={{
                    border: '1px solid var(--navy-signal)',
                    color: 'var(--steel-text)',
                  }}
                >
                  BROWSE AS VISITOR
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
