'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';

// Shape accepted by the modal — a projection of lore-items.json character records.
export interface CharacterDossierItem {
  id: string;
  name: string;
  nameDevanagari?: string;
  tagline?: string;
  description?: string;
  subtype?: string;
  classification?: 'declassified' | 'classified' | string;
  media?: { card?: string; banner?: string };
}

interface CharacterDossierModalProps {
  item: CharacterDossierItem | null;
  onClose: () => void;
}

// Maps lore-items.json classification values to the S-tier vocabulary used
// across the website (Bhoomi vectors, timeline page) so stamps stay consistent.
function tierFromClassification(classification?: string): 'S1' | 'S2' {
  return classification === 'classified' ? 'S2' : 'S1';
}

export function CharacterDossierModal({ item, onClose }: CharacterDossierModalProps) {
  // SSR safety: mount portal only after hydration so createPortal has a real target.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open so the viewport behind the modal can't drift.
  // When we close, we restore the previous inline value so we don't clobber
  // anything the rest of the app may have set.
  useEffect(() => {
    if (!item) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [item]);

  // ESC to close.
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item || !mounted) return null;

  const tier = tierFromClassification(item.classification);
  const bannerSrc =
    item.media?.banner ??
    item.media?.card ??
    `https://picsum.photos/seed/${item.id}-dossier/1600/900`;

  // Render via React Portal directly into document.body so ancestor transforms
  // (e.g. atmospheric effects in LayoutProvider) can't capture `position: fixed`.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`dossier-${item.id}-title`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--obsidian-void) 88%, transparent)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto border flex flex-col"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderColor: 'var(--mustard-dossier)',
          boxShadow: '0 0 80px rgba(0,0,0,0.75), 0 0 40px rgba(241,194,50,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip — matches the /bhoomi panel language */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--navy-signal)' }}
        >
          <EyebrowLabel
            segments={[
              'OPERATIVE DOSSIER',
              tier === 'S2' ? 'TIER S2 — CLASSIFIED' : 'TIER S1 — DECLASSIFIED',
              item.id.toUpperCase(),
            ]}
          />
          <button
            onClick={onClose}
            aria-label="Close dossier and return to Who Was Watching"
            className="font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1 border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--navy-signal)',
              color: 'var(--shadow-text)',
            }}
          >
            CLOSE FILE [ESC]
          </button>
        </div>

        {/* Banner */}
        <div
          className="relative w-full flex-shrink-0"
          style={{ aspectRatio: '16 / 7', backgroundColor: 'var(--obsidian-void)' }}
        >
          <Image
            src={bannerSrc}
            alt={`${item.name} — dossier banner`}
            fill
            sizes="(min-width: 900px) 900px, 100vw"
            className="object-cover"
          />
          {/* Gradient fade so the name below stays legible on any portrait */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 40%, var(--obsidian-deep) 100%)',
            }}
          />
          {/* Devanagari watermark */}
          {item.nameDevanagari && (
            <div
              aria-hidden="true"
              className="absolute right-6 top-6 pointer-events-none select-none"
              style={{
                fontFamily: 'var(--font-devanagari)',
                fontSize: '5rem',
                color: 'var(--bone-text)',
                opacity: 0.18,
                lineHeight: 1,
              }}
            >
              {item.nameDevanagari}
            </div>
          )}
          {/* Tier stamp on the banner, top-left */}
          <div
            className="absolute top-6 left-6 font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border"
            style={{
              borderColor:
                tier === 'S2' ? 'var(--redaction)' : 'var(--mustard-dossier)',
              color: tier === 'S2' ? 'var(--redaction)' : 'var(--mustard-dossier)',
              backgroundColor: 'color-mix(in srgb, var(--obsidian-void) 70%, transparent)',
            }}
          >
            {tier === 'S2' ? 'CLASSIFIED ▪ LVL 2' : 'DECLASSIFIED ▪ LVL 1'}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 flex flex-col gap-5">
          {/* Name + subtype row */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2
                id={`dossier-${item.id}-title`}
                className="font-display uppercase tracking-wide leading-[0.9]"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--bone-text)' }}
              >
                {item.name}
              </h2>
              {item.subtype && (
                <div
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  {item.subtype}
                </div>
              )}
            </div>
            {item.nameDevanagari && (
              <div
                className="text-4xl"
                style={{
                  fontFamily: 'var(--font-devanagari)',
                  color: 'var(--powder-signal)',
                }}
              >
                {item.nameDevanagari}
              </div>
            )}
          </div>

          {/* Tagline */}
          {item.tagline && (
            <p
              className="font-serif italic text-lg leading-relaxed"
              style={{ color: 'var(--powder-signal)' }}
            >
              &ldquo;{item.tagline}&rdquo;
            </p>
          )}

          {/* Description */}
          {item.description && (
            <div
              className="pt-4 border-t"
              style={{ borderColor: 'var(--navy-signal)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: 'var(--declassified)', fontSize: 10 }}>&#9679;</span>
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--declassified)' }}
                >
                  FILE SUMMARY
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--bone-text)' }}
              >
                {item.description}
              </p>
            </div>
          )}

          {/* CTA row */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href={`/lore?item=${item.id}`}
              className="font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-3 border transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--mustard-dossier)',
                borderColor: 'var(--mustard-dossier)',
                color: 'var(--obsidian-void)',
              }}
            >
              OPEN FULL LORE FILE &rarr;
            </Link>
            <button
              onClick={onClose}
              className="font-mono uppercase text-[11px] tracking-[0.18em] px-5 py-3 border transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--navy-signal)',
                color: 'var(--bone-text)',
              }}
            >
              RETURN TO THE LEDGER
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
