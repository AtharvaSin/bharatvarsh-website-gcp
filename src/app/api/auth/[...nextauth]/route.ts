/**
 * Auth.js v5 catch-all route handler.
 * Delegates GET and POST requests to the NextAuth handlers defined
 * in the centralised auth configuration at @/server/auth.
 */

export const runtime = 'nodejs';

import { handlers } from '@/server/auth';

export const { GET, POST } = handlers;
