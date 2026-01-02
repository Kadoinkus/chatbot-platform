'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Receipt, Bot, Plus, ChevronUp, ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
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
  const params = useParams();
  const clientId = params.clientId as string;
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [expandedCredits, setExpandedCredits] = useState<string | null>(null);

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

  const toggleDetails = (slug: string) => {
    setExpandedDetails(expandedDetails === slug ? null : slug);
  };

  const toggleCredits = (slug: string) => {
    setExpandedCredits(expandedCredits === slug ? null : slug);
  };

  return (
    <div className="space-y-8">
      {workspaces.map((workspace) => {
        const assistants = workspaceAssistants[workspace.slug] || [];
        const planConfig = getPlanDisplayConfig(workspace.plan);
        const mascotCost = getMascotTotal(workspace.slug, workspace.plan);
        const planCost = workspace.monthlyFee || 0;
        const totalCost = planCost + mascotCost;
        const isDetailsExpanded = expandedDetails === workspace.slug;
        const isCreditsExpanded = expandedCredits === workspace.slug;

        return (
          <Card key={workspace.id} padding="none" className="overflow-hidden shadow-md rounded-xl">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Workspace</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-2xl font-bold text-foreground">
                      {workspace.name}
                    </h3>
                    <Badge plan={getPlanBadgeType(workspace.plan)}>
                      {planConfig.name}
                    </Badge>
                    {workspace.status !== 'active' && (
                      <Badge variant="error">{workspace.status}</Badge>
                    )}
                  </div>
                </div>
                <Link
                  href={`/app/${clientId}/billing?tab=plans`}
                  className="hidden sm:flex items-center gap-1 text-xs text-foreground-tertiary hover:text-foreground-secondary transition-colors mt-1"
                >
                  Change plan
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left Column - Costs */}
              <div className="p-4">
                <h4 className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider mb-3">Monthly Costs</h4>
                <div className="space-y-2 text-sm">
                  {/* Plan */}
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">{planConfig.name} Plan</span>
                    <span className="text-foreground">{planCost === 0 ? 'Free' : formatMoney(planCost, 'EUR')}</span>
                  </div>

                  {/* Each Assistant */}
                  {assistants.map((assistant) => {
                    const cost = getMascotCost(assistant.id, workspace.plan);
                    const brandBg = getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors);
                    return (
                      <div key={assistant.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: brandBg }}
                          >
                            {assistant.image?.trim() ? (
                              <img src={assistant.image.trim()} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-semibold text-white">{assistant.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-foreground-secondary">{assistant.name}</span>
                        </div>
                        <span className="text-foreground">
                          {cost === 0 ? <span className="text-success-600 dark:text-success-400">Included</span> : formatMoney(cost, 'EUR')}
                        </span>
                      </div>
                    );
                  })}

                  {assistants.length === 0 && (
                    <div className="flex justify-between text-foreground-tertiary">
                      <span>No assistants</span>
                      <span>—</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      {totalCost === 0 ? 'Free' : formatMoney(totalCost, 'EUR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Usage & Credits */}
              <div className="p-4 flex flex-col">
                <div>
                  <h4 className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider mb-3">Usage This Period</h4>

                  {/* Usage */}
                  {(() => {
                    const convUsed = workspace.sessions?.used ?? 0;
                    const convLimit = workspace.sessions?.limit ?? 0;
                    const convPct = convLimit > 0 ? (convUsed / convLimit) * 100 : 0;
                    const usersUsed = workspace.bundleLoads?.used ?? 0;
                    const usersLimit = workspace.bundleLoads?.limit ?? 0;
                    const usersPct = usersLimit > 0 ? (usersUsed / usersLimit) * 100 : 0;

                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={convPct > 80 ? 'text-warning-700 dark:text-warning-400' : 'text-foreground-secondary'}>
                            Conversations
                          </span>
                          <span className={convPct > 80 ? 'text-warning-700 dark:text-warning-400 font-medium' : 'text-foreground'}>
                            {convUsed.toLocaleString()} / {convLimit > 0 ? convLimit.toLocaleString() : '∞'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={usersPct > 80 ? 'text-warning-700 dark:text-warning-400' : 'text-foreground-secondary'}>
                            Unique users
                          </span>
                          <span className={usersPct > 80 ? 'text-warning-700 dark:text-warning-400 font-medium' : 'text-foreground'}>
                            {usersUsed.toLocaleString()} / {usersLimit > 0 ? usersLimit.toLocaleString() : '∞'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Credits - Aligned to bottom */}
                <div className="mt-auto pt-4">
                  <div className="p-3 rounded-lg bg-background-secondary">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">Wallet Credits</span>
                        <p className="text-lg font-semibold text-foreground">
                          {formatMoney(workspace.walletCredits || 0, 'EUR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isCreditsExpanded ? 'primary' : 'secondary'}
                        icon={isCreditsExpanded ? <ChevronUp size={14} /> : <Plus size={14} />}
                        onClick={() => toggleCredits(workspace.slug)}
                      >
                        {isCreditsExpanded ? 'Close' : 'Top up'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded: Credit packages */}
            {isCreditsExpanded && (
              <div className="border-t border-border p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-3 rounded-lg border transition-all ${
                        pkg.popular
                          ? 'border-info-500 dark:border-info-400 border-2 bg-surface-elevated'
                          : 'border-border bg-surface-elevated'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 whitespace-nowrap bg-info-500 text-white">
                          <Sparkles size={8} />
                          Best value
                        </span>
                      )}
                      <div className={`text-center ${pkg.popular ? 'mt-0.5' : ''}`}>
                        <p className="text-xl font-bold text-foreground">
                          {formatMoney(pkg.credits, 'EUR')}
                        </p>
                        <p className="text-xs font-medium h-4">
                          {pkg.bonus ? (
                            <span className="text-success-600 dark:text-success-400">+{formatMoney(pkg.bonus, 'EUR')} bonus</span>
                          ) : (
                            <span className="invisible">—</span>
                          )}
                        </p>
                        <Button
                          size="sm"
                          variant={pkg.popular ? 'primary' : 'secondary'}
                          className="w-full mt-2"
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
