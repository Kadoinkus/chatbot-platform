'use client';

import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Alert type */
  variant?: AlertVariant;
  /** Alert title */
  title?: string;
  /** Alert message/content */
  children: ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Dismissible alert */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Additional classes */
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const icons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

/**
 * Alert component for notifications and messages
 *
 * @example
 * // Info alert
 * <Alert variant="info" title="Note">
 *   This is an informational message.
 * </Alert>
 *
 * @example
 * // Dismissible error
 * <Alert variant="error" dismissible onDismiss={() => {}}>
 *   Something went wrong!
 * </Alert>
 */
export function Alert({
  variant = 'info',
  title,
  children,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div className={cn(variantClasses[variant], className)} role="alert">
      {showIcon && (
        <span className="alert-icon flex-shrink-0">
          <Icon size={20} />
        </span>
      )}
      <div className="flex-1">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-message">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 -m-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Alert;
