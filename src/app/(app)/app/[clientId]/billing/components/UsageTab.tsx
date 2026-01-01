'use client';

import { BarChart3, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, Alert, Skeleton, Button } from '@/components/ui';
import type { Workspace } from '@/types';
import { getUsageColor, getUsageLevel } from '@/types/billing';

interface UsageAggregate {
  used: number;
  limit: number;
  percentage: number;
}

interface WorkspaceUsage {
  workspace: Workspace;
  bundlePercentage: number;
  sessionPercentage: number;
  hasWarning: boolean;
}

interface UsageTabProps {
  clientId: string;
  clientSlug: string;
  bundleUsage: UsageAggregate;
  sessionUsage: UsageAggregate;
  messageUsage: UsageAggregate;
  workspaceUsage: WorkspaceUsage[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Usage tab - Usage breakdown, limits, and projections
 */
export function UsageTab({
  bundleUsage,
  sessionUsage,
  messageUsage,
  workspaceUsage,
  isLoading = false,
  error = null,
  onRetry,
}: UsageTabProps) {
  if (isLoading) {
    return <UsageTabSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load usage data">
        <p className="mt-1">{error}</p>
        {onRetry && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<RefreshCw size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  const usageMetrics = [
    { label: 'Bundle Loads', ...bundleUsage },
    { label: 'Sessions', ...sessionUsage },
    { label: 'Messages', ...messageUsage },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <BarChart3 size={24} />
        Usage Overview
      </h2>

      {/* Aggregate Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usageMetrics.map((metric) => {
          const level = getUsageLevel(metric.percentage);
          const colorClass = getUsageColor(metric.percentage);

          return (
            <Card key={metric.label}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  {metric.label}
                </span>
                {level !== 'normal' && (
                  <AlertTriangle
                    size={16}
                    className={
                      level === 'exceeded'
                        ? 'text-error-500'
                        : level === 'critical'
                        ? 'text-orange-500'
                        : 'text-warning-500'
                    }
                  />
                )}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-foreground">
                  {metric.used.toLocaleString()}
                </span>
                <span className="text-sm text-foreground-secondary">
                  / {metric.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${colorClass}`}
                  style={{ width: `${Math.min(100, metric.percentage)}%` }}
                />
              </div>
              <p className="text-xs text-foreground-tertiary mt-2">
                {Math.round(metric.percentage)}% used
                {metric.percentage > 100 && (
                  <span className="text-error-500 ml-1">
                    ({Math.round(metric.percentage - 100)}% overage)
                  </span>
                )}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Usage Thresholds Legend */}
      <Card className="p-4">
        <p className="text-sm font-medium text-foreground mb-3">Usage Thresholds</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info-500" />
            <span className="text-sm text-foreground-secondary">Normal (0-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-500" />
            <span className="text-sm text-foreground-secondary">Warning (80-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-foreground-secondary">Critical (90-99%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error-500" />
            <span className="text-sm text-foreground-secondary">Exceeded (100%+)</span>
          </div>
        </div>
      </Card>

      {/* Per Workspace Usage */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Usage by Workspace
        </h3>
        {workspaceUsage.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No workspaces found. Usage data will appear here once workspaces are active.
          </p>
        ) : (
          <div className="space-y-4">
            {workspaceUsage.map(({ workspace, bundlePercentage, sessionPercentage, hasWarning }) => (
              <div key={workspace.id} className="p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">{workspace.name}</span>
                  {hasWarning && (
                    <AlertTriangle size={16} className="text-warning-500" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground-secondary">Bundle Loads</span>
                      <span className="text-foreground-tertiary">
                        {Math.round(bundlePercentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getUsageColor(bundlePercentage)}`}
                        style={{ width: `${Math.min(100, bundlePercentage)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground-secondary">Sessions</span>
                      <span className="text-foreground-tertiary">
                        {Math.round(sessionPercentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getUsageColor(sessionPercentage)}`}
                        style={{ width: `${Math.min(100, sessionPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Projections (Coming Soon) */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} className="text-info-500" />
          <h3 className="text-lg font-semibold text-foreground">Usage Projections</h3>
        </div>
        <Alert variant="info">
          <p className="text-sm">
            Advanced usage projections coming soon. This will include trend analysis,
            overage predictions, and recommendations for plan upgrades.
          </p>
        </Alert>
      </Card>
    </div>
  );
}

/**
 * Skeleton loading state for Usage tab
 */
function UsageTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Skeleton height="1.75rem" width="200px" />

      {/* Usage cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height="1rem" width="60%" className="mb-3" />
            <Skeleton height="2rem" width="80%" className="mb-2" />
            <Skeleton height="0.75rem" width="100%" rounded="full" className="mb-2" />
            <Skeleton height="0.75rem" width="40%" />
          </Card>
        ))}
      </div>

      {/* Workspace usage skeleton */}
      <Card>
        <Skeleton height="1.5rem" width="40%" className="mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-background-secondary rounded-lg mb-3 last:mb-0">
            <Skeleton height="1.25rem" width="30%" className="mb-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton height="0.5rem" width="100%" rounded="full" />
              </div>
              <div>
                <Skeleton height="0.5rem" width="100%" rounded="full" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default UsageTab;
