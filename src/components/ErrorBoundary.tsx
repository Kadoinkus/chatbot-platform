'use client';
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-elevated rounded-xl border border-gray-200 dark:border-border p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600 dark:text-error-400" />
            </div>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-text-primary mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-text-secondary mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-surface-hover text-foreground"
              >
                <RefreshCw size={16} />
                Refresh Page
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-interactive-primary text-white dark:text-background rounded-lg hover:bg-gray-800 dark:hover:bg-interactive-primary-hover"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-text-tertiary hover:text-gray-700 dark:hover:text-text-secondary">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-surface-hover rounded text-xs overflow-auto text-foreground">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error fallback component
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">Error occurred</h3>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
          <button
            onClick={resetError}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}