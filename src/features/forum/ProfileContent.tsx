'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { AuthGuard, useSession } from '@/features/auth';
import { UserAvatar } from './components/user-avatar';
import { UserBadge } from './components/user-badge';
import { ThreadCard } from './components/thread-card';
import type { ThreadListItem } from './types';

interface ProfileContentProps {
  className?: string;
}

/** User profile page composition showing profile header and activity tabs. */
export const ProfileContent: FC<ProfileContentProps> = ({ className }) => {
  const { user } = useSession();
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadActivity() {
      try {
        const res = await fetch(`/api/forum/threads?authorId=${user!.id}`);
        if (res.ok) {
          const json = await res.json();
          setThreads(json.data || []);
        }
      } catch {
        // Silently handle errors for profile activity
      } finally {
        setIsLoading(false);
      }
    }
    loadActivity();
  }, [user]);

  return (
    <div className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>

        <AuthGuard>
          {user && (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8 p-6 rounded-lg bg-[var(--obsidian-800)] border border-[var(--obsidian-600)]">
                <UserAvatar
                  name={user.name}
                  image={user.image}
                  role={user.role}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                      {user.name || 'Anonymous'}
                    </h1>
                    <UserBadge role={user.role} />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Activity Tabs */}
              <Tabs defaultValue="threads">
                <TabsList>
                  <TabsTrigger value="threads">
                    <FileText className="w-4 h-4 mr-1.5" />
                    My Threads
                  </TabsTrigger>
                  <TabsTrigger value="replies">
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    My Replies
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="threads">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                      You haven&apos;t created any threads yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {threads.map((thread) => (
                        <ThreadCard key={thread.id} thread={thread} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="replies">
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    Reply history coming soon.
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </AuthGuard>
      </div>
    </div>
  );
};
