/**
 * API Route: POST /api/leads
 * Creates a new lead or updates existing lead in Airtable and sends verification email
 * Allows same email to be submitted multiple times for re-verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { sendVerificationEmail } from '@/server/email';

interface LeadRequestBody {
  name: string;
  location: string;
  email: string;
  source?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a secure verification token
 */
function generateToken(): string {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: LeadRequestBody = await request.json();
    const { name, location, email, source } = body;

    // Validate required fields
    if (!name || !location || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate location format
    if (!location.includes(',')) {
      return NextResponse.json(
        { success: false, error: 'Please enter location as: City, Country', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateToken();

    // Check if email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingLead) {
      // Email exists - update the existing record with new token
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          verificationToken,
          isVerified: false,
          name: name.trim(),
          location: location.trim()
        }
      });
    } else {
      // New email - create a new lead
      await prisma.lead.create({
        data: {
          name: name.trim(),
          location: location.trim(),
          email: email.toLowerCase().trim(),
          verificationToken,
          sourcePage: source || '/unknown',
        }
      });
    }

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: email.toLowerCase().trim(),
      name: name.trim(),
      token: verificationToken,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Note: We still return success because the lead was created/updated
      // The user can resend the verification email
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });

  } catch (error) {
    console.error('Lead creation error:', error);

    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
