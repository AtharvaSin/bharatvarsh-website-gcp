'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EyebrowLabel } from '@/shared/ui';
import { ChatInterface } from '@/components/bhoomi/chat-interface';
import loreData from '@/content/data/lore-items.json';

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
// Static transcript stubs for Section 3
// --------------------------------------------------------------------------
interface TranscriptMsg {
  id: string;
  role: 'bhoomi' | 'user';
  text: string;
  hasRedaction?: boolean;
  hasChips?: boolean;
}

const TRANSCRIPT_MESSAGES: TranscriptMsg[] = [
  {
    id: 'b1',
    role: 'bhoomi',
    text: 'Session established. Your clearance level has been verified. I have seventeen indexed case files matching your profile. Ask carefully.',
  },
  {
    id: 'u1',
    role: 'user',
    text: 'What happened at the Indrapur Assembly Hall on the night of Case #0042?',
  },
  {
    id: 'b2',
    role: 'bhoomi',
    text: 'The Assembly Hall records for that date are partially declassified. The primary incident occurred at 22:41 IST. What follows is on record:',
    hasRedaction: true,
  },
  {
    id: 'u2',
    role: 'user',
    text: 'Who authorized the redaction of the third witness deposition?',
  },
  {
    id: 'b3',
    role: 'bhoomi',
    text: 'That authorization signature belongs to a clearance level above your current access. Requesting an upgrade is possible through the standard protocol.',
    hasChips: true,
  },
  {
    id: 'b4',
    role: 'bhoomi',
    text: 'Session logged. If you require further context, I recommend consulting Chapter 14: The Mirror Room.',
  },
];

const TRANSCRIPT_SESSIONS = [
  { id: 'ses1', visitor: 'VISITOR_07X4', date: '2026.04.11', case: 'CASE #0042', level: 'LVL 1', active: true },
  { id: 'ses2', visitor: 'VISITOR_12F2', date: '2026.04.09', case: 'CASE #0017', level: 'LVL 2', active: false },
  { id: 'ses3', visitor: 'VISITOR_03B8', date: '2026.04.07', case: 'MESH QUERY', level: 'LVL 1', active: false },
  { id: 'ses4', visitor: 'VISITOR_91A0', date: '2026.04.04', case: 'CASE #0055', level: 'LVL 3', active: false },
  { id: 'ses5', visitor: 'VISITOR_77C1', date: '2026.04.01', case: 'CASE #0042', level: 'LVL 1', active: false },
];

// --------------------------------------------------------------------------
// BhoomiPage
// --------------------------------------------------------------------------
const BhoomiPage: FC = () => {
  const characters = getCharacters().slice(0, 6);

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
            {/* Concentric pulsing rings behind glyph */}
            <div className="relative flex items-center justify-center">
              {/* Ring 3 — outermost */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 380,
                  height: 380,
                  borderColor: 'var(--navy-signal)',
                  opacity: 0.12,
                }}
                aria-hidden="true"
              />
              {/* Ring 2 */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 300,
                  height: 300,
                  borderColor: 'var(--mustard-dossier)',
                  opacity: 0.1,
                  animationDelay: '0.4s',
                }}
                aria-hidden="true"
              />
              {/* Ring 1 — innermost */}
              <span
                className="absolute rounded-full border animate-pulse pointer-events-none"
                style={{
                  width: 230,
                  height: 230,
                  borderColor: 'var(--navy-signal)',
                  opacity: 0.15,
                  animationDelay: '0.8s',
                }}
                aria-hidden="true"
              />

              {/* Giant Devanagari glyph */}
              <span
                className="font-devanagari leading-none select-none relative z-10"
                style={{
                  fontSize: 'clamp(12rem, 22vw, 22rem)',
                  color: 'var(--mustard-dossier)',
                  textShadow: '0 0 60px rgba(51,99,153,0.6), 0 0 30px rgba(241,194,50,0.2)',
                }}
                aria-label="Bhoomi in Devanagari script"
              >
                भूमि
              </span>
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

          {/* Row 1: large (5) + medium (3) + medium (4) */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* 01 — Large featured */}
            <div
              className="col-span-12 lg:col-span-5 border-t p-6 relative flex flex-col justify-between min-h-[200px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              {/* Lock stamp */}
              <span
                className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
                style={{
                  borderColor: 'var(--redaction)',
                  color: 'var(--redaction)',
                }}
              >
                LEVEL 4 REQUIRED
              </span>
              <div>
                <div
                  className="font-mono text-3xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  01
                </div>
                <p
                  className="font-display text-xl uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  WHO KILLED KAHAAN&rsquo;S FATHER?
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>

            {/* 02 */}
            <div
              className="col-span-12 lg:col-span-3 border-t p-6 relative flex flex-col justify-between min-h-[200px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <div>
                <div
                  className="font-mono text-3xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  02
                </div>
                <p
                  className="font-display text-xl uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  WHAT IS THE MESH?
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>

            {/* 03 */}
            <div
              className="col-span-12 lg:col-span-4 border-t p-6 relative flex flex-col justify-between min-h-[200px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <div>
                <div
                  className="font-mono text-3xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  03
                </div>
                <p
                  className="font-display text-xl uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  EXPLAIN CASE FILE #0042
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: small (2) + small (2) + small (2) = 6 total small cards using flex  */}
          <div className="grid grid-cols-12 gap-4">
            {/* 04 */}
            <div
              className="col-span-12 sm:col-span-6 lg:col-span-4 border-t p-6 relative flex flex-col justify-between min-h-[160px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <div>
                <div
                  className="font-mono text-2xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  04
                </div>
                <p
                  className="font-display text-lg uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  WHO IS AKAKPEN?
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>

            {/* 05 */}
            <div
              className="col-span-12 sm:col-span-6 lg:col-span-4 border-t p-6 relative flex flex-col justify-between min-h-[160px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <div>
                <div
                  className="font-mono text-2xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  05
                </div>
                <p
                  className="font-display text-lg uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  WHAT DID THE 1850 DIVERGENCE CHANGE?
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>

            {/* 06 */}
            <div
              className="col-span-12 sm:col-span-6 lg:col-span-4 border-t p-6 relative flex flex-col justify-between min-h-[160px]"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--navy-signal)',
              }}
            >
              <div>
                <div
                  className="font-mono text-2xl font-bold mb-3"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  06
                </div>
                <p
                  className="font-display text-lg uppercase tracking-wide"
                  style={{ color: 'var(--bone-text)' }}
                >
                  DECRYPT LEAK-0017
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  RUN VECTOR &rarr;
                </span>
              </div>
            </div>
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
