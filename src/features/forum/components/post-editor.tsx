'use client';

import { FC, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/utils';
import { useSession } from '@/features/auth';
import { FORUM_LIMITS } from '../constants';

interface PostEditorProps {
  threadId: string;
  parentId?: string;
  onSubmit: () => void;
  className?: string;
}

/** Editor for composing a reply to a thread. Requires authentication. */
export const PostEditor: FC<PostEditorProps> = ({
  threadId,
  parentId,
  onSubmit,
  className,
}) => {
  const { isAuthenticated } = useSession();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50 text-center',
          className
        )}
      >
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to join the discussion
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/forum/threads/${threadId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), parentId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to post reply');
      }

      setBody('');
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply..."
        autoResize
        maxLength={FORUM_LIMITS.POST_BODY_MAX}
        className="min-h-[100px]"
      />
      {error && (
        <p className="text-sm text-[var(--status-alert)]">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {body.length}/{FORUM_LIMITS.POST_BODY_MAX}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!body.trim()}
          icon={<Send className="w-4 h-4" />}
        >
          Reply
        </Button>
      </div>
    </div>
  );
};
