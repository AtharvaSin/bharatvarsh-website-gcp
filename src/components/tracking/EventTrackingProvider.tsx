'use client';

/**
 * EventTrackingProvider — auto-tracks common user interactions.
 *
 * Tracks:
 *   session_start  — first render per browser tab
 *   page_view      — on every pathname change
 *   cta_click      — click on elements with data-track="<name>"
 *   scroll_depth   — crossing 25 / 50 / 75 / 100 % thresholds (once each)
 */

import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/track';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];
const SESSION_START_KEY = '__bv_session_started';

export const EventTrackingProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const pathname = usePathname();
    const scrolledRef = useRef<Set<number>>(new Set());

    // ── session_start (once per tab) ──────────────────────────
    useEffect(() => {
        if (sessionStorage.getItem(SESSION_START_KEY)) return;
        sessionStorage.setItem(SESSION_START_KEY, '1');
        trackEvent('session_start', {
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
        });
    }, []);

    // ── page_view (on route change) ──────────────────────────
    useEffect(() => {
        if (pathname.startsWith('/admin')) return;
        trackEvent('page_view', { path: pathname });
        // Reset scroll thresholds on page change
        scrolledRef.current = new Set();
    }, [pathname]);

    // ── cta_click (delegated click handler) ───────────────────
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
            if (!el) return;
            const name = el.getAttribute('data-track');
            if (!name) return;
            trackEvent('cta_click', {
                name,
                path: pathname,
                text: el.textContent?.slice(0, 80) || null,
            });
        }

        document.addEventListener('click', handleClick, { passive: true });
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    // ── scroll_depth (throttled) ──────────────────────────────
    useEffect(() => {
        if (pathname.startsWith('/admin')) return;

        let ticking = false;

        function handleScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight =
                    document.documentElement.scrollHeight - window.innerHeight;

                if (docHeight <= 0) {
                    ticking = false;
                    return;
                }

                const pct = Math.round((scrollTop / docHeight) * 100);

                for (const threshold of SCROLL_THRESHOLDS) {
                    if (pct >= threshold && !scrolledRef.current.has(threshold)) {
                        scrolledRef.current.add(threshold);
                        trackEvent('scroll_depth', {
                            depth: threshold,
                            path: pathname,
                        });
                    }
                }

                ticking = false;
            });
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return <>{children}</>;
};
