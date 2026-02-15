'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquareText } from 'lucide-react';
import { useBhoomiStore } from './store';
import { ChatInterface } from './chat-interface';
import { cn } from '@/shared/utils';

export function BhoomiWidget() {
    const { isOpen, toggle, close } = useBhoomiStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] md:w-[400px] h-[500px] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm"
                    >
                        <ChatInterface mode="widget" onClose={close} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <div className="relative group">
                {/* Muted Dialogue Tooltip - Only shows when closed */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 pointer-events-none"
                        >
                            <div className="bg-black/90 border border-mustard-900/30 text-mustard-50 text-xs p-3 rounded-lg shadow-xl relative backdrop-blur-md">
                                <p className="italic">"This reality is vast and strange. Shall I be your guide through the mysteries of Bharatvarsh?"</p>
                                {/* Arrow */}
                                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-black/90 border-t border-r border-mustard-900/30 rotate-45" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggle}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 shadow-mustard-900/20",
                        isOpen
                            ? "bg-zinc-800 text-zinc-400 hover:rotate-90"
                            : "bg-[var(--mustard-500)] text-[var(--navy-900)] hover:scale-105 hover:bg-[var(--mustard-400)] shadow-lg shadow-mustard-900/40"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                            >
                                {/* Simple X or Chevron */}
                                <div className="w-6 h-6 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <Sparkles size={24} className="animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div >
        </div >
    );
}
