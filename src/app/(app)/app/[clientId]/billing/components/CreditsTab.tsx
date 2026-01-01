'use client';

import { Coins, Plus, History, RefreshCw, Sparkles } from 'lucide-react';
import { Card, Button, Badge, Skeleton, Alert } from '@/components/ui';
import { formatMoney } from '@/lib/billingDataService';
import type { Workspace } from '@/types';
import type { CreditPackage } from '@/types/billing';

interface CreditsTabProps {
  clientId: string;
  clientSlug: string;
  totalCredits: number;
  workspaces: Workspace[];
  packages: CreditPackage[];
  isLoading?: boolean;
  error?: string | null;
  onPurchaseCredits?: (packageId: string) => void;
  onRetry?: () => void;
}

/**
 * Credits tab - Credit packages, balance, and purchase options
 */
export function CreditsTab({
  totalCredits,
  workspaces,
  packages,
  isLoading = false,
  error = null,
  onPurchaseCredits,
  onRetry,
}: CreditsTabProps) {
  if (isLoading) {
    return <CreditsTabSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load credits">
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

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-info-50 to-info-100 dark:from-info-900/30 dark:to-info-800/20 border-info-200 dark:border-info-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-info-700 dark:text-info-300 font-medium">
              Total Credit Balance
            </p>
            <p className="text-3xl font-bold text-info-900 dark:text-info-100 mt-1">
              {formatMoney(totalCredits, 'EUR')}
            </p>
            <p className="text-sm text-info-600 dark:text-info-400 mt-1">
              Available across all workspaces
            </p>
          </div>
          <div className="p-4 bg-info-200/50 dark:bg-info-800/50 rounded-full">
            <Coins size={48} className="text-info-600 dark:text-info-400" />
          </div>
        </div>
      </Card>

      {/* Credits per Workspace */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Credits by Workspace
        </h3>
        {workspaces.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No workspaces found. Credits will appear here once workspaces are created.
          </p>
        ) : (
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-info-500" />
                  <span className="font-medium text-foreground">{workspace.name}</span>
                </div>
                <span className="text-foreground-secondary font-mono">
                  {formatMoney(workspace.walletCredits || 0, 'EUR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Purchase Credits */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus size={20} />
          Purchase Credits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-visible h-full flex flex-col transition-all hover:shadow-md ${
                pkg.popular
                  ? 'border-info-500 dark:border-info-400 border-2 shadow-md'
                  : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="info" className="flex items-center gap-1 whitespace-nowrap">
                    <Sparkles size={12} />
                    Popular
                  </Badge>
                </div>
              )}
              <div className="text-center flex flex-col flex-1">
                <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
                <p className="text-3xl font-bold text-foreground mt-3">
                  {formatMoney(pkg.credits, 'EUR')}
                </p>
                <p className="text-sm text-foreground-tertiary">in credits</p>
                <div className="min-h-[1.5rem] mt-1">
                  {pkg.bonus && (
                    <p className="text-sm text-success-600 dark:text-success-400 font-medium">
                      +{formatMoney(pkg.bonus, 'EUR')} bonus
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex-1 flex flex-col justify-end">
                  <p className="text-lg font-medium text-foreground">
                    {formatMoney(pkg.price, 'EUR')}
                  </p>
                  <p className="text-xs text-foreground-tertiary">one-time payment</p>
                  <Button
                    className="mt-4 w-full"
                    variant={pkg.popular ? 'primary' : 'secondary'}
                    onClick={() => onPurchaseCredits?.(pkg.id)}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History Link */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background-secondary rounded-lg">
              <History size={20} className="text-foreground-tertiary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Transaction History</p>
              <p className="text-sm text-foreground-secondary">
                View all credit purchases and deductions
              </p>
            </div>
          </div>
          <Button variant="secondary">View History</Button>
        </div>
      </Card>

      {/* Info about credits */}
      <Alert variant="info" title="How credits work">
        <ul className="text-sm space-y-1 mt-2">
          <li>Credits are used to cover usage overages beyond your plan limits</li>
          <li>Unused credits roll over month to month</li>
          <li>Bonus credits are applied automatically with eligible packages</li>
        </ul>
      </Alert>
    </div>
  );
}

/**
 * Skeleton loading state for Credits tab
 */
function CreditsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance skeleton */}
      <Card className="bg-gradient-to-r from-info-50 to-info-100 dark:from-info-900/30 dark:to-info-800/20">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton height="1rem" width="150px" className="mb-2" />
            <Skeleton height="2.5rem" width="120px" className="mb-2" />
            <Skeleton height="1rem" width="180px" />
          </div>
          <Skeleton height="4rem" width="4rem" rounded="full" />
        </div>
      </Card>

      {/* Workspace credits skeleton */}
      <Card>
        <Skeleton height="1.5rem" width="40%" className="mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between p-3 mb-2">
            <Skeleton height="1rem" width="40%" />
            <Skeleton height="1rem" width="20%" />
          </div>
        ))}
      </Card>

      {/* Packages skeleton */}
      <div>
        <Skeleton height="1.5rem" width="30%" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="text-center">
                <Skeleton height="1.25rem" width="60%" className="mx-auto mb-3" />
                <Skeleton height="2rem" width="50%" className="mx-auto mb-1" />
                <Skeleton height="1rem" width="40%" className="mx-auto mb-4" />
                <Skeleton height="2.5rem" width="100%" rounded="lg" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreditsTab;
