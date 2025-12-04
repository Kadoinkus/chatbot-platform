'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the /app/* routes
 *
 * Captures errors and provides:
 * - User-friendly error message
 * - Retry mechanism
 * - Navigation options
 * - Error logging (console for now, service later)
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console (replace with error reporting service later)
    console.error('App error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/app';
    }
  };

  // Determine error type for customized messaging
  const isNetworkError = error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to load');

  const isAuthError = error.message.includes('unauthorized') ||
    error.message.includes('401') ||
    error.message.includes('session');

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-lg w-full text-center">
        <div className="p-8">
          <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle size={32} className="text-error-600 dark:text-error-400" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isAuthError
              ? 'Session Expired'
              : isNetworkError
                ? 'Connection Error'
                : 'Something went wrong'}
          </h1>

          <p className="text-foreground-secondary mb-6">
            {isAuthError
              ? 'Your session has expired. Please log in again to continue.'
              : isNetworkError
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : 'An unexpected error occurred. Our team has been notified and is working on a fix.'}
          </p>

          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-background-secondary rounded-lg text-left">
              <p className="text-xs font-mono text-foreground-tertiary break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-foreground-tertiary mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              icon={<RefreshCw size={18} />}
            >
              Try Again
            </Button>

            <Button
              variant="secondary"
              onClick={handleGoBack}
              icon={<ArrowLeft size={18} />}
            >
              Go Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleGoHome}
              icon={<Home size={18} />}
            >
              Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
