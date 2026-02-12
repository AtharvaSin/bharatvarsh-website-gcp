/**
 * Email client using Resend for verification emails
 * Server-only module — do not import from client components.
 */

import 'server-only';
import { Resend } from 'resend';
import { getServerEnv } from '@/config/env';

// Lazy-init: Resend client is created on first use, not at module load.
// This prevents build failures when env vars are absent.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getServerEnv().resend.apiKey);
  }
  return _resend;
}

const FROM_EMAIL = 'Bharatvarsh <onboarding@resend.dev>';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

/**
 * Send a verification email to the user
 * @param params - Email parameters
 * @returns Success status and message ID
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const verificationUrl = `${getServerEnv().baseUrl}/api/leads/verify?token=${token}`;

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Verify Your Access to Bharatvarsh Chapter 1',
      html: generateEmailTemplate({ name, verificationUrl }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Failed to send verification email' };
  }
}

/**
 * Generate the HTML email template
 */
function generateEmailTemplate({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0D12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1A1F2E; border: 1px solid #252A3B; border-bottom: none;">
              <p style="margin: 0; font-size: 12px; color: #F1C232; letter-spacing: 2px; font-family: monospace;">
                BHARATVARSH ARCHIVES
              </p>
              <h1 style="margin: 10px 0 0 0; font-size: 28px; color: #F0F4F8; font-weight: 600;">
                Reader Clearance Request
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #0F1419; border: 1px solid #252A3B; border-top: none; border-bottom: none;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #A0AEC0; line-height: 1.6;">
                Greetings, <strong style="color: #F0F4F8;">${name}</strong>.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #A0AEC0; line-height: 1.6;">
                Your request for Reader Clearance has been received. To access
                <strong style="color: #F0F4F8;">Chapter 1 of Bharatvarsh</strong>,
                verify your identity by clicking the button below.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${verificationUrl}"
                       style="display: inline-block; padding: 16px 40px; background-color: #F1C232; color: #0A0D12; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px; border-radius: 4px;">
                      VERIFY ACCESS
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #718096; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="margin: 0; padding: 15px; background-color: #1A1F2E; border-radius: 4px; font-size: 12px; color: #A0AEC0; word-break: break-all; font-family: monospace;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1A1F2E; border: 1px solid #252A3B; border-top: none;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #718096; line-height: 1.6;">
                This link will expire in 24 hours. If you did not request this access,
                you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4A5568;">
                &copy; ${new Date().getFullYear()} Bharatvarsh. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
