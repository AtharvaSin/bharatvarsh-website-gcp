'use client';

import { FC, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { cn } from '@/shared/utils';
import { useSession } from '@/features/auth';
import { FORUM_LIMITS } from '../constants';

interface PostEditorProps {
  threadId: string;
  parentId?: string;
  onSubmit: () => void;
  className?: string;
}

/**
 * Classified Chronicle reply editor. Dashed mustard frame, mono eyebrow
 * "TRANSMIT RESPONSE", authed users see the textarea, unauthed see a
 * "sign the manifest" gate matching the landing's manifest framing.
 */
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
          'p-6 border-2 border-dashed text-center',
          className,
        )}
        style={{
          borderColor: 'var(--mustard-dossier)',
          backgroundColor: 'var(--obsidian-panel)',
        }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
          style={{ color: 'var(--mustard-dossier)' }}
        >
          CLEARANCE REQUIRED
        </div>
        <p
          className="font-display leading-[1.1]"
          style={{
            fontSize: 'clamp(1.25rem, 2.4vw, 1.75rem)',
            color: 'var(--bone-text)',
          }}
        >
          SIGN THE MANIFEST TO TRANSMIT.
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
    <div
      className={cn('p-5 border-l-4', className)}
      style={{
        backgroundColor: 'var(--obsidian-panel)',
        borderLeftColor: 'var(--mustard-dossier)',
        borderTop: '1px solid var(--navy-signal)',
        borderRight: '1px solid var(--navy-signal)',
        borderBottom: '1px solid var(--navy-signal)',
      }}
    >
      <EyebrowLabel segments={['TRANSMIT RESPONSE']} className="mb-3" />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="TRANSMIT YOUR RESPONSE. MARKDOWN ACCEPTED."
        autoResize
        maxLength={FORUM_LIMITS.POST_BODY_MAX}
        className="min-h-[120px] font-sans"
      />
      {error && (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] mt-3"
          style={{ color: 'var(--redaction)' }}
        >
          {error}
        </p>
      )}
      <div className="flex items-center justify-between mt-4">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--shadow-text)' }}
        >
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
          TRANSMIT →
        </Button>
      </div>
    </div>
  );
};
