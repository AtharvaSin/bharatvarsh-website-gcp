/**
 * Airtable client for lead management
 * Handles CRUD operations for the Leads table
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

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
 * @param email - Email to search for
 * @returns The lead record if found, null otherwise
 */
export async function findLeadByEmail(email: string): Promise<AirtableLeadRecord | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable configuration is missing');
  }

  const filterFormula = encodeURIComponent(`{Email} = '${email.toLowerCase()}'`);
  const url = `${AIRTABLE_API_URL}?filterByFormula=${filterFormula}&maxRecords=1`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records?.[0] || null;
}

/**
 * Find a lead by verification token
 * @param token - Verification token to search for
 * @returns The lead record if found, null otherwise
 */
export async function findLeadByToken(token: string): Promise<AirtableLeadRecord | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable configuration is missing');
  }

  const filterFormula = encodeURIComponent(`{Verification Token} = '${token}'`);
  const url = `${AIRTABLE_API_URL}?filterByFormula=${filterFormula}&maxRecords=1`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.records?.[0] || null;
}

/**
 * Create a new lead in Airtable
 * @param data - Lead data to create
 * @returns The created record
 */
export async function createLead(data: CreateLeadData): Promise<AirtableLeadRecord> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable configuration is missing');
  }

  const response = await fetch(AIRTABLE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
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
 * @param recordId - Airtable record ID
 * @param newToken - New verification token
 * @param name - Optional updated name
 * @param location - Optional updated location
 * @returns The updated record
 */
export async function updateLeadToken(
  recordId: string,
  newToken: string,
  name?: string,
  location?: string
): Promise<AirtableLeadRecord> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable configuration is missing');
  }

  const fields: Record<string, string | boolean> = {
    'Verification Token': newToken,
    'Verified': false, // Reset verified status to allow re-verification
  };

  // Optionally update name and location if provided
  if (name) fields['Name'] = name;
  if (location) fields['Location'] = location;

  const response = await fetch(AIRTABLE_API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          id: recordId,
          fields,
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

/**
 * Update a lead to mark it as verified
 * @param recordId - Airtable record ID
 * @returns The updated record
 */
export async function verifyLead(recordId: string): Promise<AirtableLeadRecord> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable configuration is missing');
  }

  const response = await fetch(AIRTABLE_API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          id: recordId,
          fields: {
            'Verified': true,
            'Verification Token': '', // Clear the token after verification
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
