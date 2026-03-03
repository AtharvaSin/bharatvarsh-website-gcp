import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Link2, Target, MailCheck, MousePointerClick } from 'lucide-react';

export const metadata = {
    title: 'Marketing Analytics | Admin',
};

async function getMarketingStats() {
    // We group events by name to get counts
    const counts = await prisma.event.groupBy({
        by: ['name'],
        _count: {
            name: true,
        },
        where: {
            name: {
                in: [
                    'cta_click',
                    'lead_magnet_requested',
                    'email_verified',
                    'scroll_depth'
                ]
            }
        }
    });

    const dict = counts.reduce((acc, curr) => {
        acc[curr.name] = curr._count.name;
        return acc;
    }, {} as Record<string, number>);

    // For specific cta_click outbound platforms, we'd ideally filter by payload,
    // but Prisma groupBy on JSON payload isn't directly supported in SQLite/simple Postgres without raw queries. 
    // We'll just fetch all cta_click payloads to count outbound platforms manually.
    const ctaClicks = await prisma.event.findMany({
        where: { name: 'cta_click' },
        select: { payload: true }
    });

    const outboundCounts: Record<string, number> = {};
    for (const evt of ctaClicks) {
        if (evt.payload && typeof evt.payload === 'object' && 'name' in evt.payload) {
            const nameStr = String(evt.payload.name);
            if (nameStr.startsWith('outbound_')) {
                outboundCounts[nameStr] = (outboundCounts[nameStr] || 0) + 1;
            }
        }
    }

    return {
        totalLeads: dict['lead_magnet_requested'] || 0,
        totalVerified: dict['email_verified'] || 0,
        outboundCounts,
    };
}

async function AnalyticsDashboard() {
    const stats = await getMarketingStats();

    const conversionRate = stats.totalLeads > 0
        ? Math.round((stats.totalVerified / stats.totalLeads) * 100)
        : 0;

    return (
        <div className="space-y-8">
            <h1 className="font-display text-3xl text-[var(--powder-300)]">
                Marketing Analytics
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-6 border border-[var(--obsidian-700)]">
                    <div className="flex items-center gap-3 mb-4 text-[var(--mustard-500)]">
                        <Target className="w-6 h-6" />
                        <h3 className="font-mono text-sm tracking-wider uppercase">Dossier Leads</h3>
                    </div>
                    <p className="text-4xl font-display text-[var(--powder-300)]">{stats.totalLeads}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">Dossier chapters requested</p>
                </div>

                <div className="glass rounded-xl p-6 border border-[var(--status-success)]/30 bg-[var(--status-success)]/5">
                    <div className="flex items-center gap-3 mb-4 text-[var(--status-success)]">
                        <MailCheck className="w-6 h-6" />
                        <h3 className="font-mono text-sm tracking-wider uppercase">Verified Emails</h3>
                    </div>
                    <p className="text-4xl font-display text-[var(--status-success)]">{stats.totalVerified}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">Conversion: {conversionRate}%</p>
                </div>

                <div className="glass rounded-xl p-6 border border-[var(--obsidian-700)]">
                    <div className="flex items-center gap-3 mb-4 text-[var(--powder-400)]">
                        <MousePointerClick className="w-6 h-6" />
                        <h3 className="font-mono text-sm tracking-wider uppercase">Store Outbounds</h3>
                    </div>
                    <div className="space-y-3 mt-4">
                        {Object.entries(stats.outboundCounts).length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)]">No outbound clicks yet.</p>
                        ) : (
                            Object.entries(stats.outboundCounts).map(([platform, count]) => (
                                <div key={platform} className="flex justify-between items-center">
                                    <span className="text-sm text-[var(--text-secondary)] capitalize">
                                        {platform.replace('outbound_', '')}
                                    </span>
                                    <span className="font-mono text-[var(--powder-300)]">{count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 glass border border-[var(--obsidian-700)] rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Link2 className="text-[var(--text-muted)] w-5 h-5" />
                    <h2 className="text-lg font-display text-[var(--powder-300)]">Marketing Overview</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                    This dashboard aggregates tracking data captured natively on the platform. It specifically tracks lead magnets (dossiers requested), subsequent email verifications to map conversions, and outbound engagement to Amazon/Flipkart/NotionPress.
                </p>
            </div>
        </div>
    );
}

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    if (dbUser?.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <Suspense fallback={<div className="animate-pulse h-32 bg-[var(--obsidian-800)] rounded-xl" />}>
            <AnalyticsDashboard />
        </Suspense>
    );
}
