import { FC } from 'react';
import { cn } from '@/shared/utils';

export interface EyebrowLabelProps {
  /**
   * Segments to render, joined by a mustard `▪` separator.
   * Example: ['DOSSIER', 'CASE #0042', 'INDRAPUR HQ']
   */
  segments: ReadonlyArray<string>;
  /**
   * Render at a larger 13px size instead of the default 11px.
   */
  large?: boolean;
  className?: string;
}

/**
 * JetBrains Mono all-caps metadata label with mustard dot separators —
 * the signature Bharatvarsh Classified Chronicle eyebrow used above every
 * section headline, in hero meta rows, and on dossier stamps. Semantic text
 * is carried by the segment spans themselves; no `aria-label` is applied
 * since the native text content is already screen-reader friendly and the
 * `▪` separators are marked `aria-hidden`.
 */
export const EyebrowLabel: FC<EyebrowLabelProps> = ({
  segments,
  large = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'font-mono uppercase text-[var(--shadow-text)]',
        large ? 'text-[13px]' : 'text-[11px]',
        'tracking-[0.18em] leading-none flex items-center gap-2 flex-wrap',
        className
      )}
    >
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span
              aria-hidden="true"
              className="text-[var(--mustard-dossier)] text-[10px]"
            >
              ▪
            </span>
          )}
          <span>{segment}</span>
        </span>
      ))}
    </div>
  );
};
