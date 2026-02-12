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
  };
}
