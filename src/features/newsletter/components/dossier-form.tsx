'use client';

import { FC, useId } from 'react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import type { DossierContent, DossierFormData, DossierFormErrors } from '@/types';

interface DossierFormProps {
  content: DossierContent;
  formData: DossierFormData;
  errors: DossierFormErrors;
  isSubmitting: boolean;
  onFieldChange: (field: keyof DossierFormData, value: string) => void;
  onFieldBlur: (field: keyof DossierFormData) => void;
  onSubmit: () => void;
  className?: string;
}

export const DossierForm: FC<DossierFormProps> = ({
  content,
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  className,
}) => {
  const nameId = useId();
  const locationId = useId();
  const emailId = useId();
  const errorContainerId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
      noValidate
    >
      {/* Form Title */}
      <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {content.expandedTitle}
      </h4>

      {/* Name Field */}
      <div>
        <label
          htmlFor={nameId}
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Name
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
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-[var(--obsidian-800)] text-[var(--text-primary)]',
            'border transition-colors duration-150',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.name
              ? 'border-[var(--status-alert)] focus:border-[var(--status-alert)] focus:ring-[var(--status-alert)]'
              : 'border-[var(--obsidian-600)] focus:border-[var(--powder-500)] focus:ring-[var(--powder-500)]'
          )}
          placeholder="Your name"
        />
        {errors.name && (
          <p
            id={`${nameId}-error`}
            className="mt-1.5 text-sm text-[var(--status-alert)]"
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
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Location (City, Country)
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
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-[var(--obsidian-800)] text-[var(--text-primary)]',
            'border transition-colors duration-150',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.location
              ? 'border-[var(--status-alert)] focus:border-[var(--status-alert)] focus:ring-[var(--status-alert)]'
              : 'border-[var(--obsidian-600)] focus:border-[var(--powder-500)] focus:ring-[var(--powder-500)]'
          )}
          placeholder="City, Country"
        />
        {errors.location && (
          <p
            id={`${locationId}-error`}
            className="mt-1.5 text-sm text-[var(--status-alert)]"
            role="alert"
          >
            {errors.location}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Email
        </label>
        <input
          id={emailId}
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          onBlur={() => onFieldBlur('email')}
          disabled={isSubmitting}
          aria-describedby={errors.email ? `${emailId}-error` : `${emailId}-helper`}
          aria-invalid={!!errors.email}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-[var(--obsidian-800)] text-[var(--text-primary)]',
            'border transition-colors duration-150',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.email
              ? 'border-[var(--status-alert)] focus:border-[var(--status-alert)] focus:ring-[var(--status-alert)]'
              : 'border-[var(--obsidian-600)] focus:border-[var(--powder-500)] focus:ring-[var(--powder-500)]'
          )}
          placeholder="your.email@example.com"
        />
        {errors.email ? (
          <p
            id={`${emailId}-error`}
            className="mt-1.5 text-sm text-[var(--status-alert)]"
            role="alert"
          >
            {errors.email}
          </p>
        ) : (
          <p
            id={`${emailId}-helper`}
            className="mt-1.5 text-xs text-[var(--text-muted)]"
          >
            {content.emailHelper}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full min-h-[48px]"
      >
        {content.submitButton}
      </Button>

      {/* Privacy Note */}
      <p className="text-xs text-[var(--text-muted)] text-center pt-2">
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

export default DossierForm;
