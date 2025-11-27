'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageProps {
  children: ReactNode;
  className?: string;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Actions to display (buttons, etc.) */
  actions?: ReactNode;
  /** Back link/breadcrumb */
  backLink?: ReactNode;
  /** Additional classes */
  className?: string;
}

export interface PageActionsProps {
  children: ReactNode;
  className?: string;
}

export interface PageContentProps {
  children: ReactNode;
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Page wrapper component
 *
 * @example
 * <Page>
 *   <PageHeader title="Dashboard" description="Overview of your account" />
 *   <PageContent>
 *     Content here
 *   </PageContent>
 * </Page>
 */
export function Page({ children, className }: PageProps) {
  return (
    <main className={cn('flex-1 lg:ml-16 min-h-screen', className)}>
      {children}
    </main>
  );
}

/**
 * Page header with title, description, and actions
 *
 * @example
 * <PageHeader
 *   title="Settings"
 *   description="Manage your account settings"
 *   actions={<Button>Save Changes</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  actions,
  backLink,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 lg:mb-8', className)}>
      {backLink && <div className="mb-4">{backLink}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-foreground-secondary mt-1">{description}</p>
          )}
        </div>
        {actions && <PageActions>{actions}</PageActions>}
      </div>
    </div>
  );
}

/**
 * Page actions container
 */
export function PageActions({ children, className }: PageActionsProps) {
  return (
    <div className={cn('flex items-center gap-3 flex-shrink-0', className)}>
      {children}
    </div>
  );
}

/**
 * Page content container with consistent max-width and padding
 *
 * @example
 * <PageContent maxWidth="7xl">
 *   Content with max-width constraint
 * </PageContent>
 */
export function PageContent({
  children,
  maxWidth = '7xl',
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        'container mx-auto p-4 lg:p-8 pt-20 lg:pt-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

export default Page;
