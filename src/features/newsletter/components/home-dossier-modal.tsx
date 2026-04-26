'use client';

import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { useDossierForm } from '@/features/newsletter/hooks/use-dossier-form';
import { ClassifiedDossierForm } from '@/features/newsletter/components/classified-dossier-form';
import novelData from '@/content/data/novel.json';
import type { DossierContent } from '@/types';

export interface HomeDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VERIFIED_STORAGE_KEY = 'bharatvarsh_dossier_verified';
const VERIFY_CHANNEL = 'bharatvarsh-dossier-verify';

/**
 * Classified Chronicle lead-magnet modal for the Home page.
 *
 * UX contract:
 *  - Centered popup over a blurred home page (not a full-screen takeover).
 *  - 2-column layout on desktop (narrative / form), stacked on tablet + mobile.
 *  - Responsive width: 95vw mobile → 88vw tablet → 75vw desktop (cap 1200px).
 *  - Dismiss-anytime: Escape, backdrop click, small X button, and a
 *    "Maybe Later" ghost link inside the form. User is never blocked from
 *    browsing — closing the modal does NOT cancel their submission.
 *  - Form state persists across open/close cycles within a session (the
 *    component stays mounted; visibility toggles via `display`).
 *  - Cross-tab auto-close: when the user clicks the email verification link
 *    on another tab, `/novel?verified=success` broadcasts via BroadcastChannel
 *    and writes to localStorage. This modal listens on both and closes itself.
 *
 * Zero backend changes — consumes the existing useDossierForm hook and
 * ClassifiedDossierForm (a sibling of DossierForm, leaving DossierCard mounts
 * and the old form file untouched).
 */
export const HomeDossierModal: FC<HomeDossierModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    formData,
    errors,
    submittedEmail,
    setField,
    validateField,
    submit,
    reset,
  } = useDossierForm();

  const dossierContent = (novelData as { dossier: DossierContent }).dossier;

  // Body scroll lock — only while open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape key closes from any state (form OR success)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Cross-tab verification listener — BroadcastChannel + storage fallback.
  // When /novel?verified=success fires on another tab, this tab resets and closes.
  useEffect(() => {
    const handleVerified = (): void => {
      reset();
      onClose();
    };

    const handleStorage = (e: StorageEvent): void => {
      if (e.key === VERIFIED_STORAGE_KEY && e.newValue) {
        handleVerified();
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(VERIFY_CHANNEL);
      channel.addEventListener('message', (e) => {
        if (e.data?.type === 'verified') handleVerified();
      });
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, [reset, onClose]);

  const handleSubmit = (): void => {
    void submit();
  };

  const isSubmitted = state === 'submitted';
  const isSubmitting = state === 'submitting';

  // Portal to document.body so the modal escapes any ancestor with
  // `transform`, `filter`, `perspective`, or `will-change: transform` —
  // which otherwise creates a new containing block and breaks
  // `position: fixed` positioning. HomeContent has such an ancestor.
  if (typeof document === 'undefined') return null;

  const overlay = (
    <div
      className="fixed inset-0 z-50 items-center justify-center px-4 py-6"
      style={{
        display: isOpen ? 'flex' : 'none',
        backgroundColor: 'rgba(15, 20, 25, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Request first chapter dossier"
      aria-hidden={!isOpen}
    >
      {/* Modal box — centered, responsive width, sharp edges, mustard border */}
      <div
        className="relative w-[95vw] md:w-[88vw] xl:w-[75vw] max-w-[1200px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--obsidian-panel)',
          border: '1px solid var(--mustard-dossier)',
          boxShadow:
            '0 20px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.4)',
          borderRadius: 0,
        }}
      >
        {/* Small aesthetic close X — top-right of modal box */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 inline-flex items-center justify-center transition-colors"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--mustard-dossier)',
            color: 'var(--mustard-dossier)',
            borderRadius: 0,
            fontFamily: 'var(--font-ibm-plex-mono, monospace)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--mustard-dossier)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--obsidian-void)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'transparent';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--mustard-dossier)';
          }}
          aria-label="Close dossier request"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>

        {/* Two-column grid — narrative left, form right. Stacks below lg. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT — Classified briefing narrative */}
          <div
            className="lg:col-span-5 p-8 md:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r"
            style={{
              borderColor: 'var(--navy-signal)',
              backgroundColor: 'var(--obsidian-void)',
            }}
          >
            <EyebrowLabel
              segments={[
                'REQUEST CLEARANCE',
                'FIRST CHAPTER ACCESS',
                'VERIFY BY EMAIL',
              ]}
              className="mb-5"
            />
            <h2
              className="font-display leading-[0.95] mb-5"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                color: 'var(--bone-text)',
              }}
            >
              UNSEAL
              <br />
              CHAPTER ONE.
            </h2>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: 'var(--steel-text)' }}
            >
              A one-time dossier drop. Sign the request, verify your inbox,
              and the first chapter arrives as a PDF — straight from the
              Bharatvarsh archive.
            </p>

            {/* Intel ribbon — 3 brutalist metadata rows */}
            <div
              className="flex flex-col gap-3 pt-5 mt-5 border-t"
              style={{ borderColor: 'var(--navy-signal)' }}
            >
              {[
                ['DOC TYPE', 'PDF · CHAPTER ONE'],
                ['AUTH LEVEL', 'PUBLIC RELEASE'],
                ['RETENTION', 'ONE-TIME · NO RESALE'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 font-mono uppercase text-[10px] tracking-[0.16em]"
                >
                  <span style={{ color: 'var(--mustard-dossier)' }}>
                    {label}
                  </span>
                  <span style={{ color: 'var(--bone-text)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Form or success state */}
          <div className="lg:col-span-7 p-8 md:p-10 lg:p-12">
            {isSubmitted ? (
              <div
                className="flex flex-col h-full min-h-[320px] items-center justify-center text-center"
                style={{ color: 'var(--bone-text)' }}
              >
                <div
                  className="w-14 h-14 inline-flex items-center justify-center mb-5"
                  style={{
                    border: '1px solid var(--mustard-dossier)',
                    color: 'var(--mustard-dossier)',
                    borderRadius: 0,
                  }}
                >
                  <span className="font-display text-3xl leading-none">✓</span>
                </div>
                <div
                  className="font-mono uppercase text-sm tracking-[0.22em] mb-4"
                  style={{ color: 'var(--mustard-dossier)' }}
                >
                  DOSSIER DISPATCHED
                </div>
                <p
                  className="text-sm leading-relaxed max-w-md"
                  style={{ color: 'var(--steel-text)' }}
                >
                  {submittedEmail
                    ? `Verification link sent to ${submittedEmail}.`
                    : 'Verification link sent to your inbox.'}{' '}
                  Close this window and keep exploring while we cook your
                  inbox — the chapter drops the moment you click the link.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 inline-flex items-center gap-2 font-mono uppercase transition-colors"
                  style={{
                    background: 'var(--mustard-dossier)',
                    color: 'var(--obsidian-void)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                    borderRadius: 0,
                    border: 'none',
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
                  KEEP BROWSING →
                </button>
              </div>
            ) : (
              <ClassifiedDossierForm
                content={dossierContent}
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onFieldChange={setField}
                onFieldBlur={validateField}
                onSubmit={handleSubmit}
                onDismiss={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default HomeDossierModal;
