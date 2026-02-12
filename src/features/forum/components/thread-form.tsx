'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/utils';
import { useTopics } from '../hooks/use-topics';
import { FORUM_LIMITS } from '../constants';

interface ThreadFormProps {
  className?: string;
}

/** Form for creating a new forum thread with title, topic selection, and body. */
export const ThreadForm: FC<ThreadFormProps> = ({ className }) => {
  const router = useRouter();
  const { topics } = useTopics();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTopic = (slug: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= FORUM_LIMITS.MAX_TOPICS_PER_THREAD) return prev;
      return [...prev, slug];
    });
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (title.length < FORUM_LIMITS.THREAD_TITLE_MIN) {
      newErrors.title = `Title must be at least ${FORUM_LIMITS.THREAD_TITLE_MIN} characters`;
    }
    if (body.length < FORUM_LIMITS.THREAD_BODY_MIN) {
      newErrors.body = `Body must be at least ${FORUM_LIMITS.THREAD_BODY_MIN} characters`;
    }
    if (selectedTopics.length === 0) {
      newErrors.topics = 'Select at least one topic';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, topicSlugs: selectedTopics }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to create thread');
      }

      const json = await res.json();
      router.push(`/forum/thread/${json.data.id}`);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={FORUM_LIMITS.THREAD_TITLE_MAX}
          className={cn(
            'w-full h-12 px-4 rounded-lg border bg-[var(--obsidian-800)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)] text-lg',
            'focus:outline-none focus:ring-2 focus:ring-[var(--mustard-500)] focus:ring-offset-2 focus:ring-offset-[var(--obsidian-900)]',
            errors.title
              ? 'border-[var(--status-alert)]'
              : 'border-[var(--obsidian-600)]'
          )}
        />
        {errors.title && (
          <p className="text-xs text-[var(--status-alert)]">{errors.title}</p>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          {title.length}/{FORUM_LIMITS.THREAD_TITLE_MAX}
        </p>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Topics{' '}
          <span className="text-[var(--text-muted)] font-normal">
            (select up to {FORUM_LIMITS.MAX_TOPICS_PER_THREAD})
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic.slug}
              type="button"
              onClick={() => toggleTopic(topic.slug)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                selectedTopics.includes(topic.slug)
                  ? 'bg-[var(--mustard-500)] text-[var(--navy-900)] border-[var(--mustard-500)]'
                  : 'bg-[var(--obsidian-800)] text-[var(--text-secondary)] border-[var(--obsidian-600)] hover:border-[var(--powder-500)]',
                selectedTopics.length >= FORUM_LIMITS.MAX_TOPICS_PER_THREAD &&
                  !selectedTopics.includes(topic.slug) &&
                  'opacity-40 pointer-events-none'
              )}
            >
              {topic.name}
            </button>
          ))}
        </div>
        {errors.topics && (
          <p className="text-xs text-[var(--status-alert)]">{errors.topics}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Body
        </label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts, theories, or questions about Bharatvarsh..."
          autoResize
          maxLength={FORUM_LIMITS.THREAD_BODY_MAX}
          className={cn(
            'min-h-[200px]',
            errors.body && 'border-[var(--status-alert)]'
          )}
        />
        {errors.body && (
          <p className="text-xs text-[var(--status-alert)]">{errors.body}</p>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          {body.length}/{FORUM_LIMITS.THREAD_BODY_MAX}
        </p>
      </div>

      {/* Submit */}
      {errors.submit && (
        <p className="text-sm text-[var(--status-alert)] bg-[var(--status-alert)]/10 p-3 rounded-lg">
          {errors.submit}
        </p>
      )}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={
            !title.trim() || !body.trim() || selectedTopics.length === 0
          }
          icon={<Send className="w-4 h-4" />}
        >
          Create Thread
        </Button>
      </div>
    </div>
  );
};
