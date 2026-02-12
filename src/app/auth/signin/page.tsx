/**
 * Custom Sign-In page for Bharatvarsh Forum.
 *
 * Renders a branded card with two authentication methods:
 *   1. Email magic link (via Resend / Auth.js EmailProvider)
 *   2. Google OAuth (only shown when NEXT_PUBLIC_GOOGLE_AUTH_ENABLED is set)
 *
 * Uses the Bharatvarsh design system tokens (obsidian backgrounds, mustard
 * accent, powder blue focus rings) for a seamless visual experience.
 */

'use client';

import { type FC, type FormEvent, useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ─── Constants ──────────────────────────────────────────────

const GOOGLE_AUTH_AVAILABLE =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

// ─── Inner Component (uses useSearchParams) ─────────────────

const SignInForm: FC = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/forum';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? decodeErrorMessage(errorParam) : null,
  );

  const handleEmailSignIn = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !isValidEmail(trimmed)) {
        setError('Please enter a valid email address.');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await signIn('email', {
          email: trimmed,
          callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          setError('Failed to send magic link. Please try again.');
        } else {
          setEmailSent(true);
        }
      } catch {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, callbackUrl],
  );

  const handleGoogleSignIn = useCallback(() => {
    signIn('google', { callbackUrl });
  }, [callbackUrl]);

  // ── Email sent confirmation ──

  if (emailSent) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(241, 194, 50, 0.15)' }}
        >
          <MailIcon />
        </div>
        <h2
          className="mb-2 font-display text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Check Your Inbox
        </h2>
        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          A sign-in link has been sent to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
          <br />
          Click the link in the email to continue.
        </p>
        <button
          type="button"
          onClick={() => {
            setEmailSent(false);
            setEmail('');
          }}
          className="text-sm underline transition-colors hover:no-underline"
          style={{ color: 'var(--powder-300)' }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  // ── Sign-in form ──

  return (
    <>
      {/* Error banner */}
      {error && (
        <div
          className="mb-6 rounded-md border px-4 py-3 text-sm"
          style={{
            background: 'rgba(220, 38, 38, 0.1)',
            borderColor: 'rgba(220, 38, 38, 0.3)',
            color: '#FCA5A5',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Email form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-40 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: 'var(--obsidian-900)',
              borderColor: 'var(--obsidian-600)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--powder-300)';
              e.currentTarget.style.boxShadow =
                '0 0 0 2px rgba(201, 219, 238, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--obsidian-600)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'var(--mustard-500)',
            color: 'var(--navy-900)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = 'var(--mustard-400)';
              e.currentTarget.style.boxShadow = 'var(--glow-mustard)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--mustard-500)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon />
              Sending Link...
            </>
          ) : (
            'Continue with Email'
          )}
        </button>
      </form>

      {/* Divider + Google OAuth */}
      {GOOGLE_AUTH_AVAILABLE && (
        <>
          <div className="my-6 flex items-center gap-4">
            <div
              className="h-px flex-1"
              style={{ background: 'var(--obsidian-600)' }}
            />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              or
            </span>
            <div
              className="h-px flex-1"
              style={{ background: 'var(--obsidian-600)' }}
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--obsidian-600)',
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--obsidian-700)';
              e.currentTarget.style.borderColor = 'var(--obsidian-500, #3E4557)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--obsidian-600)';
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </>
      )}
    </>
  );
};

// ─── Page Component ─────────────────────────────────────────

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--obsidian-900)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: 'var(--mustard-500)' }}
          >
            Bharatvarsh Forum
          </p>
          <h1
            className="mb-2 font-display text-3xl font-bold"
            style={{ color: 'var(--powder-300)' }}
          >
            Sign In
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Join the discussion about Bharatvarsh
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border p-8"
          style={{
            background:
              'linear-gradient(135deg, var(--obsidian-800) 0%, var(--obsidian-700) 100%)',
            borderColor: 'var(--obsidian-600)',
          }}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <SpinnerIcon />
              </div>
            }
          >
            <SignInForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p
          className="mt-6 text-center text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          By signing in you agree to the community guidelines.
          <br />
          We will never share your email.
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

/** Basic email format validation. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Map Auth.js error codes to user-friendly messages. */
function decodeErrorMessage(code: string): string {
  switch (code) {
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
      return 'There was a problem with the OAuth provider. Please try again.';
    case 'EmailSignin':
      return 'The magic link could not be sent. Please try again.';
    case 'CredentialsSignin':
      return 'Invalid credentials. Please check and try again.';
    case 'SessionRequired':
      return 'You must be signed in to access that page.';
    case 'AccessDenied':
      return 'Your account has been suspended or access was denied.';
    default:
      return 'An authentication error occurred. Please try again.';
  }
}

// ─── Inline SVG Icons ───────────────────────────────────────

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--mustard-500)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="60"
        strokeDashoffset="20"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
