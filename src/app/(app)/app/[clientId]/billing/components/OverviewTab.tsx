'use client';

import { CreditCard, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Alert, Skeleton } from '@/components/ui';
import { BillingMetricsGrid, BillingSummaryCard } from '@/components/billing';
import type { BillingMetrics, BillingSummary, BillingTabId } from '@/types/billing';
import type { Workspace } from '@/types';
import { formatMoney } from '@/lib/billingDataService';

interface OverviewTabProps {
  clientId: string;
  clientSlug: string;
  metrics: BillingMetrics;
  usageWarnings: Workspace[];
  workspaces: Workspace[];
  billingSummary: BillingSummary;
  getMascotTotal: (workspaceSlug: string, plan: string) => number;
  onNavigateToTab: (tabId: BillingTabId) => void;
  isLoading?: boolean;
}

/**
 * Overview tab - Key metrics, warnings, and quick actions
 */
export function OverviewTab({
  clientId,
  metrics,
  usageWarnings,
  workspaces,
  billingSummary,
  getMascotTotal,
  onNavigateToTab,
  isLoading = false,
}: OverviewTabProps) {
  if (isLoading) {
    return <OverviewTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <BillingMetricsGrid metrics={metrics} />

      {/* Usage Warnings */}
      {usageWarnings.length > 0 && (
        <Alert variant="warning" title="Usage Warnings">
          <ul className="text-sm space-y-1 mt-2">
            {usageWarnings.map((workspace) => {
              const bundlePct = workspace.bundleLoads.limit
                ? Math.round((workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100)
                : 0;
              const sessionsPct = workspace.sessions?.limit
                ? Math.round((workspace.sessions.used / workspace.sessions.limit) * 100)
                : 0;

              return (
                <li key={workspace.id} className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-warning-500 flex-shrink-0" />
                  <span>
                    <strong>{workspace.name}</strong>
                    {bundlePct > 80 && ` - Bundle loads at ${bundlePct}%`}
                    {sessionsPct > 80 && ` - Sessions at ${sessionsPct}%`}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToTab('credits')}
            >
              Add Credits
            </Button>
          </div>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            icon={<Plus size={16} />}
            onClick={() => onNavigateToTab('credits')}
          >
            Add Credits
          </Button>
          <Link href={`/app/${clientId}/plans`}>
            <Button variant="secondary" icon={<TrendingUp size={16} />}>
              Upgrade Plan
            </Button>
          </Link>
          <Button
            variant="secondary"
            icon={<CreditCard size={16} />}
            onClick={() => onNavigateToTab('payment-methods')}
          >
            Payment Methods
          </Button>
        </div>
      </Card>

      {/* Billing Summary */}
      <BillingSummaryCard
        workspaces={workspaces}
        summary={{
          monthlyTotal: billingSummary.monthlyCharge,
          annualTotal: billingSummary.annualPrepaid,
          monthlyCount: workspaces.filter((ws) => ws.billingCycle === 'monthly').length,
          annualCount: workspaces.filter((ws) => ws.billingCycle === 'annual').length,
          earliestBilling: billingSummary.nextBillingDate,
          earliestRenewal: billingSummary.renewalDate,
          projectedOverage: 0,
          setupTotal: billingSummary.setupFees,
          baseDueThisPeriod: billingSummary.amountDue,
          overageDueThisPeriod: 0,
          totalCredits: metrics.totalCredits,
          totalActiveWorkspaces: metrics.activeWorkspaces,
        }}
        getMascotTotal={getMascotTotal}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Next Billing Date</p>
              <p className="text-lg font-semibold text-foreground">
                {billingSummary.nextBillingDate
                  ? new Date(billingSummary.nextBillingDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTab('invoices')}
            >
              View Invoices
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary">Available Credits</p>
              <p className="text-lg font-semibold text-foreground">
                {formatMoney(metrics.totalCredits, 'EUR')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTab('credits')}
            >
              Add Credits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for Overview tab
 */
function OverviewTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height="1rem" width="60%" className="mb-2" />
            <Skeleton height="2rem" width="80%" />
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Card>
        <Skeleton height="1.5rem" width="30%" className="mb-4" />
        <div className="flex gap-3">
          <Skeleton height="2.5rem" width="120px" rounded="lg" />
          <Skeleton height="2.5rem" width="120px" rounded="lg" />
          <Skeleton height="2.5rem" width="140px" rounded="lg" />
        </div>
      </Card>

      {/* Summary Skeleton */}
      <Card>
        <Skeleton height="1.5rem" width="40%" className="mb-4" />
        <div className="space-y-3">
          <Skeleton height="1rem" width="100%" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="60%" />
        </div>
      </Card>
    </div>
  );
}

export default OverviewTab;
