/**
 * API Route: GET /api/leads/verify
 * Verifies a lead using the verification token
 */

import { NextRequest, NextResponse } from 'next/server';
import { findLeadByToken, verifyLead } from '@/lib/airtable';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from query params
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      // Redirect with error - missing token
      return NextResponse.redirect(
        `${BASE_URL}/novel?verified=error&reason=missing_token`
      );
    }

    // Find lead by token
    const lead = await findLeadByToken(token);

    if (!lead) {
      // Redirect with error - invalid or expired token
      return NextResponse.redirect(
        `${BASE_URL}/novel?verified=error&reason=invalid_token`
      );
    }

    // Check if already verified
    if (lead.fields.Verified) {
      // Redirect with already verified status
      return NextResponse.redirect(
        `${BASE_URL}/novel?verified=already`
      );
    }

    // Verify the lead
    await verifyLead(lead.id);

    // Redirect with success
    return NextResponse.redirect(
      `${BASE_URL}/novel?verified=success`
    );

  } catch (error) {
    console.error('Verification error:', error);

    // Redirect with error
    return NextResponse.redirect(
      `${BASE_URL}/novel?verified=error&reason=server_error`
    );
  }
}
