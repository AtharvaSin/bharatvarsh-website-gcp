/**
 * API Route: GET /api/cron/process-emails
 * Triggered periodically (e.g. hourly/daily) to process the EmailCampaign queue
 * Security: This should be authenticated via a cron secret in production
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { sendCampaignEmail } from '@/server/email-campaigns';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const campaignsToProcess = await prisma.emailCampaign.findMany({
            where: {
                completed: false,
                unsubscribed: false,
                nextSendAt: {
                    lte: new Date()
                }
            },
            take: 50 // process in batches
        });

        const results = [];

        for (const campaign of campaignsToProcess) {
            const nextStep = campaign.currentStep + 1;

            if (nextStep > 5) {
                // Just in case it wasn't marked completed
                await prisma.emailCampaign.update({
                    where: { id: campaign.id },
                    data: { completed: true }
                });
                continue;
            }

            // Send the email
            const { success, error } = await sendCampaignEmail(campaign.id, campaign.targetEmail, nextStep);

            if (success) {
                // Calculate next send date
                // Note: from requirements, email 2 is 2 days after, email 3 is 2-3 days, email 4 is 3 days, email 5 is 3-4 days
                let delayDays = 2; // Default
                if (nextStep === 2) delayDays = 2;
                if (nextStep === 3) delayDays = 3;
                if (nextStep === 4) delayDays = 3;
                if (nextStep === 5) delayDays = 4;

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + delayDays);

                const isCompleted = nextStep >= 5;

                await prisma.emailCampaign.update({
                    where: { id: campaign.id },
                    data: {
                        currentStep: nextStep,
                        completed: isCompleted,
                        nextSendAt: isCompleted ? new Date() : nextDate,
                    }
                });

                results.push({ email: campaign.targetEmail, step: nextStep, status: 'success' });
            } else {
                console.error(`Failed to send step ${nextStep} to ${campaign.targetEmail}: ${error}`);
                results.push({ email: campaign.targetEmail, step: nextStep, status: 'failed', error });
            }
        }

        return NextResponse.json({ processed: campaignsToProcess.length, results });

    } catch (error) {
        console.error('Cron process emails error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
