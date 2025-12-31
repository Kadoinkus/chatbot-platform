import Link from 'next/link';
import {
  CheckCircle,
  MessageCircle, Users, Info,
  ArrowLeft, Check, X
} from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
} from '@/components/ui';
import { getBillingPlans } from '@/lib/billingPlansService';
import {
  formatPlanForDisplay,
  PLAN_ICONS,
  PLAN_ICON_COLORS,
  PLAN_CARD_STYLES,
  COMPARISON_ROWS,
  getComparisonValue,
  type DisplayPlan,
} from '@/lib/planDisplayConfig';
import type { BillingPlan } from '@/types';

// Currency formatter for consistent display (€ before number)
const formatPrice = (price: number): string => {
  return `€${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function PlansPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  // Fetch plans from database (returns [] on error)
  const billingPlans = await getBillingPlans();
  const plans = billingPlans.map(formatPlanForDisplay);

  // Handle empty state (no plans or fetch error)
  if (plans.length === 0) {
    return (
      <Page>
        <PageContent>
          <PageHeader
            title="Choose Your Plan"
            description="Select the perfect plan for your workspace needs."
            backLink={
              <Link
                href={`/app/${clientId}/settings`}
                className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Settings
              </Link>
            }
          />
          <Alert variant="warning" title="Plans Unavailable">
            Unable to load pricing plans. Please try again later.
          </Alert>
        </PageContent>
      </Page>
    );
  }

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Choose Your Plan"
          description="Select the perfect plan for your workspace needs. Each workspace has its own plan."
          backLink={
            <Link
              href={`/app/${clientId}/settings`}
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>
          }
        />

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start mb-8">
          {plans.map((plan) => {
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
                    <Icon size={24} className={iconColor} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h4>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {plan.isCustom || plan.price === null || plan.price === 0 ? (
                      <span className="text-xl sm:text-2xl">Contact Sales</span>
                    ) : (
                      <>
                        {formatPrice(plan.price)}
                        <span className="text-lg text-foreground-secondary font-normal">
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
                <div className="mt-6">
                  <p className="font-medium text-sm text-foreground-secondary mb-3">
                    Shared Resource Pool:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg p-2 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={12} className="text-foreground-secondary" />
                        <span className="text-xs text-foreground-secondary font-medium">
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
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle
                          size={12}
                          className="text-foreground-secondary"
                        />
                        <span className="text-xs text-foreground-secondary font-medium">
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
                <div className="mt-6">
                  <p className="font-medium text-sm text-foreground-secondary mb-2">
                    Key Features:
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle
                          size={14}
                          className="text-success-500 mt-0.5 flex-shrink-0"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buttons Section */}
                <div className="mt-6 flex justify-center sm:block">
                  {plan.tier === 'enterprise' ? (
                    <Button className="w-auto sm:w-full">Contact Sales</Button>
                  ) : (
                    <Button
                      className={`w-auto sm:w-full ${
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
        <Card className="mb-8 hidden sm:block">
          <h4 className="font-semibold mb-6 flex items-center gap-2 text-base sm:text-lg text-foreground">
            <Info size={20} className="text-info-600 dark:text-info-500" />
            Detailed Plan Comparison
          </h4>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Feature</TableHead>
                  {plans.map((plan) => {
                    const Icon = PLAN_ICONS[plan.tier];
                    const iconColor = PLAN_ICON_COLORS[plan.tier];
                    const priceDisplay =
                      plan.isCustom || plan.price === null || plan.price === 0
                        ? 'Contact Sales'
                        : `${formatPrice(plan.price)}/mo`;

                    return (
                      <TableHead key={plan.tier} className="text-center w-36">
                        <div className="flex flex-col items-center gap-1">
                          <Icon size={16} className={iconColor} />
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
                        row.key === 'templates' && value !== 'Basic only';

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
        <div className="sm:hidden space-y-3 mb-8">
          <h4 className="font-semibold flex items-center gap-2 text-base text-foreground mb-4">
            <Info size={18} className="text-info-600 dark:text-info-500" />
            Plan Comparison
          </h4>
          {COMPARISON_ROWS.map((row) => (
            <Card key={row.key} className="p-3">
              <h5 className="font-medium text-xs text-foreground-secondary mb-2">
                {row.label}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {billingPlans.map((plan) => {
                  const value = getComparisonValue(plan, row.key);
                  const displayPlan = plans.find((p) => p.tier === plan.planSlug);

                  return (
                    <div
                      key={plan.planSlug}
                      className="text-center p-2 bg-background-secondary rounded-lg"
                    >
                      <span className="text-xs text-foreground-tertiary block mb-1">
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
          <p className="mb-4">
            You can always add credit-based mascots to any plan for overflow
            capacity or specialized use cases.
          </p>
          <div className="text-sm">
            <p className="font-medium text-foreground">Credit Pricing:</p>
            <p className="text-foreground-secondary">
              Unique Users: $0.04 each • Conversations: $0.0015 each
            </p>
          </div>
        </Alert>
      </PageContent>
    </Page>
  );
}
