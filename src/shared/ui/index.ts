// Shared UI Component Exports
export { Button, buttonVariants, type ButtonProps } from './button';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from './card';

// Atmospheric Effect Components
export {
  FilmGrainOverlay,
  type FilmGrainOverlayProps,
} from './FilmGrainOverlay';
export { ScanlineEffect, type ScanlineEffectProps } from './ScanlineEffect';
export {
  TextReveal,
  type TextRevealProps,
  type TextRevealVariant,
} from './TextReveal';
export { ParticleField, type ParticleFieldProps } from './ParticleField';
export {
  GlyphWatermark,
  type GlyphWatermarkProps,
  type GlyphType,
} from './GlyphWatermark';
export {
  StampAnimation,
  StandaloneStamp,
  useStampTrigger,
  type StampAnimationProps,
  type StandaloneStampProps,
  type StampType,
} from './StampAnimation';
export {
  PageTransition,
  MeshScanOverlay,
  PageLoadingIndicator,
  type PageTransitionProps,
  type TransitionVariant,
  type MeshScanOverlayProps,
  type PageLoadingIndicatorProps,
} from './PageTransition';

// Error Handling
export {
  ErrorBoundary,
  withErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryWrapperProps,
} from './ErrorBoundary';

// Responsive Image Components
export {
  ResponsiveImage,
  OrientationImage,
  type ResponsiveImageProps,
  type OrientationImageProps,
} from './ResponsiveImage';

export {
  AdaptiveBackground,
  StaticBackground,
  type AdaptiveBackgroundProps,
  type StaticBackgroundProps,
} from './AdaptiveBackground';
