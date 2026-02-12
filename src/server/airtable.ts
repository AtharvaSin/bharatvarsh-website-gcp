/**
 * Airtable client for lead management
 * Handles CRUD operations for the Leads table
 * Server-only module — do not import from client components.
 */

import 'server-only';
import { getServerEnv } from '@/config/env';

function getAirtableConfig() {
  const env = getServerEnv();
  return {
    apiKey: env.airtable.apiKey,
    apiUrl: `https://api.airtable.com/v0/${env.airtable.baseId}/${env.airtable.tableId}`,
  };
}

function authHeaders() {
  const { apiKey } = getAirtableConfig();
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export interface AirtableLeadRecord {
  id: string;
  fields: {
    Name: string;
    Location: string;
    Email: string;
    Verified: boolean;
    'Verification Token': string;
    'Source Page': string;
    'Created At': string;
  };
  createdTime: string;
}

export interface CreateLeadData {
  name: string;
  location: string;
  email: string;
  verificationToken: string;
  sourcePage: string;
}

/**
 * Find a lead by email address
 */
export async function findLeadByEmail(email: string): Promise<AirtableLeadRecord | null> {
  const { apiUrl } = getAirtableConfig();
  const filterFormula = encodeURIComponent(`{Email} = '${email.toLowerCase()}'`);
  const url = `${apiUrl}?filterByFormula=${filterFormula}&maxRecords=1`;

  const response = await fetch(url, { headers: authHeaders() });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records?.[0] || null;
}

/**
 * Find a lead by verification token
 */
export async function findLeadByToken(token: string): Promise<AirtableLeadRecord | null> {
  const { apiUrl } = getAirtableConfig();
  const filterFormula = encodeURIComponent(`{Verification Token} = '${token}'`);
  const url = `${apiUrl}?filterByFormula=${filterFormula}&maxRecords=1`;

  const response = await fetch(url, { headers: authHeaders() });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records?.[0] || null;
}

/**
 * Create a new lead in Airtable
 */
export async function createLead(data: CreateLeadData): Promise<AirtableLeadRecord> {
  const { apiUrl } = getAirtableConfig();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      records: [
        {
          fields: {
            'Name': data.name,
            'Location': data.location,
            'Email': data.email.toLowerCase(),
            'Verified': false,
            'Verification Token': data.verificationToken,
            'Source Page': data.sourcePage,
            'Created At': new Date().toISOString(),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const responseData = await response.json();
  return responseData.records[0];
}

/**
 * Update a lead's verification token (for re-verification)
 */
export async function updateLeadToken(
  recordId: string,
  newToken: string,
  name?: string,
  location?: string
): Promise<AirtableLeadRecord> {
  const { apiUrl } = getAirtableConfig();

  const fields: Record<string, string | boolean> = {
    'Verification Token': newToken,
    'Verified': false,
  };

  if (name) fields['Name'] = name;
  if (location) fields['Location'] = location;

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records[0];
}

/**
 * Update a lead to mark it as verified
 */
export async function verifyLead(recordId: string): Promise<AirtableLeadRecord> {
  const { apiUrl } = getAirtableConfig();

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      records: [
        {
          id: recordId,
          fields: {
            'Verified': true,
            'Verification Token': '',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records[0];
}
