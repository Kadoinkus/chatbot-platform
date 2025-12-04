'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-xl border border-border p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-error-600 dark:text-error-400" />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Authentication Error
        </h1>

        <p className="text-foreground-secondary mb-6">
          There was a problem with authentication. Please try logging in again.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-interactive-primary text-background dark:text-background rounded-lg hover:bg-interactive-primary-hover"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <button
            onClick={() => window.location.replace('/login')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background-hover text-foreground"
          >
            <Home size={16} />
            Login
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-foreground-tertiary hover:text-foreground-secondary">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-background-tertiary rounded text-xs overflow-auto max-h-40 text-foreground">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}