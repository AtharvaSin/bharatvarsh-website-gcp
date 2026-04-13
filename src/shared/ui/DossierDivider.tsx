import { FC } from 'react';
import { cn } from '@/shared/utils';

export interface DossierDividerProps {
  /**
   * Include a small mustard square indicator at the start of the divider.
   */
  withIndicator?: boolean;
  /**
   * Render as dashed instead of solid.
   */
  dashed?: boolean;
  className?: string;
}

/**
 * A 1px Navy Signal border-top divider used in place of full card boxes in
 * high-density Classified Chronicle layouts — the "border-top only" pattern
 * that defines dossier cards and list rows across the Bharatvarsh redesign.
 *
 * The divider is purely decorative. It carries `role="separator"` so screen
 * readers can announce it as a section boundary.
 */
export const DossierDivider: FC<DossierDividerProps> = ({
  withIndicator = false,
  dashed = false,
  className,
}) => {
  return (
    <div
      role="separator"
      className={cn('w-full flex items-center gap-3', className)}
    >
      {withIndicator && (
        <span
          aria-hidden="true"
          className="inline-block w-2 h-2 bg-[var(--mustard-dossier)] flex-shrink-0"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          'flex-1 border-t',
          dashed ? 'border-dashed' : 'border-solid',
          'border-[var(--navy-signal)]'
        )}
      />
    </div>
  );
};
