'use client';

import { FC } from 'react';
import { Bot, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';

interface AiReviewPanelProps {
  decision: string;
  confidence: number;
  reasons: string[];
  categories: string[];
  suggestion?: string;
  className?: string;
}

interface DecisionConfig {
  icon: typeof ShieldCheck;
  color: string;
  label: string;
  bg: string;
}

const DECISION_MAP: Record<string, DecisionConfig> = {
  PASS: {
    icon: ShieldCheck,
    color: 'var(--status-success)',
    label: 'Pass',
    bg: 'bg-[var(--status-success)]/10',
  },
  FLAGGED: {
    icon: ShieldAlert,
    color: 'var(--status-warning)',
    label: 'Flagged',
    bg: 'bg-[var(--status-warning)]/10',
  },
  BLOCKED: {
    icon: ShieldX,
    color: 'var(--status-alert)',
    label: 'Blocked',
    bg: 'bg-[var(--status-alert)]/10',
  },
};

const DEFAULT_DECISION_CONFIG: DecisionConfig = {
  icon: Bot,
  color: 'var(--text-muted)',
  label: 'Unknown',
  bg: 'bg-[var(--obsidian-700)]',
};

/** Displays AI moderation decision details including confidence, reasons, and categories. */
export const AiReviewPanel: FC<AiReviewPanelProps> = ({
  decision,
  confidence,
  reasons,
  categories,
  suggestion,
  className,
}) => {
  const config = DECISION_MAP[decision] ?? DEFAULT_DECISION_CONFIG;
  const resolvedLabel = decision in DECISION_MAP ? config.label : decision;
  const Icon = config.icon;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          AI Review
        </span>
      </div>

      {/* Decision badge + Confidence bar */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            config.bg
          )}
          style={{ color: config.color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {resolvedLabel}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--obsidian-700)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${confidencePercent}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)] tabular-nums">
            {confidencePercent}%
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map((cat) => (
            <Badge key={cat} variant="default" className="text-[10px] px-1.5 py-0.5">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Reasons */}
      {reasons.length > 0 && (
        <ul className="space-y-1 mb-3">
          {reasons.map((reason, i) => (
            <li
              key={`reason-${i}`}
              className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5"
            >
              <span className="text-[var(--text-muted)] mt-1" aria-hidden="true">
                &bull;
              </span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Suggestion */}
      {suggestion && (
        <div className="p-2.5 rounded bg-[var(--navy-500)]/10 border border-[var(--navy-500)]/20">
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--navy-500)]">Suggestion: </span>
            {suggestion}
          </p>
        </div>
      )}
    </div>
  );
};
