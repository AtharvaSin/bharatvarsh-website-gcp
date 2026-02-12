/**
 * Hooks Barrel Export (legacy shim)
 *
 * Re-exports all hooks from their new locations.
 * TODO: Remove this file after all consumers are updated.
 */

// Shared hooks
export * from '@/shared/hooks';

// Feature hooks (re-exported for backwards compatibility)
export { useDossierForm } from '@/features/newsletter/hooks/use-dossier-form';
export {
  useTimelineScroll,
  useScrollValues,
  type UseTimelineScrollOptions,
  type UseTimelineScrollReturn,
} from '@/features/timeline/hooks/use-timeline-scroll';
