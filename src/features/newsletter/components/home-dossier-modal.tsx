'use client';

import { FC, useEffect } from 'react';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { useDossierForm } from '@/features/newsletter/hooks/use-dossier-form';
import { DossierForm } from '@/features/newsletter/components/dossier-form';
import novelData from '@/content/data/novel.json';
import type { DossierContent } from '@/types';

export interface HomeDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen Classified Chronicle modal for the Home page lead magnet.
 * Wraps the existing DossierForm + useDossierForm hook; zero backend changes.
 * Body scroll lock, Escape key close, backdrop click close, mustard inset border.
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
  } = useDossierForm();

  const dossierContent = (novelData as { dossier: DossierContent }).dossier;

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape key close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (): void => {
    void submit();
  };

  const isSubmitted = state === 'submitted';
  const isSubmitting = state === 'submitting';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(15, 20, 25, 0.94)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Request first chapter dossier"
    >
      {/* Mustard inset border */}
      <div
        className="fixed inset-3 border pointer-events-none"
        style={{ borderColor: 'var(--mustard-dossier)' }}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-6 right-6 z-10 w-11 h-11 flex items-center justify-center border rounded-full transition-colors"
        style={{
          backgroundColor: 'var(--obsidian-panel)',
          borderColor: 'var(--navy-signal)',
          color: 'var(--mustard-dossier)',
        }}
        aria-label="Close dossier request form"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      {/* Content column */}
      <div className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <EyebrowLabel
              segments={['REQUEST CLEARANCE', 'FIRST CHAPTER ACCESS', 'VERIFY BY EMAIL']}
              className="justify-center mb-6"
            />
            <h2
              className="font-display leading-tight mb-4"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: 'var(--bone-text)',
              }}
            >
              UNSEAL CHAPTER ONE.
            </h2>
            <p
              className="text-base leading-relaxed max-w-lg mx-auto"
              style={{ color: 'var(--steel-text)' }}
            >
              Verify your email. Receive the dossier in your inbox. Download the first
              chapter directly from the confirmation page. One-time opt-in — no spam,
              no sharing.
            </p>
          </div>

          {isSubmitted ? (
            /* Success state */
            <div
              className="p-8 border text-center"
              style={{
                backgroundColor: 'var(--obsidian-panel)',
                borderColor: 'var(--mustard-dossier)',
              }}
            >
              <div
                className="font-display text-5xl mb-4"
                style={{ color: 'var(--mustard-dossier)' }}
              >
                ✓
              </div>
              <div
                className="font-mono uppercase text-lg tracking-[0.18em] mb-3"
                style={{ color: 'var(--mustard-dossier)' }}
              >
                DOSSIER DISPATCHED
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--steel-text)' }}
              >
                {submittedEmail
                  ? `Verification link sent to ${submittedEmail}. Check your inbox and click the link to unlock Chapter 1.`
                  : 'Verification link sent. Check your inbox and click the link to unlock Chapter 1.'}
              </p>
            </div>
          ) : (
            <DossierForm
              content={dossierContent}
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onFieldChange={setField}
              onFieldBlur={validateField}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDossierModal;
