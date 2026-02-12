/**
 * Hooks Barrel Export
 *
 * Re-exports shared hooks from new location + feature-specific hooks
 * that haven't been moved yet.
 */

// Shared hooks (re-exported from new location)
export * from '@/shared/hooks';

// Feature-specific hooks (will move to features/ in Batch C)
export { useDossierForm } from './use-dossier-form';
export {
  useTimelineScroll,
  useScrollValues,
  type UseTimelineScrollOptions,
  type UseTimelineScrollReturn,
} from './use-timeline-scroll';
