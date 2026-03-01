'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Shield, AlertTriangle, Eye, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { signIn } from 'next-auth/react';
// import { cn } from '@/lib/utils'; // Assuming utility exists, else inline
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};

type SpoilerMode = 'S1' | 'S2' | 'S3';

interface ChatInterfaceProps {
    mode?: 'page' | 'widget';
    onClose?: () => void;
}

export function ChatInterface({ mode = 'page', onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "This reality is vast and strange. Shall I be your guide through the mysteries of Bharatvarsh?",
            timestamp: Date.now(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [spoilerMode, setSpoilerMode] = useState<SpoilerMode>('S1');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Generate or reuse sessionId
        const currentSessionId = sessionId || crypto.randomUUID();
        if (!sessionId) setSessionId(currentSessionId);

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    spoilerMode,
                    sessionId: currentSessionId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'The connection to the archives is fractured.');
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                assistantMsg.content += text;

                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.id === assistantMsg.id) {
                        return [...prev.slice(0, -1), { ...last, content: assistantMsg.content }];
                    }
                    return prev;
                });
            }

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "The connection to the archives is fractured. Please try again.",
                timestamp: Date.now(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const containerClasses = mode === 'page'
        ? "flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-black/90 border border-mustard-900/30 rounded-xl overflow-hidden shadow-2xl relative font-sans"
        : "flex flex-col h-full w-full bg-black/95 border border-mustard-900/40 rounded-xl overflow-hidden shadow-2xl relative font-sans";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-slate-900 to-black">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-mustard-900/20 flex items-center justify-center border border-mustard-500/30">
                        <Sparkles size={12} className="text-mustard-500" />
                    </div>
                    <div>
                        <h3 className="text-mustard-100 font-medium text-xs tracking-wide">BHOOMI</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Compact close button for widget */}
                    {mode === 'widget' && onClose && (
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full space-x-2",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-6 h-6 rounded-full bg-mustard-900/10 flex-shrink-0 flex items-center justify-center mt-1">
                                    <Sparkles size={10} className="text-mustard-700/50" />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed prose prose-invert prose-p:my-1 prose-sm max-w-none",
                                msg.role === 'user'
                                    ? "bg-mustard-900/20 text-mustard-100 border border-mustard-500/20 rounded-tr-none"
                                    : "bg-zinc-900/50 text-zinc-300 border border-white/5 rounded-tl-none"
                            )}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                        a: ({ node, href, children, ...props }) => {
                                            const isInternal = href?.startsWith('/');
                                            const isGoogleLogin = href === '#signin-google';

                                            if (isGoogleLogin) {
                                                return (
                                                    <button
                                                        onClick={() => signIn('google')}
                                                        className="text-mustard-400 underline underline-offset-2 hover:text-mustard-300 transition-colors cursor-pointer inline p-0 bg-transparent border-none font-inherit"
                                                    >
                                                        {children}
                                                    </button>
                                                );
                                            }

                                            if (isInternal) {
                                                return (
                                                    <a
                                                        href={href}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = href!;
                                                        }}
                                                        className="text-mustard-400 underline underline-offset-2 hover:text-mustard-300 transition-colors cursor-pointer"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </a>
                                                );
                                            }
                                            return (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-mustard-400 underline underline-offset-2 hover:text-mustard-300 transition-colors cursor-pointer"
                                                    {...props}
                                                >
                                                    {children}
                                                </a>
                                            );
                                        },
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start space-x-2 pl-8">
                        <div className="flex space-x-1 items-center bg-zinc-900/50 px-2 py-1.5 rounded-lg border border-white/5">
                            <div className="w-1 h-1 bg-mustard-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1 h-1 bg-mustard-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-1 bg-mustard-500/50 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-black border-t border-white/10">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask Bhoomi..."
                        className="w-full bg-zinc-900/50 text-mustard-50 placeholder-zinc-600 border border-white/10 rounded-lg p-2.5 pr-10 focus:outline-none focus:border-mustard-900/50 resize-none h-12 text-xs"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-mustard-900/20 hover:bg-mustard-900/40 text-mustard-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
