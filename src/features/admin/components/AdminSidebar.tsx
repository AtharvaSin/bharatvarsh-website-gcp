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
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--obsidian-850)] border-b border-[var(--obsidian-700)] z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--mustard-500)]" />
                    <span className="font-display text-lg tracking-wide text-[var(--powder-300)]">
                        BHARATVARSH
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--mustard-500)] ml-1">
                        Admin
                    </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--obsidian-700)] flex items-center justify-center text-xs font-medium text-[var(--powder-300)]">
                    {userName.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Mobile bottom tab bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--obsidian-850)]/95 backdrop-blur-xl border-t border-[var(--obsidian-700)] z-50 flex items-center justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
                                active ? 'text-[var(--mustard-500)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            <Icon className={cn("w-5 h-5", active ? "scale-110 transition-transform" : "")} />
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile spacers for scrolling content */}
            <div className="md:hidden h-14" />
            {/* The bottom spacer will be needed on the main content area, but we add it here just in case AdminLayout relies on it */}
            <div className="md:hidden h-16" />
        </>
    );
};
