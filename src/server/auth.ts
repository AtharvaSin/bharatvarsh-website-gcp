/**
 * Auth.js v5 (NextAuth) configuration for Bharatvarsh Forum.
 *
 * - Database-backed sessions via PrismaAdapter
 * - Email magic-link authentication (Resend HTTP API)
 * - Optional Google OAuth provider
 * - Role-based session augmentation (UserRole enum)
 * - Ban enforcement at sign-in time
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import ResendProvider from 'next-auth/providers/resend';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/server/db';

/**
 * Thirty days expressed in seconds -- used for session maxAge.
 */
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

const RESEND_FROM = 'Bharatvarsh Forum <noreply@welcometobharatvarsh.com>';

/**
 * Send a magic-link email via the Resend HTTP API.
 * Uses fetch instead of nodemailer SMTP to avoid TLS transport
 * issues inside the Turbopack server runtime.
 */
async function sendVerificationRequest({
  identifier: email,
  url,
}: {
  identifier: string;
  url: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email],
      subject: 'Sign in to Bharatvarsh Forum',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1f2e;">Sign in to Bharatvarsh Forum</h2>
          <p style="color: #555; line-height: 1.6;">
            Click the button below to sign in. This link expires in 24 hours.
          </p>
          <a href="${url}"
             style="display: inline-block; background: #d4a843; color: #1a1f2e;
                    padding: 12px 24px; border-radius: 6px; text-decoration: none;
                    font-weight: 600; margin: 16px 0;">
            Sign In
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            If you did not request this email, you can safely ignore it.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

/**
 * Build the NextAuth configuration object.
 * Google OAuth is only included when both GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET are present in the environment so the app
 * can run without OAuth configured.
 */
function buildConfig(): NextAuthConfig {
  console.log('[AUTH_DEBUG] Building Auth.js config...');
  console.log('[AUTH_DEBUG] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
  console.log('[AUTH_DEBUG] AUTH_SECRET present:', !!process.env.AUTH_SECRET);
  console.log('[AUTH_DEBUG] NEXTAUTH_SECRET present:', !!process.env.NEXTAUTH_SECRET);
  console.log('[AUTH_DEBUG] GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('[AUTH_DEBUG] NEXTAUTH_URL present:', !!process.env.NEXTAUTH_URL);
  console.log('[AUTH_DEBUG] AUTH_URL present:', !!process.env.AUTH_URL);
  console.log('[AUTH_DEBUG] AUTH_TRUST_HOST:', process.env.AUTH_TRUST_HOST);

  // Fire-and-forget DB check (async)
  checkDbConnection().catch(console.error);

  const providers: NextAuthConfig['providers'] = [
    ResendProvider({
      id: 'email', // Explicitly set ID to match sign-in page 'email' provider
      apiKey: process.env.RESEND_API_KEY,
      from: RESEND_FROM,
      sendVerificationRequest,
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  return {
    // Use `as any` to work around version mismatch between
    // @auth/prisma-adapter's @auth/core and next-auth's bundled copy.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,

    // Explicitly trust the host (required for Cloud Run/Docker)
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    basePath: '/api/auth',

    providers,

    session: {
      strategy: 'database',
      maxAge: THIRTY_DAYS_IN_SECONDS,
      updateAge: 24 * 60 * 60, // refresh session token every 24 h
    },

    pages: {
      signIn: '/auth/signin',
    },

    callbacks: {
      /**
       * Attach the database user's `id` and `role` to the client-visible
       * session object so downstream components/API routes can authorise
       * without an additional DB round-trip.
       */
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;

          // The Prisma User model includes `role` but the default Auth.js
          // User type does not. We fetch it via a lightweight cast.
          const dbUser = user as unknown as { role: string };
          session.user.role = dbUser.role;
        }
        return session;
      },
    },

    events: {
      /**
       * Enforce bans at sign-in time.
       * If a user has an active ban (permanent or not-yet-expired), throw an
       * error to prevent the session from being created.
       */
      async signIn({ user }) {
        if (!user?.id) return;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { bannedAt: true, bannedUntil: true, bannedReason: true },
        });

        if (!dbUser?.bannedAt) return;

        const isPermanentBan = !dbUser.bannedUntil;
        const isBanActive =
          dbUser.bannedUntil && dbUser.bannedUntil > new Date();

        if (isPermanentBan || isBanActive) {
          const reason = dbUser.bannedReason ?? 'No reason provided';
          throw new Error(
            `Your account has been suspended. Reason: ${reason}`,
          );
        }
      },
    },
    debug: true, // Enable debug logs to troubleshoot OAuth issues
    trustHost: true, // Trust the host header (critical for Cloud Run / Vercel alike)
    cookies: {
      pkceCodeVerifier: {
        name: '__Secure-authjs.pkce.code_verifier',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: true,
        },
      },
    },
  };
}

export const { auth, handlers, signIn, signOut } = NextAuth(buildConfig());

export const { GET, POST } = handlers;

// Debug helper
async function checkDbConnection() {
  try {
    console.log('[AUTH_DEBUG] Testing DB connection...');
    const userCount = await prisma.user.count();
    console.log(`[AUTH_DEBUG] DB Connection Successful! Found ${userCount} users.`);
    return true;
  } catch (error: any) {
    console.error('[AUTH_DEBUG] DB Connection FAILED:', error.message);
    if (error.code) console.error('[AUTH_DEBUG] DB Error Code:', error.code);
    return false;
  }
}
