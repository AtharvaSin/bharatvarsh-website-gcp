import { FC } from 'react';
import { cn } from '@/shared/utils';

export interface DocumentStampProps {
  /**
   * Document ID displayed in the stamp, e.g. 'BVR-0001'.
   */
  docId: string;
  /**
   * Revision tag, e.g. 'REV 27' or 'v27'.
   */
  revision: string;
  /**
   * Clearance level, shown as a trailing segment. Omit if not needed.
   */
  clearance?: string;
  /**
   * Rotation in degrees for the "stuck on" look. Defaults to -4.
   */
  rotate?: number;
  className?: string;
}

/**
 * A classified document stamp rendered as a compact, rotated dashed-border
 * sticker. Used in the footer bottom-bar and in the corners of lore/novel
 * modals to reinforce the "leaked dossier" mood.
 *
 * The stamp is a decorative visual element with a spoken equivalent via
 * `role="img"` + `aria-label`, since the rotation and dashed border visually
 * encode semantics that a plain text reading would otherwise skip.
 *
 * Example:
 *   <DocumentStamp docId="BVR-0001" revision="REV 27" clearance="LVL 4" />
 */
export const DocumentStamp: FC<DocumentStampProps> = ({
  docId,
  revision,
  clearance,
  rotate = -4,
  className,
}) => {
  const segments = clearance ? [docId, revision, clearance] : [docId, revision];
  const ariaLabel = `Classified document ${segments.join(', ')}`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1',
        'border border-dashed border-[var(--mustard-dossier)]',
        'font-mono uppercase text-[10px] tracking-[0.18em]',
        'text-[var(--mustard-dossier)]',
        'select-none pointer-events-none',
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-[10px]">
              ▪
            </span>
          )}
          <span>{segment}</span>
        </span>
      ))}
    </div>
  );
};
