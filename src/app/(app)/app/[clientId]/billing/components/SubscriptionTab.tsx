'use client';

import { useState } from 'react';
import { Receipt, Bot, Plus, ChevronUp, Sparkles } from 'lucide-react';
import { Card, Badge, Skeleton, EmptyState, Button } from '@/components/ui';
import type { Workspace, Assistant } from '@/types';
import type { CreditPackage } from '@/types/billing';
import { getMascotColor } from '@/lib/brandColors';
import {
  formatMoney,
  getPlanBadgeType,
  getPlanDisplayConfig,
  getMascotCost,
  getMascotPricing,
} from '@/lib/billingDataService';

interface SubscriptionTabProps {
  workspaces: Workspace[];
  workspaceAssistants: Record<string, Assistant[]>;
  packages: CreditPackage[];
  getMascotTotal: (workspaceSlug: string, plan: string) => number;
  onPurchaseCredits?: (packageId: string, workspaceSlug?: string) => void;
  isLoading?: boolean;
}

/**
 * Plans tab - Detailed workspace billing breakdown with credits
 */
export function SubscriptionTab({
  workspaces,
  workspaceAssistants,
  packages,
  getMascotTotal,
  onPurchaseCredits,
  isLoading = false,
}: SubscriptionTabProps) {
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);

  if (isLoading) {
    return <PlansTabSkeleton />;
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={48} />}
        title="No workspaces yet"
        message="Create your first workspace to see your plan details."
      />
    );
  }

  const toggleCredits = (slug: string) => {
    setExpandedWorkspace(expandedWorkspace === slug ? null : slug);
  };

  return (
    <div className="space-y-6">
      {workspaces.map((workspace) => {
        const assistants = workspaceAssistants[workspace.slug] || [];
        const planConfig = getPlanDisplayConfig(workspace.plan);
        const mascotCost = getMascotTotal(workspace.slug, workspace.plan);
        const planCost = workspace.monthlyFee || 0;
        const totalCost = planCost + mascotCost;
        const isExpanded = expandedWorkspace === workspace.slug;

        return (
          <Card key={workspace.id} padding="none" className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {workspace.name}
                    </h3>
                    <Badge plan={getPlanBadgeType(workspace.plan)}>
                      {planConfig.name}
                    </Badge>
                    {workspace.status !== 'active' && (
                      <Badge variant="error">{workspace.status}</Badge>
                    )}
                  </div>
                  {workspace.description && (
                    <p className="text-sm text-foreground-secondary">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-background-secondary rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Monthly Cost
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {totalCost === 0 ? 'Free' : formatMoney(totalCost, 'EUR')}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {/* Plan cost */}
                  <div className="flex justify-between text-foreground-secondary">
                    <span>{planConfig.name} Plan</span>
                    <span>{planCost === 0 ? 'Free' : formatMoney(planCost, 'EUR')}</span>
                  </div>

                  {/* Mascot costs breakdown */}
                  {assistants.length > 0 && (
                    <div className="flex justify-between text-foreground-secondary">
                      <span>AI Assistants ({assistants.length})</span>
                      <span>{mascotCost === 0 ? 'Included' : formatMoney(mascotCost, 'EUR')}</span>
                    </div>
                  )}

                  {/* Billing cycle */}
                  <div className="flex justify-between text-foreground-tertiary pt-2 border-t border-border">
                    <span>Billing cycle</span>
                    <span className="capitalize">{workspace.billingCycle}</span>
                  </div>
                </div>
              </div>

              {/* AI Assistants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                    <Bot size={16} />
                    AI Assistants
                  </span>
                  <span className="text-xs text-foreground-tertiary">
                    {assistants.filter((a) => a.status === 'Active').length} active of{' '}
                    {assistants.length}
                  </span>
                </div>

                {assistants.length > 0 ? (
                  <div className="space-y-2">
                    {assistants.map((assistant) => {
                      const mascotInfo = getMascotPricing(assistant.id);
                      const cost = getMascotCost(assistant.id, workspace.plan);
                      const brandBg = getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors);

                      return (
                        <div
                          key={assistant.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        >
                          {/* Avatar */}
                          <div
                            className="relative flex-shrink-0 w-10 h-10 rounded-full border-2 border-surface-elevated shadow-sm overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: brandBg }}
                          >
                            {assistant.image?.trim() ? (
                              <img
                                src={assistant.image.trim()}
                                alt={assistant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-white">
                                {assistant.name.charAt(0)}
                              </span>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-elevated ${
                                assistant.status === 'Active'
                                  ? 'bg-success-500'
                                  : assistant.status === 'Paused'
                                    ? 'bg-warning-500'
                                    : 'bg-error-500'
                              }`}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {assistant.name}
                            </p>
                            <p className="text-xs text-foreground-tertiary truncate">
                              {mascotInfo.studioName}
                            </p>
                          </div>

                          {/* Cost */}
                          <div className="text-right flex-shrink-0">
                            {cost === 0 ? (
                              <span className="text-sm text-success-600 dark:text-success-400">
                                Included
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-foreground">
                                {formatMoney(cost, 'EUR')}/mo
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-foreground-tertiary">
                    <Bot size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No AI assistants in this workspace</p>
                  </div>
                )}
              </div>

              {/* Credits for this workspace */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground-secondary">
                    Workspace Credits
                  </span>
                  <p className="text-lg font-semibold text-foreground">
                    {formatMoney(workspace.walletCredits || 0, 'EUR')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isExpanded ? 'primary' : 'secondary'}
                  icon={isExpanded ? <ChevronUp size={14} /> : <Plus size={14} />}
                  onClick={() => toggleCredits(workspace.slug)}
                >
                  {isExpanded ? 'Close' : 'Add credits'}
                </Button>
              </div>
            </div>

            {/* Expanded: Credit packages */}
            {isExpanded && (
              <div className="border-t border-border bg-background-secondary p-6 pt-8">
                <p className="text-sm font-medium text-foreground-secondary mb-4">
                  Select amount to add to {workspace.name}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-4 rounded-lg border transition-all ${
                        pkg.popular
                          ? 'border-info-500 dark:border-info-400 border-2 bg-surface-elevated'
                          : 'border-border bg-surface-elevated'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap bg-info-500 text-white">
                          <Sparkles size={10} />
                          Best value
                        </span>
                      )}
                      <div className={`text-center ${pkg.popular ? 'mt-1' : ''}`}>
                        <p className="text-2xl font-bold text-foreground">
                          {formatMoney(pkg.credits, 'EUR')}
                        </p>
                        <p className="text-sm text-foreground-tertiary mt-1">in credits</p>
                        {pkg.bonus ? (
                          <p className="text-sm text-success-600 dark:text-success-400 font-medium mt-1">
                            +{formatMoney(pkg.bonus, 'EUR')} bonus
                          </p>
                        ) : (
                          <div className="h-5 mt-1" />
                        )}
                        <Button
                          size="sm"
                          variant={pkg.popular ? 'primary' : 'secondary'}
                          className="w-full mt-4"
                          onClick={() => onPurchaseCredits?.(pkg.id, workspace.slug)}
                        >
                          Pay {formatMoney(pkg.price, 'EUR')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Skeleton loading state
 */
function PlansTabSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton height="1.5rem" width="150px" />
                <Skeleton height="1.25rem" width="60px" rounded="full" />
              </div>
              <Skeleton height="1rem" width="250px" />
            </div>
            <Skeleton height="1rem" width="60px" />
          </div>

          {/* Cost breakdown */}
          <div className="bg-background-secondary rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-3">
              <Skeleton height="1rem" width="100px" />
              <Skeleton height="1.5rem" width="80px" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton height="1rem" width="80px" />
                <Skeleton height="1rem" width="60px" />
              </div>
              <div className="flex justify-between">
                <Skeleton height="1rem" width="120px" />
                <Skeleton height="1rem" width="60px" />
              </div>
            </div>
          </div>

          {/* Assistants */}
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 p-2">
                <Skeleton height="2.5rem" width="2.5rem" rounded="full" />
                <div className="flex-1">
                  <Skeleton height="1rem" width="100px" className="mb-1" />
                  <Skeleton height="0.75rem" width="80px" />
                </div>
                <Skeleton height="1rem" width="60px" />
              </div>
            ))}
          </div>

          {/* Credits */}
          <div className="mt-4 pt-4 border-t border-border flex justify-between">
            <div>
              <Skeleton height="0.875rem" width="100px" className="mb-1" />
              <Skeleton height="1.25rem" width="60px" />
            </div>
            <Skeleton height="2rem" width="100px" rounded="lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default SubscriptionTab;
