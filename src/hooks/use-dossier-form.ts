'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { DossierState, DossierFormData, DossierFormErrors, LeadApiResponse } from '@/types';

const RESEND_COOLDOWN_SECONDS = 30;
const STORAGE_KEY = 'bharatvarsh_dossier_last_submit';
const STORAGE_EMAIL_KEY = 'bharatvarsh_dossier_email';

interface UseDossierFormOptions {
  initialState?: DossierState;
}

interface UseDossierFormReturn {
  state: DossierState;
  formData: DossierFormData;
  errors: DossierFormErrors;
  resendCountdown: number;
  submittedEmail: string | null;
  setField: (field: keyof DossierFormData, value: string) => void;
  validateField: (field: keyof DossierFormData) => boolean;
  validateAll: () => boolean;
  submit: () => Promise<void>;
  resend: () => Promise<void>;
  reset: () => void;
  expand: () => void;
  collapse: () => void;
  setVerified: () => void;
}

/**
 * Validates email format using a simple regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Custom hook for managing dossier form state and validation
 * Includes mock submission for UI-only implementation
 */
export function useDossierForm(options: UseDossierFormOptions = {}): UseDossierFormReturn {
  const { initialState = 'idle' } = options;

  const [state, setState] = useState<DossierState>(initialState);
  const [formData, setFormData] = useState<DossierFormData>({
    name: '',
    location: '',
    email: '',
  });
  const [errors, setErrors] = useState<DossierFormErrors>({});
  const [resendCountdown, setResendCountdown] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start the resend countdown timer
   */
  const startCountdown = useCallback(() => {
    setResendCountdown(RESEND_COOLDOWN_SECONDS);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Check for existing countdown on mount (from localStorage)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lastSubmit = localStorage.getItem(STORAGE_KEY);
    if (lastSubmit) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSubmit)) / 1000);
      const remaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);

      if (remaining > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial localStorage sync
        setResendCountdown(remaining);

        countdownIntervalRef.current = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Set a form field value
   */
  const setField = useCallback((field: keyof DossierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof DossierFormData): boolean => {
    const value = formData[field].trim();
    let error: string | undefined;

    switch (field) {
      case 'name':
        if (!value) {
          error = 'Please enter your name.';
        } else if (value.length < 2) {
          error = 'Name must be at least 2 characters.';
        }
        break;

      case 'location':
        if (!value) {
          error = 'Please enter your location.';
        } else if (!value.includes(',')) {
          error = 'Please enter as: City, Country';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Please enter your email.';
        } else if (!isValidEmail(value)) {
          error = 'Please enter a valid email address.';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  }, [formData]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    const nameValid = validateField('name');
    const locationValid = validateField('location');
    const emailValid = validateField('email');
    return nameValid && locationValid && emailValid;
  }, [validateField]);

  /**
   * Submit form to API
   */
  const submit = useCallback(async (): Promise<void> => {
    if (!validateAll()) return;

    setState('submitting');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          location: formData.location.trim(),
          email: formData.email.toLowerCase().trim(),
          source: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
        }),
      });

      const data: LeadApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // Handle error cases
        toast.error('Submission failed', {
          description: data.error || 'Something went wrong. Please try again.',
        });
        setState('expanded');
        return;
      }

      // Success - store submission time and email
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        localStorage.setItem(STORAGE_EMAIL_KEY, formData.email.toLowerCase().trim());
      }

      setSubmittedEmail(formData.email);
      setState('submitted');
      startCountdown();

      toast.success('Verification email sent!', {
        description: 'Please check your inbox and click the verification link.',
      });

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
      setState('expanded');
    }
  }, [validateAll, formData, startCountdown]);

  /**
   * Resend verification email
   */
  const resend = useCallback(async (): Promise<void> => {
    if (resendCountdown > 0) return;

    // Get stored email or use current form email
    const emailToResend = submittedEmail ||
      (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_EMAIL_KEY) : null) ||
      formData.email;

    if (!emailToResend) {
      toast.error('No email address', {
        description: 'Please submit the form first.',
      });
      return;
    }

    setState('submitting');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim() || 'Reader',
          location: formData.location.trim() || 'Unknown, Location',
          email: emailToResend.toLowerCase().trim(),
          source: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
        }),
      });

      const data: LeadApiResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error('Resend failed', {
          description: data.error || 'Something went wrong. Please try again.',
        });
        setState('submitted');
        return;
      }

      toast.success('Verification email resent!', {
        description: 'Please check your inbox.',
      });

      // Store new submission time
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }

      setState('submitted');
      startCountdown();

    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
      setState('submitted');
    }
  }, [resendCountdown, startCountdown, submittedEmail, formData]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setState('idle');
    setFormData({ name: '', location: '', email: '' });
    setErrors({});
    setSubmittedEmail(null);
  }, []);

  /**
   * Expand the form
   */
  const expand = useCallback(() => {
    if (state === 'idle') {
      setState('expanded');
    }
  }, [state]);

  /**
   * Collapse the form back to idle
   */
  const collapse = useCallback(() => {
    if (state === 'expanded') {
      setState('idle');
      setErrors({});
    }
  }, [state]);

  /**
   * Set state to verified (called when URL has ?verified=success)
   */
  const setVerified = useCallback(() => {
    setState('verified');
  }, []);

  return {
    state,
    formData,
    errors,
    resendCountdown,
    submittedEmail,
    setField,
    validateField,
    validateAll,
    submit,
    resend,
    reset,
    expand,
    collapse,
    setVerified,
  };
}

export default useDossierForm;
