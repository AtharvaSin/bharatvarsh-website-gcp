'use client';

import { FC, ReactNode, useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';
import { useSession } from '@/features/auth';
import { REPORT_REASONS } from '../constants';

interface ReportDialogProps {
  trigger: ReactNode;
  contentType: 'thread' | 'post';
  contentId: string;
  className?: string;
}

/**
 * Modal dialog for reporting forum content. Displays REPORT_REASONS as
 * selectable options, an optional description textarea, and submits the
 * report to the API. Tracks whether the user has already reported.
 */
export const ReportDialog: FC<ReportDialogProps> = ({
  trigger,
  contentType,
  contentId,
  className,
}) => {
  const { isAuthenticated } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const resetForm = () => {
    setSelectedReason(null);
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {
        reason: selectedReason,
      };
      if (description.trim()) {
        payload.description = description.trim();
      }
      if (contentType === 'thread') {
        payload.threadId = contentId;
      } else {
        payload.postId = contentId;
      }

      const res = await fetch('/api/forum/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit report');
      }

      setHasReported(true);
      toast.success('Report submitted. Thank you for helping keep the community safe.');
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className={className}>{trigger}</span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-[var(--status-alert)]" />
            Report {contentType === 'thread' ? 'Thread' : 'Post'}
          </DialogTitle>
          <DialogDescription>
            Help us maintain community standards by reporting content that
            violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle className="w-8 h-8 text-[var(--status-warning)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              You must be signed in to report content.
            </p>
          </div>
        ) : hasReported ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Flag className="w-8 h-8 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              You have already reported this content. Our moderators will review
              it shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Reason
              </label>
              <div className="flex flex-wrap gap-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      'border',
                      selectedReason === reason.value
                        ? 'bg-[var(--mustard-500)]/20 border-[var(--mustard-500)] text-[var(--mustard-400)]'
                        : 'bg-[var(--obsidian-700)] border-[var(--obsidian-600)] text-[var(--text-secondary)] hover:border-[var(--obsidian-500)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Additional details{' '}
                <span className="text-[var(--text-muted)] font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context about the issue..."
                maxLength={2000}
                className="min-h-[80px]"
              />
              <span className="text-xs text-[var(--text-muted)]">
                {description.length}/2000
              </span>
            </div>

            <DialogFooter className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!selectedReason}
                icon={<Flag className="w-4 h-4" />}
              >
                Submit Report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
