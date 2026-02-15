'use client';

import { ChatInterface } from '@/components/bhoomi/chat-interface';

export default function BhoomiPage() {
    return (
        <div className="min-h-screen bg-black text-amber-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Background ambience */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black opacity-50" />
            </div>

            <div className="z-10 w-full max-w-3xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter text-amber-500/80">
                        ARCHIVE ACCESS: BHOOMI
                    </h1>
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">
                        System Status: Online | Divergence: 1717 AD
                    </p>
                </div>

                <ChatInterface />

                <div className="text-center text-xs text-zinc-700 max-w-md mx-auto">
                    <p>Accessing restricted canon data. Responses may be monitored by the High Council.</p>
                </div>
            </div>
        </div>
    );
}
