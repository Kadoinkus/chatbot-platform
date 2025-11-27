'use client';

import { cn } from '@/lib/utils';

export interface SkeletonProps {
  /** Width (CSS value or Tailwind class) */
  width?: string;
  /** Height (CSS value or Tailwind class) */
  height?: string;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional classes */
  className?: string;
}

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * Skeleton component for loading states
 *
 * @example
 * // Basic skeleton
 * <Skeleton width="100%" height="1rem" />
 *
 * @example
 * // Circle skeleton (avatar)
 * <Skeleton width="3rem" height="3rem" rounded="full" />
 *
 * @example
 * // Card skeleton
 * <Skeleton width="100%" height="12rem" rounded="2xl" />
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className,
}: SkeletonProps) {
  // Determine if width/height are Tailwind classes or CSS values
  const isWidthClass = width.startsWith('w-') || width === 'full';
  const isHeightClass = height.startsWith('h-');

  return (
    <div
      className={cn(
        'animate-pulse bg-background-tertiary',
        roundedClasses[rounded],
        isWidthClass && width,
        isHeightClass && height,
        className
      )}
      style={{
        width: !isWidthClass ? width : undefined,
        height: !isHeightClass ? height : undefined,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Spinner component for loading states
 *
 * @example
 * // Default spinner
 * <Spinner />
 *
 * @example
 * // Large centered spinner
 * <div className="flex justify-center">
 *   <Spinner size="lg" />
 * </div>
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-foreground', spinnerSizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Empty state component
 *
 * @example
 * <EmptyState
 *   icon={<FileText size={48} />}
 *   title="No documents"
 *   message="Upload your first document to get started"
 *   action={<Button>Upload Document</Button>}
 * />
 */
export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  message?: string;
  /** Action button/link */
  action?: React.ReactNode;
  /** Additional classes */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {icon && (
        <div className="empty-state-icon">
          <span className="text-foreground-tertiary">{icon}</span>
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export default Skeleton;
