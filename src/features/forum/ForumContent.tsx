'use client';

import { FC } from 'react';
import Link from 'next/link';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { useSession } from '@/features/auth';
import { useThreads } from './hooks/use-threads';
import { useTopics } from './hooks/use-topics';
import type { ThreadListItem, SortOption } from './types';

// ─── Placeholder stats — TODO: wire to useThreads() pagination + user count ──
const PLACEHOLDER_OPERATIVES = '8,472';
const PLACEHOLDER_TRANSMISSIONS = '12,039';

const TICKER_ITEMS = [
  'NEW THEORY: THE MIRROR ROOM IS BHOOMI\'S PAST',
  'FAN ART: INDRAPUR AT NIGHT',
  'CH 19 SPOILER THREAD',
  'Q&A THURSDAY WITH ATHARVA',
  'KAHAAN SIGHTING IN CH 21 DRAFT LEAK?',
  'TRIBHUJ LORE DIG: WHO BUILT THE FIRST NODE',
];
const TICKER_TEXT = TICKER_ITEMS.map((t) => `${t} ▪ `).join('') + TICKER_ITEMS.map((t) => `${t} ▪ `).join('');

const SORT_LABELS: { label: string; value: SortOption }[] = [
  { label: 'HOTTEST', value: 'popular' },
  { label: 'NEWEST', value: 'latest' },
  { label: 'MOST REPLIES', value: 'unanswered' },
];

const OPERATIVE_CARDS = [
  { username: 'FIELD_AGENT_KAHAAN_12', rank: 'LVL 14 ▪ VETERAN', posts: '142 POSTS THIS MONTH ▪ ACTIVE NOW', seed: 1 },
  { username: 'ARCHIVIST_RUDRA_04', rank: 'LVL 11 ▪ ANALYST', posts: '98 POSTS THIS MONTH ▪ ACTIVE 3H AGO', seed: 2 },
  { username: 'DOSSIER_DIGGER', rank: 'LVL 9 ▪ FIELD AGENT', posts: '87 POSTS THIS MONTH ▪ ACTIVE NOW', seed: 3 },
  { username: 'MESH_NODE_WATCHER', rank: 'LVL 7 ▪ RECRUIT', posts: '61 POSTS THIS MONTH ▪ ACTIVE 1H AGO', seed: 4 },
  { username: 'THEORY_WEAVER_JWALA', rank: 'LVL 12 ▪ VETERAN', posts: '112 POSTS THIS MONTH ▪ ACTIVE NOW', seed: 5 },
  { username: 'BHARATSENA_WATCHER', rank: 'LVL 8 ▪ FIELD AGENT', posts: '54 POSTS THIS MONTH ▪ ACTIVE 6H AGO', seed: 6 },
  { username: 'AKAKPEN_SPOTTER', rank: 'LVL 6 ▪ RECRUIT', posts: '39 POSTS THIS MONTH ▪ ACTIVE 2H AGO', seed: 7 },
  { username: 'LORE_KEEPER_ADIL', rank: 'LVL 13 ▪ VETERAN', posts: '127 POSTS THIS MONTH ▪ ACTIVE NOW', seed: 8 },
];

const CONDUCT_RULES = [
  'TRANSMISSIONS ARE PUBLIC. WRITE WITH INTENT.',
  'SPOILERS BELONG IN THE SPOILER CHANNEL. NOT IN THE HEADLINES.',
  'FAN ART IS PROTECTED. RESPECT IT.',
  'AUTHOR Q&A IS A PRIVILEGE. ASK LIKE A READER, NOT A HECKLER.',
  'NO HARASSMENT. NO DOXXING. NO REAL-WORLD POLITICS.',
  'CITE YOUR SOURCES. CHAPTER AND PAGE NUMBERS.',
  'BHOOMI IS THE ARBITER. HER CALLS ARE FINAL.',
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
          {/* LEFT: pulsing dot + operative count */}
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--mustard-dossier)' }}
            />
            <EyebrowLabel
              segments={[
                'FIELD NETWORK ACTIVE',
                `${PLACEHOLDER_OPERATIVES} OPERATIVES ONLINE`,
                `${PLACEHOLDER_TRANSMISSIONS} TRANSMISSIONS TODAY`,
              ]}
            />
          </div>
          {/* RIGHT: scrolling ticker */}
          <div className="overflow-hidden flex-1 min-w-0">
            <div
              className="flex whitespace-nowrap"
              style={{ animation: 'forum-marquee 40s linear infinite' }}
            >
              <span
                className="font-mono uppercase text-[11px] tracking-[0.15em]"
                style={{ color: 'var(--steel-text)' }}
              >
                {TICKER_TEXT}
              </span>
            </div>
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
                href="#hottest-transmissions"
                className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{
                  border: '1px solid var(--navy-signal)',
                  color: 'var(--steel-text)',
                }}
              >
                BROWSE RECENT →
              </a>
            </div>
          </div>

          {/* RIGHT col-span-5: radial network pulse visualization */}
          <div className="hidden lg:block col-span-5">
            <div
              className="relative h-[500px] rounded-lg"
              style={{
                border: '1px solid var(--navy-signal)',
                backgroundColor: 'var(--obsidian-panel)',
              }}
            >
              {/* Surveillance grid overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--navy-signal) 1px, transparent 1px), linear-gradient(90deg, var(--navy-signal) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                  opacity: 0.06,
                }}
              />

              {/* Center node: YOU */}
              <div
                className="absolute font-mono text-[10px] tracking-wider text-center"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-1 mx-auto font-mono text-[10px] uppercase tracking-wider border-2"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    borderColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  YOU
                </div>
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    border: '2px solid var(--mustard-dossier)',
                    opacity: 0.3,
                  }}
                />
              </div>

              {/* Outer nodes — 12 nodes at varied positions */}
              {[
                { top: '8%', left: '44%', posts: 42, active: true },
                { top: '14%', left: '72%', posts: 18 },
                { top: '28%', left: '85%', posts: 7, active: true },
                { top: '52%', left: '88%', posts: 31 },
                { top: '74%', left: '78%', posts: 14 },
                { top: '86%', left: '56%', posts: 9 },
                { top: '82%', left: '30%', posts: 23, active: true },
                { top: '70%', left: '10%', posts: 5 },
                { top: '50%', left: '5%', posts: 11 },
                { top: '28%', left: '12%', posts: 38 },
                { top: '14%', left: '28%', posts: 17 },
                { top: '36%', left: '20%', posts: 6 },
              ].map((node, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ top: node.top, left: node.left, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="relative w-8 h-8 rounded-full flex items-center justify-center font-mono text-[9px]"
                    style={{
                      backgroundColor: 'var(--obsidian-deep)',
                      border: `1px solid ${node.active ? 'var(--mustard-dossier)' : 'var(--navy-signal)'}`,
                      color: node.active ? 'var(--mustard-dossier)' : 'var(--steel-text)',
                    }}
                  >
                    {node.posts}
                    {node.active && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          border: '1px solid var(--mustard-dossier)',
                          opacity: 0.4,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Label */}
              <div
                className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--shadow-text)' }}
              >
                LIVE NETWORK PULSE ▪ {PLACEHOLDER_OPERATIVES} NODES
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2 — Topic Categories ────────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['TOPIC CATEGORIES', '6 CHANNELS', 'CHOOSE YOUR FREQUENCY']}
            className="mb-6"
          />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            WHERE ARE YOU TRANSMITTING FROM?
          </h2>

          {/* Asymmetric masonry grid */}
          <div className="grid grid-cols-12 gap-4">

            {/* 01 — Large featured */}
            <Link
              href="/forum/topic/theories-deep-digs"
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
                    className="font-display text-3xl mb-2"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    THEORIES &amp; DEEP DIGS
                  </h3>
                  <p
                    className="font-sans text-sm mb-6"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    Unpack the lore, connect the threads, crack the cipher.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    142 THREADS ▪ 1,284 POSTS ▪ ACTIVE 2 MIN AGO
                  </span>
                  <div className="flex items-center gap-2">
                    {['#3B82F6', '#8B5CF6', '#EC4899'].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[var(--obsidian-panel)]" style={{ backgroundColor: c }} />
                    ))}
                    <span
                      className="ml-2 font-mono text-xs"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* 02 + 03 medium stacked */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {[
                {
                  num: '02',
                  name: 'CHARACTER ANALYSIS',
                  desc: 'Dissect motivations, arcs, and contradictions.',
                  stats: '98 THREADS ▪ 892 POSTS',
                  slug: 'character-analysis',
                },
                {
                  num: '03',
                  name: 'LORE DIGS & ARCHIVES',
                  desc: 'Historical record of in-world events.',
                  stats: '76 THREADS ▪ 601 POSTS',
                  slug: 'lore-digs-archives',
                },
              ].map((cat) => (
                <Link key={cat.num} href={`/forum/topic/${cat.slug}`} className="group flex-1">
                  <div
                    className="relative p-6 h-full min-h-[120px] flex flex-col justify-between transition-opacity hover:opacity-90 border-t-2"
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderTopColor: 'var(--navy-signal)',
                    }}
                  >
                    <div>
                      <div
                        className="font-mono text-xl font-bold mb-2"
                        style={{ color: 'var(--mustard-dossier)' }}
                      >
                        {cat.num}
                      </div>
                      <h3
                        className="font-display text-xl mb-1"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {cat.name}
                      </h3>
                      <p
                        className="font-sans text-xs"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {cat.desc}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest mt-4 block"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      {cat.stats}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* 04 + 05 + 06 small row */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {[
                {
                  num: '04',
                  name: 'FAN ART',
                  longName: 'FAN ART & VISUAL TRANSMISSIONS',
                  desc: 'Community-created visuals from the world of Bharatvarsh.',
                  stats: '112 THREADS ▪ 998 POSTS',
                  slug: 'fan-art-visual-transmissions',
                  badge: null,
                },
                {
                  num: '05',
                  name: 'Q&A',
                  longName: 'Q&A WITH THE AUTHOR',
                  desc: 'Direct channel to Atharva. Ask thoughtfully.',
                  stats: '24 THREADS ▪ 312 POSTS',
                  slug: 'qa-with-the-author',
                  badge: { label: 'OFFICIAL', color: 'var(--mustard-dossier)' },
                },
                {
                  num: '06',
                  name: 'SPOILER ZONE',
                  longName: 'SPOILER ZONE',
                  desc: 'Beyond Chapter 19. Mark your transmissions.',
                  stats: '42 THREADS ▪ 507 POSTS',
                  slug: 'spoiler-zone',
                  badge: { label: 'CH 19+ ONLY', color: 'var(--redaction)' },
                },
              ].map((cat) => (
                <Link key={cat.num} href={`/forum/topic/${cat.slug}`} className="group flex-1">
                  <div
                    className="relative p-5 h-full min-h-[100px] flex flex-col justify-between transition-opacity hover:opacity-90 border-t-2"
                    style={{
                      backgroundColor: 'var(--obsidian-panel)',
                      borderTopColor: 'var(--navy-signal)',
                    }}
                  >
                    {cat.badge && (
                      <span
                        className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5"
                        style={{
                          backgroundColor: cat.badge.color + '22',
                          color: cat.badge.color,
                          border: `1px solid ${cat.badge.color}`,
                          transform: 'rotate(1deg)',
                        }}
                      >
                        {cat.badge.label}
                      </span>
                    )}
                    <div>
                      <div
                        className="font-mono text-lg font-bold mb-1"
                        style={{ color: 'var(--mustard-dossier)' }}
                      >
                        {cat.num}
                      </div>
                      <h3
                        className="font-display text-base mb-1"
                        style={{ color: 'var(--bone-text)' }}
                      >
                        {cat.longName}
                      </h3>
                      <p
                        className="font-sans text-[11px]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        {cat.desc}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest mt-3 block"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      {cat.stats}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* TopicNav — real data underneath */}
          {topics.length > 0 && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--navy-signal)' }}>
              <EyebrowLabel segments={['LIVE TOPIC FEED', `${topics.length} CHANNELS ACTIVE`]} className="mb-4" />
              <nav className="flex flex-wrap gap-2">
                <Link
                  href="/forum"
                  className="px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  ALL TOPICS
                </Link>
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/forum/topic/${topic.slug}`}
                    className="px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-opacity hover:opacity-80"
                    style={{
                      border: '1px solid var(--navy-signal)',
                      color: 'var(--steel-text)',
                    }}
                  >
                    {topic.name}
                    <span className="ml-2 opacity-60">{topic.threadCount}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* ─── Section 3 — Hottest Transmissions ───────────────────────────────── */}
      <section
        id="hottest-transmissions"
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['HOTTEST TRANSMISSIONS', 'RIGHT NOW']} className="mb-6" />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            WHAT&apos;S BEING DECODED.
          </h2>

          <div className="grid grid-cols-12 gap-8">

            {/* LEFT: sticky sort filter rail */}
            <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              <div
                className="p-6 border-t-2"
                style={{
                  backgroundColor: 'var(--obsidian-panel)',
                  borderTopColor: 'var(--mustard-dossier)',
                }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-widest mb-4"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  SORT BY
                </div>
                <div className="flex flex-col gap-2">
                  {SORT_LABELS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all"
                      style={{
                        backgroundColor:
                          sort === s.value
                            ? 'var(--mustard-dossier)' + '22'
                            : 'transparent',
                        color:
                          sort === s.value
                            ? 'var(--mustard-dossier)'
                            : 'var(--shadow-text)',
                        borderLeft: `2px solid ${sort === s.value ? 'var(--mustard-dossier)' : 'transparent'}`,
                      }}
                    >
                      {sort === s.value ? '▸ ' : ''}
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Thread stats */}
                {pagination && (
                  <div
                    className="mt-6 pt-4 border-t font-mono text-[10px] uppercase tracking-widest space-y-1"
                    style={{ borderColor: 'var(--navy-signal)', color: 'var(--shadow-text)' }}
                  >
                    <div>{pagination.total} TOTAL TRANSMISSIONS</div>
                    <div>PAGE {pagination.page} OF {pagination.totalPages}</div>
                  </div>
                )}
              </div>
            </aside>

            {/* RIGHT: thread list */}
            <div className="col-span-12 lg:col-span-8">
              {isLoading ? (
                <div className="space-y-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="py-5 border-t animate-pulse"
                      style={{ borderColor: 'var(--navy-signal)' }}
                    >
                      <div className="flex gap-4">
                        <div
                          className="w-10 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: 'var(--obsidian-panel)' }}
                        />
                        <div className="flex-1 space-y-2">
                          <div
                            className="h-4 w-3/4 rounded"
                            style={{ backgroundColor: 'var(--obsidian-panel)' }}
                          />
                          <div
                            className="h-3 w-full rounded"
                            style={{ backgroundColor: 'var(--obsidian-panel)' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div
                  className="py-16 text-center font-mono text-sm uppercase tracking-widest"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  NO TRANSMISSIONS IN THIS CHANNEL YET. BE THE FIRST.
                </div>
              ) : (
                <div className="flex flex-col">
                  {threads.map((thread: ThreadListItem) => {
                    const totalReactions =
                      thread.reactionCounts.UPVOTE +
                      thread.reactionCounts.INSIGHTFUL +
                      thread.reactionCounts.FLAME -
                      thread.reactionCounts.DOWNVOTE;
                    return (
                      <div
                        key={thread.id}
                        className="py-5 border-t"
                        style={{ borderColor: 'var(--navy-signal)' }}
                      >
                        <div className="flex gap-4 items-start">

                          {/* LEFT meta */}
                          <div className="shrink-0 flex flex-col items-center gap-2 w-12">
                            {thread.tags[0] && (
                              <span
                                className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 text-center leading-tight"
                                style={{
                                  backgroundColor: 'var(--mustard-dossier)' + '22',
                                  color: 'var(--mustard-dossier)',
                                  border: '1px solid var(--mustard-dossier)',
                                  maxWidth: '48px',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {thread.tags[0].name.slice(0, 8)}
                              </span>
                            )}
                            <div
                              className="text-center"
                              style={{ color: totalReactions >= 0 ? 'var(--bone-text)' : 'var(--redaction)' }}
                            >
                              <div className="font-display text-2xl leading-none">
                                {totalReactions > 0 ? '+' : ''}{totalReactions}
                              </div>
                              <div
                                className="font-mono text-[9px] mt-0.5"
                                style={{ color: 'var(--shadow-text)' }}
                              >
                                ▲
                              </div>
                            </div>
                          </div>

                          {/* CENTER content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              {thread.isPinned && (
                                <span
                                  className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: 'var(--mustard-dossier)' + '22',
                                    color: 'var(--mustard-dossier)',
                                    border: '1px solid var(--mustard-dossier)',
                                  }}
                                >
                                  PINNED
                                </span>
                              )}
                              {thread.isLocked && (
                                <span
                                  className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: 'var(--navy-signal)' + '44',
                                    color: 'var(--shadow-text)',
                                    border: '1px solid var(--navy-signal)',
                                  }}
                                >
                                  LOCKED
                                </span>
                              )}
                            </div>
                            <h3
                              className="font-sans font-semibold text-base leading-snug mb-1"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {thread.title}
                            </h3>
                            {thread.excerpt && (
                              <p
                                className="font-sans text-sm line-clamp-1"
                                style={{ color: 'var(--shadow-text)' }}
                              >
                                {thread.excerpt}
                              </p>
                            )}
                            <div
                              className="flex items-center gap-4 mt-2 font-mono text-[10px] uppercase tracking-wider"
                              style={{ color: 'var(--shadow-text)' }}
                            >
                              <span>{thread.author.name || 'ANONYMOUS'}</span>
                              <span>{timeAgo(thread.createdAt)}</span>
                              <span>{thread.postCount} REPLIES</span>
                              <span>{thread.viewCount} VIEWS</span>
                            </div>
                          </div>

                          {/* RIGHT action */}
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <Link
                              href={`/forum/thread/${thread.id}`}
                              className="font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-opacity hover:opacity-80"
                              style={{ color: 'var(--mustard-dossier)' }}
                            >
                              JOIN TRANSMISSION →
                            </Link>
                            <button
                              className="opacity-40 hover:opacity-80 transition-opacity"
                              aria-label="Bookmark thread"
                              style={{ color: 'var(--steel-text)' }}
                            >
                              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H13V15L7 11L1 15V1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div
                  className="flex items-center justify-center gap-2 mt-8 pt-6 border-t"
                  style={{ borderColor: 'var(--navy-signal)' }}
                >
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 font-mono text-[11px] uppercase tracking-wider disabled:opacity-30 transition-opacity hover:opacity-80"
                    style={{
                      border: '1px solid var(--navy-signal)',
                      color: 'var(--steel-text)',
                    }}
                  >
                    ← PREV
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - pagination.page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 font-mono text-[11px] uppercase tracking-wider transition-all"
                        style={{
                          backgroundColor:
                            p === pagination.page
                              ? 'var(--mustard-dossier)'
                              : 'transparent',
                          color:
                            p === pagination.page
                              ? 'var(--obsidian-void)'
                              : 'var(--shadow-text)',
                          border: `1px solid ${p === pagination.page ? 'var(--mustard-dossier)' : 'var(--navy-signal)'}`,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 font-mono text-[11px] uppercase tracking-wider disabled:opacity-30 transition-opacity hover:opacity-80"
                    style={{
                      border: '1px solid var(--navy-signal)',
                      color: 'var(--steel-text)',
                    }}
                  >
                    NEXT →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4 — Featured Community Transmission ──────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel segments={['FEATURED TRANSMISSION', 'CURATED BY BHOOMI']} className="mb-6" />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            THIS WEEK&apos;S MOST DISSECTED POST.
          </h2>

          <div
            className="grid grid-cols-12 gap-0 border"
            style={{ borderColor: 'var(--navy-signal)', backgroundColor: 'var(--obsidian-panel)' }}
          >
            {/* LEFT: image */}
            <div className="col-span-12 lg:col-span-4 relative">
              <div className="relative w-full aspect-video lg:aspect-auto lg:h-full min-h-[240px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/characters/kahaan-banner.webp"
                  alt="Kahaan in his father's uniform — community fan art"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Fallback */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-widest"
                  style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                >
                  FAN ART PLACEHOLDER
                </div>
                {/* PINNED stamp */}
                <span
                  className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider px-2 py-1 z-10"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  PINNED BY AUTHOR
                </span>
              </div>
            </div>

            {/* RIGHT: content */}
            <div className="col-span-12 lg:col-span-8 p-8 flex flex-col justify-between">
              <div>
                <EyebrowLabel
                  segments={['[FAN ART]', 'POSTED 2026.04.11', '2,482 UPVOTES', '184 REPLIES']}
                  className="mb-4"
                />
                <h3
                  className="font-display text-2xl md:text-3xl mb-4"
                  style={{ color: 'var(--bone-text)' }}
                >
                  KAHAAN IN HIS FATHER&apos;S UNIFORM — A PAINTING
                </h3>
                <p
                  className="font-sans text-sm leading-relaxed mb-3"
                  style={{ color: 'var(--steel-text)' }}
                >
                  I spent three weeks on this. The posture references Chapter 7 when Kahaan
                  picks up the medal from the floor. The HUD monocle is on the left eye —
                  cyan glow, not white. The scar on the right cheek catches the light from
                  Indrapur&apos;s grid towers in the background.
                </p>
                <p
                  className="font-sans text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--steel-text)' }}
                >
                  What I wanted to capture: the weight of wearing something you didn&apos;t
                  choose. The uniform doesn&apos;t fit. It&apos;s deliberate.
                </p>

                {/* Author row */}
                <div
                  className="flex items-center gap-3 mb-6 pb-6 border-b"
                  style={{ borderColor: 'var(--navy-signal)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px]"
                    style={{ backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }}
                  >
                    FR
                  </div>
                  <div>
                    <div
                      className="font-mono text-[11px] uppercase tracking-wider"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      OP: FIELD_AGENT_RUDRA_07
                    </div>
                    <div
                      className="font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--shadow-text)' }}
                    >
                      LVL 12 ▪ VETERAN
                    </div>
                  </div>
                </div>

                {/* Top comments */}
                <div className="space-y-3 mb-6">
                  {[
                    { user: 'THEORY_WEAVER_04', text: 'The medal detail is from Ch 7 pg 3. I see you.' },
                    { user: 'MESH_NODE_WATCHER', text: 'Left eye monocle. Canon accurate. Respect.' },
                    { user: 'DOSSIER_DIGGER', text: 'That background is Indrapur\'s Grid District. The towers are exact.' },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-start pl-4 border-l-2"
                      style={{ borderColor: 'var(--navy-signal)' }}
                    >
                      <div
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-mono text-[8px]"
                        style={{
                          backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899'][i],
                          color: 'white',
                        }}
                      >
                        {c.user[0]}
                      </div>
                      <div>
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider mr-2"
                          style={{ color: 'var(--mustard-dossier)' }}
                        >
                          {c.user}
                        </span>
                        <span
                          className="font-sans text-xs"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          {c.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/forum/thread/featured"
                  className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  READ FULL TRANSMISSION →
                </Link>
                <Link
                  href="/forum/thread/featured#reply"
                  className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                  style={{
                    border: '1px solid var(--navy-signal)',
                    color: 'var(--steel-text)',
                  }}
                >
                  REPLY TO THIS THREAD
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5 — Active Operatives Rail ───────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <EyebrowLabel
            segments={['ACTIVE OPERATIVES', 'TOP CONTRIBUTORS THIS WEEK']}
            className="mb-6"
          />
          <h2
            className="font-display mb-12"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
          >
            WHO&apos;S ON PATROL.
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {OPERATIVE_CARDS.map((op) => (
              <div
                key={op.seed}
                className="shrink-0 w-48 flex flex-col border-l-4 overflow-hidden"
                style={{
                  backgroundColor: 'var(--obsidian-panel)',
                  border: `1px solid var(--navy-signal)`,
                  borderLeft: '4px solid var(--mustard-dossier)',
                  aspectRatio: '3/4',
                }}
              >
                <div className="flex-1 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/operative-${op.seed}/400/600`}
                    alt={op.username}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, var(--obsidian-panel) 0%, transparent 60%)',
                    }}
                  />
                </div>
                <div className="p-3">
                  <div
                    className="font-mono text-[9px] uppercase tracking-wider mb-1 leading-tight"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {op.username}
                  </div>
                  <div
                    className="font-mono text-[9px] uppercase tracking-wider mb-1"
                    style={{ color: 'var(--mustard-dossier)' }}
                  >
                    {op.rank}
                  </div>
                  <div
                    className="font-mono text-[8px] uppercase tracking-wider leading-tight"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    {op.posts}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 6 — Code of Conduct ──────────────────────────────────────── */}
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
                07
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

            {/* LEFT: stacked avatars */}
            <div className="col-span-12 lg:col-span-5 flex items-center justify-center lg:justify-start">
              <div className="relative h-20 flex items-center">
                {['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'].map((c, i) => (
                  <div
                    key={i}
                    className="absolute w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold"
                    style={{
                      left: `${i * 32}px`,
                      backgroundColor: c,
                      borderColor: 'var(--obsidian-deep)',
                      color: 'white',
                      zIndex: 5 - i,
                    }}
                  >
                    {['F', 'A', 'D', 'M', 'L'][i]}
                  </div>
                ))}
                <div
                  className="absolute font-mono text-[10px] uppercase tracking-widest whitespace-nowrap"
                  style={{ left: `${5 * 32 + 8}px`, color: 'var(--shadow-text)' }}
                >
                  +{PLACEHOLDER_OPERATIVES} MORE
                </div>
              </div>
            </div>

            {/* RIGHT: CTA */}
            <div className="col-span-12 lg:col-span-7">
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
                  href="#hottest-transmissions"
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
