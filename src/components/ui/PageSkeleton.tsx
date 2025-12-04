import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'cards';
  className?: string;
}

/**
 * PageSkeleton - Loading skeleton for page content
 *
 * Provides consistent loading states across the app with
 * multiple variants for different page types.
 */
export function PageSkeleton({ variant = 'dashboard', className }: PageSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Header Skeleton - common to all variants */}
      <div className="mb-6">
        <div className="h-8 bg-background-tertiary rounded w-48 mb-2" />
        <div className="h-4 bg-background-tertiary rounded w-64" />
      </div>

      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'cards' && <CardsSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-elevated rounded-lg p-4 border border-border">
            <div className="h-4 bg-background-tertiary rounded w-24 mb-2" />
            <div className="h-8 bg-background-tertiary rounded w-16 mb-1" />
            <div className="h-3 bg-background-tertiary rounded w-20" />
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-surface-elevated rounded-lg p-6 border border-border">
        <div className="h-5 bg-background-tertiary rounded w-32 mb-4" />
        <div className="h-64 bg-background-tertiary rounded" />
      </div>

      {/* Table/List Area */}
      <div className="bg-surface-elevated rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="h-5 bg-background-tertiary rounded w-40" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-background-tertiary rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-background-tertiary rounded w-48 mb-2" />
                <div className="h-3 bg-background-tertiary rounded w-32" />
              </div>
              <div className="h-4 bg-background-tertiary rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex gap-4 flex-wrap">
        <div className="h-10 bg-background-tertiary rounded w-64" />
        <div className="h-10 bg-background-tertiary rounded w-32" />
        <div className="h-10 bg-background-tertiary rounded w-32" />
      </div>

      {/* Table */}
      <div className="bg-surface-elevated rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-border bg-background-secondary flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-background-tertiary rounded"
              style={{ width: `${80 + Math.random() * 60}px` }}
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="h-8 w-8 bg-background-tertiary rounded-full" />
              <div className="flex-1 flex gap-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-background-tertiary rounded"
                    style={{ width: `${60 + Math.random() * 80}px` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="h-4 bg-background-tertiary rounded w-32" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-8 bg-background-tertiary rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface-elevated rounded-lg p-6 border border-border">
          <div className="h-6 bg-background-tertiary rounded w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-background-tertiary rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-6 border border-border">
          <div className="h-6 bg-background-tertiary rounded w-32 mb-4" />
          <div className="h-48 bg-background-tertiary rounded" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-surface-elevated rounded-lg p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-background-tertiary rounded-full" />
            <div>
              <div className="h-5 bg-background-tertiary rounded w-24 mb-2" />
              <div className="h-4 bg-background-tertiary rounded w-16" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-background-tertiary rounded w-20" />
                <div className="h-4 bg-background-tertiary rounded w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-6 border border-border">
          <div className="h-5 bg-background-tertiary rounded w-20 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-background-tertiary rounded-full w-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-surface-elevated rounded-lg border border-border overflow-hidden">
          <div className="h-40 bg-background-tertiary" />
          <div className="p-4">
            <div className="h-5 bg-background-tertiary rounded w-32 mb-2" />
            <div className="h-4 bg-background-tertiary rounded w-full mb-1" />
            <div className="h-4 bg-background-tertiary rounded w-3/4 mb-4" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-background-tertiary rounded w-16" />
              <div className="h-8 bg-background-tertiary rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton - Base skeleton component for custom layouts
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-background-tertiary rounded animate-pulse', className)} />
  );
}

export default PageSkeleton;
