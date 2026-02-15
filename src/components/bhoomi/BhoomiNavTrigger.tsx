'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';
import { useBhoomiStore } from './store';
import { cn } from '@/shared/utils';

export function BhoomiNavTrigger() {
    const { open, isOpen } = useBhoomiStore();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative flex items-center ml-4 md:ml-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={open}
                className={cn(
                    "flex items-center gap-3 px-4 py-1.5 rounded-full transition-all duration-300 group",
                    "border border-[var(--obsidian-700)] bg-[var(--obsidian-800)]/50",
                    "hover:border-mustard-500/50 hover:bg-[var(--obsidian-800)] hover:shadow-[0_0_15px_-3px_rgba(241,194,50,0.15)]",
                    isOpen ? "border-mustard-500/50 bg-mustard-900/10" : ""
                )}
                aria-label="Ask Bhoomi AI Copilot"
            >
                <Sparkles size={14} className={cn(
                    "transition-colors",
                    isOpen || isHovered ? "text-mustard-500 animate-pulse" : "text-[var(--text-secondary)]"
                )} />

                <span className={cn(
                    "text-sm font-medium transition-colors hidden md:inline-block",
                    isOpen || isHovered ? "text-mustard-100" : "text-[var(--text-secondary)]"
                )}>
                    Ask Bhoomi...
                </span>

                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center bg-[var(--obsidian-900)] border border-[var(--obsidian-700)] ml-1",
                    "group-hover:border-mustard-500/30 transition-colors"
                )}>
                    <Search size={10} className="text-[var(--text-secondary)] group-hover:text-mustard-500" />
                </div>
            </button>

            {/* Muted Dialogue Tooltip */}
            <AnimatePresence>
                {isHovered && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 w-80 z-50 origin-top-left"
                    >
                        <div className="bg-[var(--obsidian-900)] border border-mustard-500/30 text-mustard-50 text-xs p-4 rounded-xl shadow-2xl relative backdrop-blur-xl">
                            {/* Triangle Arrow */}
                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--obsidian-900)] border-t border-l border-mustard-500/30 rotate-45" />

                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-mustard-900/20 flex-shrink-0 flex items-center justify-center border border-mustard-500/30 shadow-[0_0_10px_-2px_rgba(241,194,50,0.2)]">
                                    <Sparkles size={16} className="text-mustard-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <p className="font-display text-mustard-500 tracking-wide text-xs">BHOOMI</p>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-mustard-900/30 text-mustard-300 border border-mustard-500/20">AI COPILOT</span>
                                    </div>
                                    <p className="italic text-[11px] leading-relaxed text-zinc-300">
                                        "This reality is vast and strange. Shall I be your guide through the mysteries of Bharatvarsh?"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
