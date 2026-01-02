'use client';

import {
  CheckCircle,
  MessageCircle,
  Users,
  Info,
  Check,
  X,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  Button,
  Skeleton,
  EmptyState,
  Badge,
} from '@/components/ui';
import type { BillingPlan } from '@/types';
import {
  PLAN_ICONS,
  PLAN_ICON_COLORS,
  PLAN_CARD_STYLES,
  COMPARISON_ROWS,
  getComparisonValue,
  type DisplayPlan,
} from '@/lib/planDisplayConfig';

interface PlansTabProps {
  billingPlans: BillingPlan[];
  displayPlans: DisplayPlan[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

// Currency formatter for consistent display
const formatPrice = (price: number): string => {
  return `€${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export function PlansTab({
  billingPlans,
  displayPlans,
  isLoading,
  error,
  onRetry,
}: PlansTabProps) {
  if (isLoading) {
    return <PlansTabSkeleton />;
  }

  if (error) {
    return (
      <Card className="text-center p-8">
        <div className="flex justify-center mb-4">
          <Receipt size={32} className="text-warning-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Unable to Load Plans
        </h3>
        <p className="text-foreground-secondary mb-4">{error}</p>
        {onRetry && (
          <Button icon={<RefreshCw size={16} />} onClick={onRetry}>
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (displayPlans.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={48} />}
        title="Plans Unavailable"
        message="Unable to load pricing plans. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
        {displayPlans.map((plan) => {
          const Icon = PLAN_ICONS[plan.tier];
          const iconColor = PLAN_ICON_COLORS[plan.tier];
          const cardStyle = PLAN_CARD_STYLES[plan.tier];

          return (
            <div
              key={plan.tier}
              className={`relative rounded-xl border-2 p-4 sm:p-6 bg-surface-elevated grid grid-rows-[auto_auto_1fr_auto] min-h-0 sm:min-h-[580px] ${cardStyle.borderClass}`}
            >
              {/* Header Section */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon size={22} className={iconColor} />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  {plan.name}
                </h4>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {plan.isCustom || plan.price === null || plan.price === 0 ? (
                    <span className="text-xl">Contact Sales</span>
                  ) : (
                    <>
                      {formatPrice(plan.price)}
                      <span className="text-base text-foreground-secondary font-normal">
                        /month
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground-secondary">
                  {plan.mascotSlots === null
                    ? 'Custom mascot slots'
                    : `${plan.mascotSlots} mascot slot${plan.mascotSlots !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Resource Pool Section */}
              <div className="mt-4">
                <p className="font-medium text-xs text-foreground-secondary mb-2">
                  Shared Resource Pool:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users size={11} className="text-foreground-secondary" />
                      <span className="text-[10px] text-foreground-secondary font-medium">
                        Unique Users
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {plan.sharedLimits.uniqueUsers === null
                        ? 'Custom'
                        : plan.sharedLimits.uniqueUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-lg p-2 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageCircle size={11} className="text-foreground-secondary" />
                      <span className="text-[10px] text-foreground-secondary font-medium">
                        Conversations
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {plan.sharedLimits.conversations === null
                        ? 'Custom'
                        : plan.sharedLimits.conversations.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mt-4">
                <p className="font-medium text-xs text-foreground-secondary mb-2">
                  Key Features:
                </p>
                <ul className="space-y-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <CheckCircle
                        size={12}
                        className="text-success-500 mt-0.5 flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <div className="mt-4">
                {plan.tier === 'enterprise' ? (
                  <Button size="sm" className="w-full">
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={`w-full ${
                      plan.tier === 'basic'
                        ? 'bg-info-600 hover:bg-info-700'
                        : plan.tier === 'premium'
                          ? 'bg-plan-premium-text hover:opacity-90'
                          : ''
                    }`}
                  >
                    Assign to Workspace
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison Table - Hidden on mobile */}
      <Card className="hidden sm:block" padding="md">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-base text-foreground">
          <Info size={18} className="text-info-600 dark:text-info-500" />
          Detailed Plan Comparison
        </h4>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">Feature</TableHead>
                {displayPlans.map((plan) => {
                  const Icon = PLAN_ICONS[plan.tier];
                  const iconColor = PLAN_ICON_COLORS[plan.tier];
                  const priceDisplay =
                    plan.isCustom || plan.price === null || plan.price === 0
                      ? 'Contact Sales'
                      : `${formatPrice(plan.price)}/mo`;

                  return (
                    <TableHead key={plan.tier} className="text-center w-32">
                      <div className="flex flex-col items-center gap-1">
                        <Icon size={14} className={iconColor} />
                        <span>{plan.name}</span>
                        <span className="text-xs font-normal text-foreground-tertiary">
                          {priceDisplay}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium text-foreground-secondary">
                    {row.label}
                  </TableCell>
                  {billingPlans.map((plan) => {
                    const value = getComparisonValue(plan, row.key);

                    // Boolean rendering (checkmarks)
                    if (typeof value === 'boolean') {
                      return (
                        <TableCell key={plan.planSlug} className="text-center">
                          {value ? (
                            <Check
                              size={16}
                              className="mx-auto text-success-600 dark:text-success-500"
                            />
                          ) : (
                            <X size={16} className="mx-auto text-error-500" />
                          )}
                        </TableCell>
                      );
                    }

                    // String rendering
                    const isHighlighted =
                      row.key === 'templates' && value !== 'Basic';

                    return (
                      <TableCell
                        key={plan.planSlug}
                        className={`text-center ${
                          isHighlighted
                            ? 'text-success-600 dark:text-success-500 font-medium'
                            : 'text-foreground-secondary'
                        }`}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Comparison Cards - Visible only on mobile */}
      <div className="sm:hidden space-y-3">
        <h4 className="font-semibold flex items-center gap-2 text-base text-foreground">
          <Info size={16} className="text-info-600 dark:text-info-500" />
          Plan Comparison
        </h4>
        {COMPARISON_ROWS.slice(0, 6).map((row) => (
          <Card key={row.key} padding="sm">
            <h5 className="font-medium text-xs text-foreground-secondary mb-2">
              {row.label}
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {billingPlans.map((plan) => {
                const value = getComparisonValue(plan, row.key);
                const displayPlan = displayPlans.find((p) => p.tier === plan.planSlug);

                return (
                  <div
                    key={plan.planSlug}
                    className="text-center p-2 bg-background-secondary rounded-lg"
                  >
                    <span className="text-[10px] text-foreground-tertiary block mb-1">
                      {displayPlan?.name || plan.planName}
                    </span>
                    {typeof value === 'boolean' ? (
                      value ? (
                        <Check
                          size={14}
                          className="mx-auto text-success-600 dark:text-success-500"
                        />
                      ) : (
                        <X size={14} className="mx-auto text-error-500" />
                      )
                    ) : (
                      <span className="text-xs font-medium text-foreground">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Credit Pricing Info */}
      <Alert variant="info" title="Need More Flexibility?">
        <p className="mb-3 text-sm">
          Top up your workspace with credits so your mascot continues working
          seamlessly when monthly limits are reached.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-foreground">Credit Pricing:</p>
            <p className="text-foreground-secondary">
              Unique Users: €0.04 each • Conversations: €0.0015 each
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.href = window.location.pathname + '?tab=overview'}
          >
            Add Credits
          </Button>
        </div>
      </Alert>
    </div>
  );
}

/**
 * Skeleton loading state
 */
function PlansTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="text-center space-y-3">
              <Skeleton height="1.5rem" width="1.5rem" className="mx-auto" />
              <Skeleton height="1.25rem" width="80px" className="mx-auto" />
              <Skeleton height="2rem" width="100px" className="mx-auto" />
              <Skeleton height="1rem" width="120px" className="mx-auto" />
              <div className="space-y-2 mt-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} height="0.875rem" width="100%" />
                ))}
              </div>
              <Skeleton height="2rem" width="100%" className="mt-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PlansTab;
