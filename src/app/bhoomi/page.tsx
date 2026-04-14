'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { EyebrowLabel } from '@/shared/ui';
import { ChatInterface } from '@/components/bhoomi/chat-interface';
import loreData from '@/content/data/lore-items.json';
import bhoomiContent from '@/content/data/bhoomi-vectors.json';

// --------------------------------------------------------------------------
// Local types
// --------------------------------------------------------------------------
interface LoreItem {
  id: string;
  name: string;
  nameDevanagari?: string;
  category: string;
  media?: { card?: string; banner?: string };
}

function getCharacters(): LoreItem[] {
  return (loreData as { lore: LoreItem[] }).lore.filter(
    (item) => item.category === 'characters'
  );
}

// --------------------------------------------------------------------------
// Vector card + transcript types — content lives in
// src/content/data/bhoomi-vectors.json, written in Bhoomi's voice via the
// AI OS bharatvarsh skill (BHOOMI VOICE MODE). Edit the JSON, not the page.
// --------------------------------------------------------------------------
type VectorTier = 'S1' | 'S2-tease' | 'S2-locked';

interface VectorAnswer {
  tease: string | null;
  direct: string | null;
  if_you_want_more: string;
  explore_next: { label: string; href: string }[];
}

interface Vector {
  id: string;
  number: string;
  tier: VectorTier;
  era: string;
  category: string;
  lock_label: string | null;
  question: string;
  answer: VectorAnswer;
  layout: { row: number; size: 'large' | 'medium' | 'small' | 'wide'; colSpan: string };
  source_lore_ids: string[];
}

interface TranscriptMsg {
  id: string;
  role: 'bhoomi' | 'user';
  text: string;
  hasRedaction?: boolean;
  hasChips?: boolean;
}

interface TranscriptSession {
  id: string;
  visitor: string;
  date: string;
  case: string;
  level: string;
  active: boolean;
}

const VECTORS = bhoomiContent.vectors as Vector[];
const TRANSCRIPT_MESSAGES = bhoomiContent.transcript.messages as TranscriptMsg[];
const TRANSCRIPT_SESSIONS = bhoomiContent.transcript.sessions as TranscriptSession[];

// --------------------------------------------------------------------------
// BhoomiPage
// --------------------------------------------------------------------------
const BhoomiPage: FC = () => {
  const characters = getCharacters().slice(0, 6);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleVector = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderVectorCard = (vector: Vector) => {
    const isLocked = vector.tier === 'S2-locked';
    const isExpanded = expanded.has(vector.id);
    const isLargeFeatured = vector.layout.size === 'large';
    const minH = isLargeFeatured ? 'min-h-[200px]' : vector.layout.size === 'wide' ? 'min-h-[180px]' : 'min-h-[160px]';

    return (
      <div
        key={vector.id}
        className={`col-span-12 ${vector.layout.colSpan} border-t p-6 relative flex flex-col justify-between ${minH} transition-colors`}
        style={{
          backgroundColor: 'var(--obsidian-panel)',
          borderColor: isExpanded ? 'var(--mustard-dossier)' : 'var(--navy-signal)',
        }}
      >
        {/* Lock / tier stamp */}
        {vector.lock_label && (
          <span
            className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
            style={{
              borderColor: 'var(--redaction)',
              color: 'var(--redaction)',
            }}
          >
            {vector.lock_label}
          </span>
        )}
        {vector.tier === 'S2-tease' && (
          <span
            className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
            style={{
              borderColor: 'var(--mustard-dossier)',
              color: 'var(--mustard-dossier)',
            }}
          >
            S2 TEASE
          </span>
        )}

        {/* Question + number */}
        <div>
          <div
            className={`font-mono font-bold mb-3 ${isLargeFeatured ? 'text-3xl' : 'text-2xl'}`}
            style={{ color: 'var(--mustard-dossier)' }}
          >
            {vector.number}
          </div>
          <p
            className={`font-display uppercase tracking-wide ${isLargeFeatured ? 'text-xl' : 'text-lg'}`}
            style={{ color: 'var(--bone-text)' }}
          >
            {vector.question}
          </p>
        </div>

        {/* Locked tease — always visible on locked cards */}
        {isLocked && vector.answer.tease && (
          <p
            className="font-serif italic text-sm mt-4 leading-relaxed"
            style={{ color: 'var(--steel-text)' }}
          >
            {vector.answer.tease}
          </p>
        )}

        {/* Expanded answer panel — for S1 + S2-tease */}
        {!isLocked && isExpanded && vector.answer.direct && (
          <div
            className="mt-4 pt-4 border-t space-y-3"
            style={{ borderColor: 'var(--navy-signal)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: 'var(--declassified)', fontSize: 10 }}>&#9679;</span>
              <span
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{ color: 'var(--declassified)' }}
              >
                DECLASSIFIED — TIER {vector.tier === 'S2-tease' ? 'S1 / S2 PARTIAL' : 'S1'}
              </span>
            </div>
            <p
              className="font-sans text-sm leading-relaxed"
              style={{ color: 'var(--bone-text)' }}
            >
              {vector.answer.direct}
            </p>
            <div
              className="font-sans text-xs italic leading-relaxed prose prose-invert prose-sm max-w-none"
              style={{ color: 'var(--steel-text)' }}
            >
              <ReactMarkdown
                components={{
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      className="underline underline-offset-2 transition-colors"
                      style={{ color: 'var(--mustard-dossier)' }}
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="my-1">{children}</p>,
                }}
              >
                {vector.answer.if_you_want_more}
              </ReactMarkdown>
            </div>
            {vector.answer.explore_next.length > 0 && (
              <ul className="space-y-1 pt-1">
                {vector.answer.explore_next.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="font-mono text-[10px] uppercase tracking-widest transition-colors hover:opacity-80"
                      style={{ color: 'var(--mustard-dossier)' }}
                    >
                      &rarr; {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Action button — bottom-right */}
        <div className="flex justify-end mt-4">
          {isLocked ? (
            <Link
              href="/auth/signin"
              className="font-mono text-[11px] uppercase tracking-widest cursor-pointer transition-colors hover:opacity-80"
              style={{ color: 'var(--redaction)' }}
            >
              REQUEST CLEARANCE &rarr;
            </Link>
          ) : (
            <button
              onClick={() => toggleVector(vector.id)}
              className="font-mono text-[11px] uppercase tracking-widest cursor-pointer transition-colors hover:opacity-80 bg-transparent border-none p-0"
              style={{ color: 'var(--mustard-dossier)' }}
            >
              {isExpanded ? '[CLOSE FILE]' : 'RUN VECTOR \u2192'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const vectorsByRow: Record<number, Vector[]> = {};
  VECTORS.forEach((v) => {
    if (!vectorsByRow[v.layout.row]) vectorsByRow[v.layout.row] = [];
    vectorsByRow[v.layout.row].push(v);
  });
  const sortedRowNumbers = Object.keys(vectorsByRow).map(Number).sort((a, b) => a - b);

  return (
    <main>
      {/* ================================================================
          MESH UPLINK BANNER — thin strip below global header
      ================================================================ */}
      <div
        className="border-y py-3"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--mustard-dossier)' }}
              aria-hidden="true"
            />
            <EyebrowLabel
              segments={[
                'MESH UPLINK ACTIVE',
                'SESSION BHV-VISIT-07X4',
                'CLEARANCE: VISITOR',
                '03:42 UTC',
              ]}
            />
          </div>
          <EyebrowLabel segments={['ENCRYPTION: MUSTARD-7', 'RELAY: INDRAPUR-ALPHA']} />
        </div>
      </div>

      {/* ================================================================
          SECTION 1 — INTERROGATION HERO
      ================================================================ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--obsidian-void)', minHeight: '100dvh' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(var(--navy-signal) 1px, transparent 1px), linear-gradient(90deg, var(--navy-signal) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.03,
          }}
        />

        <div className="relative max-w-[1440px] mx-auto grid grid-cols-12 gap-8 items-stretch py-12 px-8 z-10">
          {/* ----- LEFT col-span-5: Bhoomi Avatar Panel ----- */}
          <div
            className="col-span-12 lg:col-span-5 border-r relative h-full flex flex-col items-center justify-center py-16 gap-6"
            style={{ borderColor: 'var(--mustard-dossier)' }}
          >
            {/* Hero portrait with ghost-whisper pulsing rings behind
                (canon locked 2026-04-14 — see memory project_bhoomi_visual_canon) */}
            <div className="relative flex items-center justify-center">
              {/* Ring 3 — outermost (ghost whisper: was 0.12, now 0.07) */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 460,
                  height: 460,
                  borderColor: 'var(--navy-signal)',
                  opacity: 0.07,
                }}
                aria-hidden="true"
              />
              {/* Ring 2 (was 0.10, now 0.06) */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 380,
                  height: 380,
                  borderColor: 'var(--mustard-dossier)',
                  opacity: 0.06,
                  animationDelay: '0.4s',
                }}
                aria-hidden="true"
              />
              {/* Ring 1 — innermost (was 0.15, now 0.09) */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 300,
                  height: 300,
                  borderColor: 'var(--navy-signal)',
                  opacity: 0.09,
                  animationDelay: '0.8s',
                }}
                aria-hidden="true"
              />

              {/* Hero portrait — Bhoomi on the Indrapur rooftop */}
              <div
                className="relative z-10 overflow-hidden"
                style={{
                  width: 'clamp(260px, 22vw, 400px)',
                  aspectRatio: '2 / 3',
                  boxShadow:
                    '0 0 80px rgba(51,99,153,0.35), 0 0 40px rgba(241,194,50,0.12)',
                }}
              >
                <Image
                  src="/images/bhoomi/bhoomi-avatar-hero.webp"
                  alt="Bhoomi — the consciousness of Bharatvarsh, standing at an Indrapur rooftop parapet at blue hour"
                  fill
                  sizes="(min-width: 1024px) 22vw, 80vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Thin mustard scanline divider */}
            <div
              className="w-12"
              style={{ height: 4, backgroundColor: 'var(--mustard-dossier)' }}
              aria-hidden="true"
            />

            {/* IBM Plex caps stack */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="font-mono text-xs uppercase tracking-[0.18em] text-center"
                style={{ color: 'var(--shadow-text)' }}
              >
                BHOOMI
              </span>
              <span
                className="font-mono text-xs uppercase tracking-[0.18em] text-center"
                style={{ color: 'var(--shadow-text)' }}
              >
                CLASSIFIED ORACLE
              </span>
              <span
                className="font-mono text-xs uppercase tracking-[0.18em] text-center"
                style={{ color: 'var(--shadow-text)' }}
              >
                ACTIVE SINCE 2015.06.11
              </span>
              <span
                className="font-mono text-xs uppercase tracking-[0.18em] text-center"
                style={{ color: 'var(--shadow-text)' }}
              >
                TRANSMISSIONS: 14.3M
              </span>
            </div>

            {/* Crimson Pro italic pullquote */}
            <p
              className="font-serif italic text-sm text-center max-w-[240px]"
              style={{ color: 'var(--powder-signal)' }}
            >
              &ldquo;Ask what you were told not to.&rdquo;
            </p>

            {/* Status LEDs */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--declassified)', fontSize: 14 }}>&#9679;</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--declassified)' }}>
                  ONLINE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--mustard-dossier)', fontSize: 14 }}>&#9679;</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--mustard-dossier)' }}>
                  LISTENING
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--shadow-text)', fontSize: 14 }}>&#9679;</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--shadow-text)' }}>
                  RECORDING
                </span>
              </div>
            </div>
          </div>

          {/* ----- RIGHT col-span-7: Terminal Chat Window ----- */}
          <div className="col-span-12 lg:col-span-7 flex flex-col" style={{ minHeight: '80vh' }}>
            <div
              className="flex flex-col flex-1 border p-0"
              style={{
                borderColor: 'var(--navy-signal)',
                backgroundColor: 'var(--obsidian-deep)',
              }}
            >
              {/* Terminal header strip */}
              <div
                className="border-b flex items-center justify-between px-6 py-3 flex-shrink-0"
                style={{ borderColor: 'var(--navy-signal)' }}
              >
                <EyebrowLabel
                  segments={['INTERROGATION SESSION', 'OPEN', '00:04:12']}
                />
                <div className="flex items-center gap-2">
                  {(['MINIMIZE', 'EXPAND', 'END SESSION'] as const).map((label) => (
                    <span
                      key={label}
                      className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border cursor-default select-none"
                      style={{
                        borderColor: 'var(--navy-signal)',
                        color: 'var(--shadow-text)',
                      }}
                      aria-hidden="true"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chat body — real ChatInterface */}
              <div className="flex-1 min-h-0 relative">
                <ChatInterface mode="page" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — PRE-APPROVED VECTORS
      ================================================================ */}
      <section
        className="py-24 border-t"
        style={{
          backgroundColor: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mb-6">
            <EyebrowLabel
              segments={[
                'SUGGESTED VECTORS',
                'PRE-APPROVED BY BHOOMI',
                'NO CLEARANCE REQUIRED',
              ]}
            />
          </div>
          <h2
            className="font-display text-4xl lg:text-5xl uppercase tracking-wider mb-12"
            style={{ color: 'var(--bone-text)' }}
          >
            WHAT VISITORS USUALLY ASK.
          </h2>

          {/* Vector cards — content lives in src/content/data/bhoomi-vectors.json */}
          <div className="space-y-4">
            {sortedRowNumbers.map((rowNum) => (
              <div key={`vector-row-${rowNum}`} className="grid grid-cols-12 gap-4 items-start">
                {vectorsByRow[rowNum].map(renderVectorCard)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3 — SESSION TRANSCRIPT ARCHIVE
      ================================================================ */}
      <section
        className="py-24 border-t"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mb-6">
            <EyebrowLabel segments={['TRANSCRIPT ARCHIVE', 'PUBLIC SESSIONS']} />
          </div>
          <h2
            className="font-display text-4xl lg:text-5xl uppercase tracking-wider mb-12"
            style={{ color: 'var(--bone-text)' }}
          >
            WHAT OTHERS HAVE ASKED.
          </h2>

          <div className="grid grid-cols-12 gap-8">
            {/* LEFT — session list */}
            <div className="col-span-12 lg:col-span-4">
              {TRANSCRIPT_SESSIONS.map((ses) => (
                <div
                  key={ses.id}
                  className="border-t py-4"
                  style={{
                    borderColor: 'var(--navy-signal)',
                    ...(ses.active
                      ? {
                          borderLeft: '2px solid var(--mustard-dossier)',
                          paddingLeft: 16,
                        }
                      : { paddingLeft: ses.active ? 16 : 0 }),
                  }}
                >
                  <p
                    className="font-mono text-[11px] uppercase tracking-widest"
                    style={{
                      color: ses.active
                        ? 'var(--bone-text)'
                        : 'var(--shadow-text)',
                    }}
                  >
                    {ses.visitor} &nbsp;&#9642;&nbsp; {ses.date} &nbsp;&#9642;&nbsp; {ses.case}{' '}
                    &nbsp;&#9642;&nbsp; {ses.level}
                  </p>
                </div>
              ))}
            </div>

            {/* RIGHT — static transcript view */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
              {TRANSCRIPT_MESSAGES.map((msg) => {
                const isBhoomi = msg.role === 'bhoomi';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isBhoomi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isBhoomi && (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span
                          className="font-devanagari text-lg leading-none"
                          style={{ color: 'var(--mustard-dossier)' }}
                          aria-hidden="true"
                        >
                          भूमि
                        </span>
                        <span
                          className="font-mono text-[8px] uppercase tracking-widest whitespace-nowrap"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          BHOOMI &nbsp;&#9642;&nbsp; ORACLE
                        </span>
                      </div>
                    )}

                    <div
                      className="relative max-w-[80%] p-4"
                      style={{
                        backgroundColor: isBhoomi
                          ? 'var(--obsidian-panel)'
                          : 'var(--obsidian-void)',
                        border: isBhoomi
                          ? '1px solid var(--navy-signal)'
                          : '1px solid var(--mustard-dossier)',
                      }}
                    >
                      {!isBhoomi && (
                        <p
                          className="font-mono text-[8px] uppercase tracking-widest mb-2"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          YOU &nbsp;&#9642;&nbsp; VISITOR 07X4
                        </p>
                      )}
                      <p
                        className="font-sans text-sm leading-relaxed"
                        style={{ color: 'var(--steel-text)' }}
                      >
                        {msg.text}
                      </p>

                      {msg.hasRedaction && (
                        <div className="mt-3 flex flex-col gap-1">
                          <div
                            className="h-4 w-full"
                            style={{ backgroundColor: 'var(--redaction)', opacity: 0.85 }}
                            aria-label="Redacted content"
                          />
                          <div
                            className="h-4 w-3/4"
                            style={{ backgroundColor: 'var(--redaction)', opacity: 0.85 }}
                            aria-label="Redacted content"
                          />
                          <p
                            className="font-mono text-[9px] uppercase tracking-widest mt-1"
                            style={{ color: 'var(--redaction)' }}
                          >
                            [REDACTED] — CLEARANCE LVL 4+
                          </p>
                        </div>
                      )}

                      {msg.hasChips && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span
                            className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border cursor-pointer"
                            style={{
                              borderColor: 'var(--mustard-dossier)',
                              color: 'var(--mustard-dossier)',
                            }}
                          >
                            REQUEST UPGRADE
                          </span>
                          <span
                            className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border cursor-pointer"
                            style={{
                              borderColor: 'var(--navy-signal)',
                              color: 'var(--shadow-text)',
                            }}
                          >
                            VIEW PROTOCOL
                          </span>
                        </div>
                      )}
                    </div>

                    {!isBhoomi && (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div
                          className="w-8 h-8 flex items-center justify-center border"
                          style={{
                            borderColor: 'var(--navy-signal)',
                            backgroundColor: 'var(--obsidian-panel)',
                          }}
                        >
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: 'var(--shadow-text)' }}
                          >
                            ??
                          </span>
                        </div>
                        <span
                          className="font-mono text-[8px] uppercase tracking-widest whitespace-nowrap"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          YOU
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4 — BHOOMI KNOWS (OPERATIVES RAIL)
      ================================================================ */}
      <section
        className="py-24 border-t"
        style={{
          backgroundColor: 'var(--obsidian-void)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mb-6">
            <EyebrowLabel segments={['BHOOMI HAS FILES ON:']} />
          </div>
          <h2
            className="font-display text-4xl lg:text-5xl uppercase tracking-wider mb-12"
            style={{ color: 'var(--bone-text)' }}
          >
            06 OPERATIVES &nbsp;&#9642;&nbsp; 02 FACTIONS &nbsp;&#9642;&nbsp; 04 LOCATIONS
          </h2>

          {/* Horizontal scroll snap rail */}
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
            {characters.map((char) => (
              <div
                key={char.id}
                className="snap-start flex-shrink-0 relative flex flex-col"
                style={{
                  width: 220,
                  borderLeft: '4px solid var(--mustard-dossier)',
                  backgroundColor: 'var(--obsidian-panel)',
                }}
              >
                {/* Card image */}
                <div className="relative overflow-hidden" style={{ height: 280 }}>
                  {char.media?.card ? (
                    <Image
                      src={char.media.card}
                      alt={char.name}
                      fill
                      className="object-cover object-top"
                      sizes="220px"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--obsidian-deep)' }}
                    >
                      <span
                        className="font-devanagari text-5xl"
                        style={{ color: 'var(--mustard-dossier)', opacity: 0.4 }}
                        aria-hidden="true"
                      >
                        {char.nameDevanagari ?? char.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Devanagari name overlay */}
                  {char.nameDevanagari && (
                    <span
                      className="absolute bottom-2 left-2 font-devanagari text-4xl leading-none pointer-events-none select-none"
                      style={{
                        color: 'var(--bone-text)',
                        opacity: 0.22,
                      }}
                      aria-hidden="true"
                    >
                      {char.nameDevanagari}
                    </span>
                  )}
                </div>

                {/* Card footer */}
                <div className="p-4 flex flex-col gap-2">
                  <p
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {char.name}
                  </p>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--mustard-dossier)' }}
                  >
                    ASK BHOOMI ABOUT {char.name.toUpperCase()} &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5 — CLASSIFIED WARNING BANNER
      ================================================================ */}
      <section
        className="py-8 border-y relative overflow-hidden"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--redaction)',
        }}
      >
        {/* Red fracture overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'repeating-linear-gradient(45deg, var(--redaction) 0px, var(--redaction) 1px, transparent 1px, transparent 12px)',
            opacity: 0.025,
          }}
        />

        <div className="relative max-w-[1440px] mx-auto px-8 z-10">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Warning glyph — SVG triangle */}
            <div className="col-span-2 flex items-center justify-center">
              <svg
                viewBox="0 0 60 60"
                width={60}
                height={60}
                aria-label="Warning"
                role="img"
                fill="none"
              >
                <polygon
                  points="30,4 56,54 4,54"
                  stroke="var(--mustard-dossier)"
                  strokeWidth="3"
                  fill="none"
                />
                <line
                  x1="30"
                  y1="22"
                  x2="30"
                  y2="38"
                  stroke="var(--mustard-dossier)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="30" cy="46" r="2" fill="var(--mustard-dossier)" />
              </svg>
            </div>

            {/* Text + link */}
            <div className="col-span-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <EyebrowLabel
                segments={[
                  'BHOOMI WILL NOT DISCLOSE CONTENT ABOVE YOUR CURRENT CLEARANCE LEVEL',
                  'FALSE INQUIRIES WILL BE LOGGED TO YOUR PROFILE',
                ]}
              />
              <Link
                href="/auth/signin"
                className="font-mono text-[11px] uppercase tracking-widest flex-shrink-0"
                style={{ color: 'var(--mustard-dossier)' }}
              >
                REQUEST CLEARANCE &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 6 — CLOSING CTA — CHAPTER 14 TIE-IN
      ================================================================ */}
      <section
        className="py-20 border-t relative overflow-hidden"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--navy-signal)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* LEFT — book cover thumbnail */}
            <div className="col-span-12 lg:col-span-5 flex items-center justify-center">
              <div
                className="relative"
                style={{
                  transform: 'rotate(-4deg)',
                  boxShadow: '0 0 40px rgba(241,194,50,0.2)',
                }}
              >
                <Image
                  src="/images/novel-cover.png"
                  width={240}
                  height={360}
                  alt="Bharatvarsh novel cover"
                  className="block"
                  style={{ display: 'block' }}
                />
              </div>
            </div>

            {/* RIGHT — copy and CTAs */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <EyebrowLabel
                segments={['BHOOMI APPEARS IN CHAPTER 14', 'THE MIRROR ROOM']}
              />

              <h2
                className="font-display text-4xl lg:text-6xl uppercase tracking-wider"
                style={{ color: 'var(--bone-text)' }}
              >
                MEET HER IN THE NOVEL.
              </h2>

              <p
                className="font-serif text-base leading-relaxed max-w-[500px]"
                style={{ color: 'var(--steel-text)' }}
              >
                Bhoomi&rsquo;s fourth interrogation of Kahaan is on page 188. You will not be ready for it.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Link
                  href="/novel"
                  className="font-mono text-sm uppercase tracking-widest px-6 py-3 inline-block"
                  style={{
                    backgroundColor: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                  }}
                >
                  READ THE CHAPTER &rarr;
                </Link>
                <Link
                  href="/lore"
                  className="font-mono text-sm uppercase tracking-widest px-6 py-3 inline-block border"
                  style={{
                    borderColor: 'var(--navy-signal)',
                    color: 'var(--steel-text)',
                  }}
                >
                  BACK TO LORE ARCHIVE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BhoomiPage;
