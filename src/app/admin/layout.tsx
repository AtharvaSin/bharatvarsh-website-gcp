/**
 * Admin layout — server component.
 *
 * • Checks auth + ADMIN role server‑side.
 * • Renders its own shell (no public Header / Footer).
 * • Sidebar navigation lives in the client component <AdminSidebar>.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export const metadata = {
    title: 'Admin Dashboard',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/signin?callbackUrl=/admin');
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, name: true, email: true },
    });

    if (dbUser?.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--obsidian-900)]">
                <div className="text-center space-y-4">
                    <h1 className="font-display text-5xl text-[var(--status-alert)]">
                        403
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Access Denied — Admin privileges required.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[var(--obsidian-900)]">
            <AdminSidebar userName={dbUser.name ?? dbUser.email ?? 'Admin'} />
            <main className="flex-1 min-w-0 ml-0 md:ml-60 transition-all duration-300">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
