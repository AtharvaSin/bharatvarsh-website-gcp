'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Activity,
    MessageSquare,
    Users,
    Menu,
    X,
    LogOut,
    Shield,
} from 'lucide-react';
import { cn } from '@/shared/utils';

interface AdminSidebarProps {
    userName: string;
}

const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Events', href: '/admin/events', icon: Activity },
    { label: 'AI Sessions', href: '/admin/sessions', icon: MessageSquare },
    { label: 'Users', href: '/admin/users', icon: Users },
];

export const AdminSidebar: FC<AdminSidebarProps> = ({ userName }) => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) =>
        href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="px-5 pt-6 pb-4">
                <Link href="/admin" className="flex items-center gap-2 group">
                    <Shield className="w-5 h-5 text-[var(--mustard-500)]" />
                    <span className="font-display text-xl tracking-wide text-[var(--powder-300)] group-hover:text-[var(--mustard-500)] transition-colors">
                        BHARATVARSH
                    </span>
                </Link>
                <span className="ml-7 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--mustard-500)]">
                    Admin
                </span>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-[var(--obsidian-700)]" />

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                active
                                    ? 'text-[var(--mustard-500)] bg-[var(--obsidian-800)] border-l-[3px] border-[var(--mustard-500)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]',
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-[var(--obsidian-700)]">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--obsidian-700)] flex items-center justify-center text-xs font-medium text-[var(--powder-300)]">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] truncate">
                        {userName}
                    </span>
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)] transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Back to Site
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-[var(--obsidian-850)] border-r border-[var(--obsidian-700)] z-40">
                <NavContent />
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--obsidian-850)] border-b border-[var(--obsidian-700)] z-40 flex items-center px-4">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="flex items-center gap-2 ml-2">
                    <Shield className="w-4 h-4 text-[var(--mustard-500)]" />
                    <span className="font-display text-lg text-[var(--powder-300)]">
                        BHARATVARSH
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--mustard-500)]">
                        Admin
                    </span>
                </div>
            </div>

            {/* Mobile slide-out */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 z-40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -240 }}
                            animate={{ x: 0 }}
                            exit={{ x: -240 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-[var(--obsidian-850)] border-r border-[var(--obsidian-700)] z-50"
                        >
                            <NavContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile spacer */}
            <div className="md:hidden h-14" />
        </>
    );
};
