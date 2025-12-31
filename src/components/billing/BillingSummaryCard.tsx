'use client';

import { Card, Badge } from '@/components/ui';
import type { Workspace } from '@/types';
import type { BillingSummary } from '@/lib/billingDataService';
import { formatDate, formatMoney } from '@/lib/billingDataService';

export interface BillingSummaryCardProps {
  workspaces: Workspace[];
  summary: BillingSummary;
  getMascotTotal?: (workspaceSlug: string, plan: string) => number;
}

type PlanBadgeType = 'starter' | 'basic' | 'premium' | 'enterprise';

function getPlanBadgeType(plan: string): PlanBadgeType {
  const planMap: Record<string, PlanBadgeType> = {
    starter: 'starter',
    basic: 'basic',
    premium: 'premium',
    enterprise: 'enterprise',
  };
  return planMap[plan] || 'starter';
}

function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    starter: 'Starter',
    basic: 'Basic',
    premium: 'Premium',
    enterprise: 'Enterprise',
    custom: 'Custom',
  };
  return names[plan] || plan;
}

export function BillingSummaryCard({
  workspaces,
  summary,
  getMascotTotal = () => 0,
}: BillingSummaryCardProps) {
  const totalDue = summary.baseDueThisPeriod + summary.projectedOverage;

  // Build summary lines
  const lines: { label: string; value: string; muted?: boolean }[] = [];

  // Amount due (base + projected overage placeholder)
  lines.push({
    label: 'Amount due this period',
    value:
      totalDue === 0 && summary.annualCount > 0 && summary.monthlyCount === 0
        ? '€0 (base already paid)'
        : formatMoney(totalDue, 'EUR'),
  });

  // Monthly
  if (summary.monthlyCount > 0) {
    lines.push({
      label: 'Monthly charge',
      value: formatMoney(summary.monthlyTotal, 'EUR'),
    });
    if (summary.earliestBilling) {
      lines.push({
        label: 'Next billing',
        value: formatDate(summary.earliestBilling),
      });
    }
  }

  // Annual
  if (summary.annualCount > 0) {
    lines.push({
      label: 'Prepaid annual',
      value: formatMoney(summary.annualTotal, 'EUR'),
    });
    lines.push({
      label: 'Monthly equivalent',
      value: formatMoney(summary.annualTotal / 12, 'EUR'),
      muted: true,
    });
    if (summary.earliestRenewal) {
      lines.push({
        label: 'Next renewal',
        value: formatDate(summary.earliestRenewal),
      });
    }
  }

  // Setup and overages
  if (summary.setupTotal > 0) {
    lines.push({
      label: 'One-time setup fees',
      value: formatMoney(summary.setupTotal, 'EUR'),
    });
  }
  if (summary.projectedOverage > 0) {
    lines.push({
      label: 'Projected overages',
      value: formatMoney(summary.projectedOverage, 'EUR'),
    });
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Billing Summary</h3>

      <div className="space-y-3">
        {/* Summary lines */}
        <div className="text-sm text-foreground space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className={line.muted ? 'text-foreground-tertiary' : ''}>
              <span className="text-foreground-secondary">{line.label}: </span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>

        {/* Per workspace breakdown */}
        <div className="border-t border-border pt-3 mt-4 text-sm text-foreground">
          <div className="font-semibold mb-2">Per Workspace</div>
          <div className="rounded-lg border border-border divide-y divide-border bg-transparent">
            {workspaces.map(workspace => {
              const mascotCost = getMascotTotal(workspace.slug, workspace.plan);
              const totalCost = (workspace.monthlyFee || 0) + mascotCost;
              const wsRecord = workspace as Record<string, unknown>;
              const isAnnual =
                wsRecord.billingCycle === 'annual' ||
                wsRecord.billing_frequency === 'yearly';
              const nextBillingRaw =
                wsRecord.next_billing_date ||
                wsRecord.contract_end ||
                wsRecord.contractEnd ||
                '';
              const nextBilling =
                typeof nextBillingRaw === 'string' || typeof nextBillingRaw === 'number'
                  ? String(nextBillingRaw)
                  : '';
              const annualTotal = totalCost * 12;
              const setupFee =
                Number(wsRecord.setup_fee_ex_vat ?? wsRecord.setupFee ?? 0) || 0;

              return (
                <div key={workspace.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{workspace.name}</span>
                      <Badge plan={getPlanBadgeType(workspace.plan)}>
                        {getPlanDisplayName(workspace.plan)}
                      </Badge>
                    </div>
                    <span className="font-semibold text-foreground">
                      {totalCost === 0
                        ? 'Included'
                        : isAnnual
                          ? `Prepaid: ${formatMoney(annualTotal, 'EUR')}`
                          : `${formatMoney(totalCost, 'EUR')}/month`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-foreground-tertiary mt-2">
                    {workspace.monthlyFee > 0 && mascotCost > 0 && (
                      <span>
                        Plan: {formatMoney(workspace.monthlyFee, 'EUR')} + Mascots:{' '}
                        {formatMoney(mascotCost, 'EUR')}
                      </span>
                    )}
                    {setupFee > 0 && <span>Setup fee: {formatMoney(setupFee, 'EUR')}</span>}
                    {isAnnual && totalCost > 0 && (
                      <span className="text-foreground-tertiary">
                        ≈ {formatMoney(totalCost, 'EUR')} / month (info only)
                      </span>
                    )}
                    {nextBilling && (
                      <span>
                        {isAnnual ? 'Renews' : 'Next billing'}: {formatDate(nextBilling)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BillingSummaryCard;
