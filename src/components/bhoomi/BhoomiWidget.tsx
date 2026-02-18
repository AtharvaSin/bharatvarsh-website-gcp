'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic } from 'lucide-react';
import { useState } from 'react';
import { useBhoomiStore } from './store';
import { ChatInterface } from './chat-interface';
import { VoiceWidget } from './VoiceWidget';
import { cn } from '@/shared/utils';

export function BhoomiWidget() {
    const { isOpen, toggle, close } = useBhoomiStore();
    const [mode, setMode] = useState<'text' | 'voice'>('text');

    return (
        <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat/Voice Window */}
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] md:w-[400px] h-[500px] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm origin-bottom-right pointer-events-auto"
                    >
                        {mode === 'text' ? (
                            <ChatInterface mode="widget" onClose={close} />
                        ) : (
                            <VoiceWidget onClose={close} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls Container */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {/* Voice Toggle (Only visible when open) */}
                {isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setMode(mode === 'text' ? 'voice' : 'text')}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg pointer-events-auto mr-4",
                            mode === 'voice'
                                ? "bg-mustard-900 border-mustard-500 text-mustard-400"
                                : "bg-obsidian-800 border-obsidian-600 text-zinc-400 hover:text-mustard-400 hover:border-mustard-500/50"
                        )}
                        title={mode === 'text' ? "Switch to Voice Mode" : "Switch to Text Chat"}
                    >
                        {mode === 'text' ? <Mic size={20} /> : <MessageSquareText size={20} />}
                    </motion.button>
                )}

                {/* Main Trigger Button */}
                <div className="relative group">
                    {/* Tooltip implementation remains same, just hidden for brevity if unchanged logic desired, but including for completeness */}
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="absolute right-full mr-6 top-1/2 -translate-y-1/2 w-72 pointer-events-none"
                            >
                                <div className="bg-[var(--obsidian-900)]/95 border border-[var(--obsidian-700)] text-[var(--text-secondary)] text-xs p-4 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] relative backdrop-blur-md font-mono tracking-wide">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--obsidian-800)]">
                                        <div className="w-1.5 h-1.5 bg-[var(--mustard-500)] rounded-full animate-pulse" />
                                        <span className="text-[10px] uppercase text-[var(--mustard-500)] tracking-widest">Incoming Transmission</span>
                                    </div>
                                    <p className="italic text-[var(--powder-200)] leading-relaxed">"This reality is vast and strange. Shall I be your guide through the mysteries of Bharatvarsh?"</p>
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--mustard-500)]" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--mustard-500)]" />
                                    <div className="absolute top-1/2 -right-6 w-6 h-px bg-[var(--obsidian-700)]" />
                                    <div className="absolute top-1/2 -right-1.5 w-1.5 h-1.5 bg-[var(--mustard-500)] rounded-full" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={toggle}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center transition-all duration-300 relative group overflow-hidden rounded-none", // Assuming square/terminal aesthetic
                            isOpen
                                ? "bg-[var(--obsidian-800)] border border-[var(--status-alert)]"
                                : "bg-[var(--obsidian-900)] border border-[var(--mustard-500)] hover:bg-[var(--obsidian-800)] hover:border-[var(--mustard-400)] hover:shadow-[0_0_15px_rgba(241,194,50,0.3)]"
                        )}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className={cn("absolute top-0 left-0 w-1.5 h-1.5 border-t border-l transition-colors", isOpen ? "border-[var(--status-alert)]" : "border-[var(--mustard-500)]")} />
                            <div className={cn("absolute top-0 right-0 w-1.5 h-1.5 border-t border-r transition-colors", isOpen ? "border-[var(--status-alert)]" : "border-[var(--mustard-500)]")} />
                            <div className={cn("absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l transition-colors", isOpen ? "border-[var(--status-alert)]" : "border-[var(--mustard-500)]")} />
                            <div className={cn("absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r transition-colors", isOpen ? "border-[var(--status-alert)]" : "border-[var(--mustard-500)]")} />
                        </div>

                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative"
                                >
                                    <div className="w-6 h-6 relative">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--status-alert)] rotate-45 transform origin-center" />
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--status-alert)] -rotate-45 transform origin-center" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="open"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative flex items-center justify-center"
                                >
                                    <Sparkles size={20} className="text-[var(--mustard-500)] animate-pulse" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </div>
    );
}

function MessageSquareText({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M13 8H7" />
            <path d="M17 12H7" />
        </svg>
    );
}
