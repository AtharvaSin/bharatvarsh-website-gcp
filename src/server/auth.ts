/**
 * Auth.js v5 (NextAuth) configuration for Bharatvarsh Forum.
 *
 * - Database-backed sessions via PrismaAdapter
 * - Email magic-link authentication (Resend SMTP)
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
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/server/db';

/**
 * Thirty days expressed in seconds -- used for session maxAge.
 */
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

/**
 * Build the NextAuth configuration object.
 * Google OAuth is only included when both GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET are present in the environment so the app
 * can run without OAuth configured.
 */
function buildConfig(): NextAuthConfig {
  const providers: NextAuthConfig['providers'] = [
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: 'Bharatvarsh Forum <noreply@bharatvarsh.com>',
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
  };
}

export const { auth, handlers, signIn, signOut } = NextAuth(buildConfig());
