import { create } from 'zustand';
import { trackEvent } from '@/lib/track';

interface BhoomiState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useBhoomiStore = create<BhoomiState>((set, get) => ({
    isOpen: false,
    open: () => { trackEvent('bhoomi_open'); set({ isOpen: true }); },
    close: () => set({ isOpen: false }),
    toggle: () => {
        const willOpen = !get().isOpen;
        if (willOpen) trackEvent('bhoomi_open');
        set({ isOpen: willOpen });
    },
}));
