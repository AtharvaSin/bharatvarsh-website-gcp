/**
 * Client-side event tracking utility.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/track';
 *   trackEvent('cta_click', { button: 'buy_now' });
 *
 * - Generates a per-tab sessionId stored in sessionStorage.
 * - Uses navigator.sendBeacon for reliability on page unload,
 *   falls back to fetch().
 * - Fire-and-forget — never throws or blocks the UI.
 * - Skips tracking when pathname starts with /admin.
 */

const SESSION_KEY = '__bv_sid';

function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
}

export function trackEvent(
    name: string,
    payload?: Record<string, unknown>,
): void {
    if (typeof window === 'undefined') return;

    // Don't track admin pages
    if (window.location.pathname.startsWith('/admin')) return;

    const body = JSON.stringify({
        name,
        payload,
        sessionId: getSessionId(),
    });

    // Prefer sendBeacon for fire-and-forget reliability
    const sent =
        typeof navigator.sendBeacon === 'function' &&
        navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));

    if (!sent) {
        fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => {
            // Silently swallow — tracking should never break the app
        });
    }
}
