'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover effect */
  hover?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action element (button, link, etc.) */
  action?: ReactNode;
  children?: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-4 lg:p-6',
  lg: 'p-6 lg:p-8',
};

/**
 * Card component for content sections
 *
 * @example
 * // Basic card
 * <Card>Content</Card>
 *
 * @example
 * // Card with header
 * <Card padding="none">
 *   <CardHeader title="Settings" description="Manage your settings" />
 *   <CardBody>Content here</CardBody>
 * </Card>
 *
 * @example
 * // Hoverable card
 * <Card hover>Click me</Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          hover ? 'card-hover' : 'card',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card header with title, description, and optional action
 */
export function CardHeader({
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn('p-4 lg:p-6 border-b border-border', className)}
      {...props}
    >
      {(title || description || action) ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {description && (
              <p className="text-sm text-foreground-secondary mt-1">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * Card body for main content
 */
export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('p-4 lg:p-6', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card footer for actions
 */
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('p-4 lg:p-6 border-t border-border bg-background-secondary', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
