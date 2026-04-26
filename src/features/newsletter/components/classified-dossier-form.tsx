'use client';

import { FC, useId } from 'react';
import { cn } from '@/shared/utils';
import type { DossierContent, DossierFormData, DossierFormErrors } from '@/types';

interface ClassifiedDossierFormProps {
  content: DossierContent;
  formData: DossierFormData;
  errors: DossierFormErrors;
  isSubmitting: boolean;
  onFieldChange: (field: keyof DossierFormData, value: string) => void;
  onFieldBlur: (field: keyof DossierFormData) => void;
  onSubmit: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Classified Chronicle variant of DossierForm.
 * Brutalist dossier aesthetic: sharp edges, IBM Plex Mono uppercase labels,
 * mustard/navy/obsidian tokens. Same props contract as DossierForm, so the
 * existing useDossierForm hook wires up unchanged. Isolated from DossierCard
 * and other DossierForm mounts.
 */
export const ClassifiedDossierForm: FC<ClassifiedDossierFormProps> = ({
  content,
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  onDismiss,
  className,
}) => {
  const nameId = useId();
  const locationId = useId();
  const phoneId = useId();
  const emailId = useId();
  const errorContainerId = useId();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  const fieldLabelClass =
    'block font-mono uppercase text-[11px] tracking-[0.16em] mb-2';
  const fieldInputClass = cn(
    'w-full px-4 py-3',
    'font-mono text-sm',
    'border transition-colors duration-150',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );
  const fieldBaseStyle: React.CSSProperties = {
    backgroundColor: 'var(--obsidian-panel)',
    color: 'var(--bone-text)',
    borderRadius: 0,
  };
  const fieldErrorClass = 'mt-2 font-mono uppercase text-[10px] tracking-[0.14em]';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-5', className)}
      noValidate
    >
      {/* Name Field */}
      <div>
        <label
          htmlFor={nameId}
          className={fieldLabelClass}
          style={{ color: 'var(--mustard-dossier)' }}
        >
          Operative Name
        </label>
        <input
          id={nameId}
          type="text"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          onBlur={() => onFieldBlur('name')}
          disabled={isSubmitting}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          aria-invalid={!!errors.name}
          className={fieldInputClass}
          style={{
            ...fieldBaseStyle,
            borderColor: errors.name
              ? 'var(--status-alert, #dc2626)'
              : 'var(--navy-signal)',
          }}
          placeholder="First and last name"
          autoComplete="name"
        />
        {errors.name && (
          <p
            id={`${nameId}-error`}
            className={fieldErrorClass}
            style={{ color: 'var(--status-alert, #dc2626)' }}
            role="alert"
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Location Field */}
      <div>
        <label
          htmlFor={locationId}
          className={fieldLabelClass}
          style={{ color: 'var(--mustard-dossier)' }}
        >
          Last Known Location
        </label>
        <input
          id={locationId}
          type="text"
          value={formData.location}
          onChange={(e) => onFieldChange('location', e.target.value)}
          onBlur={() => onFieldBlur('location')}
          disabled={isSubmitting}
          aria-describedby={errors.location ? `${locationId}-error` : undefined}
          aria-invalid={!!errors.location}
          className={fieldInputClass}
          style={{
            ...fieldBaseStyle,
            borderColor: errors.location
              ? 'var(--status-alert, #dc2626)'
              : 'var(--navy-signal)',
          }}
          placeholder="City, Country"
          autoComplete="address-level2"
        />
        {errors.location && (
          <p
            id={`${locationId}-error`}
            className={fieldErrorClass}
            style={{ color: 'var(--status-alert, #dc2626)' }}
            role="alert"
          >
            {errors.location}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label
          htmlFor={phoneId}
          className={fieldLabelClass}
          style={{ color: 'var(--mustard-dossier)' }}
        >
          Secure Channel
        </label>
        <input
          id={phoneId}
          type="tel"
          value={formData.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
          onBlur={() => onFieldBlur('phone')}
          disabled={isSubmitting}
          aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
          aria-invalid={!!errors.phone}
          className={fieldInputClass}
          style={{
            ...fieldBaseStyle,
            borderColor: errors.phone
              ? 'var(--status-alert, #dc2626)'
              : 'var(--navy-signal)',
          }}
          placeholder="+91 98765 43210"
          autoComplete="tel"
        />
        {errors.phone && (
          <p
            id={`${phoneId}-error`}
            className={fieldErrorClass}
            style={{ color: 'var(--status-alert, #dc2626)' }}
            role="alert"
          >
            {errors.phone}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor={emailId}
          className={fieldLabelClass}
          style={{ color: 'var(--mustard-dossier)' }}
        >
          Dropbox Address
        </label>
        <input
          id={emailId}
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          onBlur={() => onFieldBlur('email')}
          disabled={isSubmitting}
          aria-describedby={
            errors.email ? `${emailId}-error` : `${emailId}-helper`
          }
          aria-invalid={!!errors.email}
          className={fieldInputClass}
          style={{
            ...fieldBaseStyle,
            borderColor: errors.email
              ? 'var(--status-alert, #dc2626)'
              : 'var(--navy-signal)',
          }}
          placeholder="operative@example.com"
          autoComplete="email"
        />
        {errors.email ? (
          <p
            id={`${emailId}-error`}
            className={fieldErrorClass}
            style={{ color: 'var(--status-alert, #dc2626)' }}
            role="alert"
          >
            {errors.email}
          </p>
        ) : (
          <p
            id={`${emailId}-helper`}
            className="mt-2 font-mono uppercase text-[10px] tracking-[0.14em]"
            style={{ color: 'var(--steel-text)' }}
          >
            {content.emailHelper}
          </p>
        )}
      </div>

      {/* Submit Button — brutalist mustard CTA matching home hero */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 font-mono uppercase transition-colors mt-2 disabled:cursor-not-allowed"
        style={{
          background: isSubmitting
            ? 'var(--navy-signal)'
            : 'var(--mustard-dossier)',
          color: isSubmitting ? 'var(--steel-text)' : 'var(--obsidian-void)',
          padding: '0.9rem 1.5rem',
          fontSize: '12px',
          letterSpacing: '0.18em',
          borderRadius: 0,
          border: 'none',
          opacity: isSubmitting ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (isSubmitting) return;
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--mustard-hot)';
        }}
        onMouseLeave={(e) => {
          if (isSubmitting) return;
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--mustard-dossier)';
        }}
      >
        {isSubmitting ? 'DISPATCHING...' : `${content.submitButton} →`}
      </button>

      {/* Maybe Later — explicit dismiss, non-blocking UX */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="font-mono uppercase text-[11px] tracking-[0.16em] transition-colors self-center mt-1"
          style={{
            color: 'var(--steel-text)',
            background: 'transparent',
            border: 'none',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--bone-text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--steel-text)';
          }}
        >
          Maybe Later — Keep Browsing
        </button>
      )}

      {/* Privacy Note */}
      <p
        className="font-mono uppercase text-[10px] tracking-[0.14em] text-center"
        style={{ color: 'var(--steel-text)' }}
      >
        {content.privacyNote}
      </p>

      {/* Live region for screen readers */}
      <div
        id={errorContainerId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {Object.values(errors).filter(Boolean).join('. ')}
      </div>
    </form>
  );
};

export default ClassifiedDossierForm;
