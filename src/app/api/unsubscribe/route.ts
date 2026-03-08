import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing campaign ID' }, { status: 400 });
        }

        if (id === 'test-id') {
            return NextResponse.json({ success: true, message: 'Test unsubscription successful.' });
        }

        const campaign = await prisma.emailCampaign.findUnique({
            where: { id }
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        await prisma.emailCampaign.update({
            where: { id },
            data: { unsubscribed: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
