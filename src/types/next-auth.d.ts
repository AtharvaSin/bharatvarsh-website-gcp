/**
 * Type augmentations for next-auth v5 (Auth.js).
 * Extends the default Session type with Bharatvarsh-specific fields.
 *
 * NOTE: We intentionally do NOT augment the `User` interface here.
 * Adding required fields (like `role`) to User would force the PrismaAdapter
 * to satisfy those fields on AdapterUser, causing a type mismatch between
 * `@auth/prisma-adapter`'s `@auth/core` and `next-auth`'s bundled copy.
 * Instead, we cast the user object inside the session callback.
 */

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string; // UserRole enum value at runtime
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
