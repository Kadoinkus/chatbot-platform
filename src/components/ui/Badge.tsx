'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgePlan = 'starter' | 'basic' | 'premium' | 'enterprise';
export type BadgeRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type BadgeStatus = 'live' | 'paused' | 'needs-finalization' | 'draft';

export interface BadgeProps {
  children?: ReactNode;
  /** Color variant */
  variant?: BadgeVariant;
  /** Plan badge type */
  plan?: BadgePlan;
  /** Role badge type */
  role?: BadgeRole;
  /** Status badge type */
  status?: BadgeStatus;
  /** Show status dot */
  dot?: boolean;
  /** Additional classes */
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-background-tertiary text-foreground-secondary',
  success: 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500',
  warning: 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500',
  error: 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500',
  info: 'bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500',
};

const planClasses: Record<BadgePlan, string> = {
  starter: 'badge-plan-starter',
  basic: 'badge-plan-basic',
  premium: 'badge-plan-premium',
  enterprise: 'badge-plan-enterprise',
};

const roleClasses: Record<BadgeRole, string> = {
  owner: 'badge-role-owner',
  admin: 'badge-role-admin',
  agent: 'badge-role-agent',
  viewer: 'badge-role-viewer',
};

const roleLabels: Record<BadgeRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  agent: 'Agent',
  viewer: 'Viewer',
};

const statusConfig: Record<BadgeStatus, { variant: BadgeVariant; label: string }> = {
  live: { variant: 'success', label: 'Live' },
  paused: { variant: 'warning', label: 'Paused' },
  'needs-finalization': { variant: 'error', label: 'Needs Finalization' },
  draft: { variant: 'default', label: 'Draft' },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-foreground-tertiary',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
};

/**
 * Badge component for labels, statuses, plans, and roles
 *
 * @example
 * // Basic badge
 * <Badge>Label</Badge>
 *
 * @example
 * // Status badge
 * <Badge status="live" />
 *
 * @example
 * // Plan badge
 * <Badge plan="premium">Premium</Badge>
 *
 * @example
 * // Role badge
 * <Badge role="admin" />
 *
 * @example
 * // With dot
 * <Badge variant="success" dot>Active</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  plan,
  role,
  status,
  dot = false,
  className,
}: BadgeProps) {
  // Handle status badge
  if (status) {
    const config = statusConfig[status];
    return (
      <span
        className={cn(
          'badge',
          variantClasses[config.variant],
          className
        )}
      >
        <span className={cn('status-dot', dotColors[config.variant])} />
        {children || config.label}
      </span>
    );
  }

  // Handle plan badge
  if (plan) {
    return (
      <span className={cn('badge', planClasses[plan], className)}>
        {children}
      </span>
    );
  }

  // Handle role badge
  if (role) {
    return (
      <span className={cn('badge', roleClasses[role], className)}>
        {children || roleLabels[role]}
      </span>
    );
  }

  // Default badge
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {dot && <span className={cn('status-dot', dotColors[variant])} />}
      {children}
    </span>
  );
}

export default Badge;
