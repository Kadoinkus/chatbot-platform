'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for billing tab panels
 * Catches rendering errors and displays a recovery UI
 */
export class BillingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Billing tab error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-error-100 dark:bg-error-900/30">
              <AlertTriangle size={32} className="text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Something went wrong
              </h3>
              <p className="text-sm text-foreground-secondary mb-4">
                An error occurred while loading this section. Please try again.
              </p>
              {this.state.error && (
                <p className="text-xs text-foreground-tertiary mb-4 font-mono bg-background-secondary p-2 rounded">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <Button
              onClick={this.handleRetry}
              icon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default BillingErrorBoundary;
