/**
 * API Route: GET /api/test-campaign-emails
 * Used to test the visual appearance and delivery of the 5 campaign emails
 */

import { NextResponse } from 'next/server';
import { sendCampaignEmail } from '@/server/email-campaigns';

export async function GET(request: Request) {
    // Simple check to ensure this is only used for testing or by admin
    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get('email') || 'atharvasingh.24@gmail.com';
    const secret = searchParams.get('secret');

    // In production, require a secret token. For local dev, maybe allow it.
    if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const results = [];

    try {
        for (let i = 1; i <= 5; i++) {
            // we use 'test-id' as a dummy campaign ID so the unsubscribe links don't break
            const result = await sendCampaignEmail('test-id', targetEmail, i);
            results.push({ step: i, result });
        }

        return NextResponse.json({ success: true, targetEmail, results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
