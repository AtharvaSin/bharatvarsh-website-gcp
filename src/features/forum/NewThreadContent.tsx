'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/utils';
import { AuthGuard } from '@/features/auth';
import { ThreadForm } from './components/thread-form';

interface NewThreadContentProps {
  className?: string;
}

/** New thread creation page composition with auth guard and form. */
export const NewThreadContent: FC<NewThreadContentProps> = ({ className }) => {
  return (
    <div className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>

        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-[var(--powder-300)] mb-8">
          NEW THREAD
        </h1>

        <AuthGuard>
          <ThreadForm />
        </AuthGuard>
      </div>
    </div>
  );
};
