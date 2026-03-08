'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) {
            setStatus('error');
            setErrorMessage('Invalid unsubscribe link.');
            return;
        }

        const unsubscribe = async () => {
            try {
                const res = await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setErrorMessage(data.error || 'Failed to unsubscribe.');
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        };

        unsubscribe();
    }, [id]);

    return (
        <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0F1419] border border-[#1A1F2E] p-8 rounded-lg text-center font-sans">
                <h1 className="text-2xl font-bold text-[#F0F4F8] mb-4 uppercase tracking-widest">
                    Bharatvarsh Updates
                </h1>

                {status === 'loading' && (
                    <p className="text-[#A0AEC0]">Processing your request...</p>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <p className="text-[#F0F4F8]">
                            You have been successfully unsubscribed from the Bharatvarsh email campaign.
                        </p>
                        <p className="text-[#A0AEC0] text-sm md:text-base">
                            You will no longer receive automated emails from this sequence.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <p className="text-red-400">
                            {errorMessage}
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-[#1A1F2E]">
                    <Link
                        href="/"
                        className="text-[#F1C232] hover:text-white transition-colors duration-200"
                    >
                        &larr; Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0D12] p-8 text-[#A0AEC0]">Loading...</div>}>
            <UnsubscribeContent />
        </Suspense>
    );
}
