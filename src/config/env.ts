/**
 * Centralized environment variable validation.
 * Import this in server-only modules to get validated env vars.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Optionally require an env var — returns undefined if missing.
 * Use for env vars that are only needed in later phases.
 */
function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

/** Server-side env vars (only call from server modules) */
export function getServerEnv() {
  return {
    airtable: {
      apiKey: requireEnv('AIRTABLE_API_KEY'),
      baseId: requireEnv('AIRTABLE_BASE_ID'),
      tableId: requireEnv('AIRTABLE_TABLE_ID'),
    },
    resend: {
      apiKey: requireEnv('RESEND_API_KEY'),
    },
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

    /** Forum: Database (Phase 1) — optional until forum is active */
    database: {
      url: optionalEnv('DATABASE_URL'),
    },

    /** Forum: Authentication (Phase 2) */
    auth: {
      secret: optionalEnv('NEXTAUTH_SECRET'),
      url: optionalEnv('NEXTAUTH_URL'),
      googleClientId: optionalEnv('GOOGLE_CLIENT_ID'),
      googleClientSecret: optionalEnv('GOOGLE_CLIENT_SECRET'),
    },

    /** Forum: AI Moderation (Phase 5) */
    vertexAi: {
      project: optionalEnv('VERTEX_AI_PROJECT'),
      location: optionalEnv('VERTEX_AI_LOCATION'),
    },
  };
}
