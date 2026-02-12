'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI to show on error */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show the error message in the fallback */
  showError?: boolean;
  /** Custom reset action */
  onReset?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 *
 * Prevents the entire app from crashing when a component throws an error.
 * Shows a fallback UI and provides options for recovery.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className={`
            flex flex-col items-center justify-center p-8 text-center
            bg-[var(--obsidian-800)] border border-[var(--obsidian-600)]
            rounded-lg min-h-[200px]
            ${this.props.className || ''}
          `}
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-[var(--status-alert)] mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              An error occurred while rendering this section.
            </p>
          </div>

          {/* Show error message if enabled */}
          {this.props.showError && this.state.error && (
            <div className="mb-4 p-3 bg-[var(--obsidian-900)] rounded text-left w-full max-w-md">
              <code className="text-xs text-[var(--status-alert)] break-all">
                {this.state.error.message}
              </code>
            </div>
          )}

          {/* Reset button */}
          <Button
            onClick={this.handleReset}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple wrapper component for functional component usage
 */
export interface ErrorBoundaryWrapperProps extends Omit<ErrorBoundaryProps, 'children'> {
  children: ReactNode;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
