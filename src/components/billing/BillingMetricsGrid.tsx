'use client';

import { Euro, Wallet, Layers, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatMoney } from '@/lib/billingDataService';

export interface BillingMetrics {
  totalMonthlyFee: number;
  totalCredits: number;
  activeWorkspaces: number;
  totalWorkspaces: number;
  usageWarningsCount: number;
}

export interface BillingMetricsGridProps {
  metrics: BillingMetrics;
}

export function BillingMetricsGrid({ metrics }: BillingMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
      <Card padding="sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-foreground-secondary">Monthly Total</span>
          <Euro size={14} className="text-foreground-tertiary sm:hidden" />
          <Euro size={16} className="text-foreground-tertiary hidden sm:block" />
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">
          {formatMoney(metrics.totalMonthlyFee, 'EUR')}
        </p>
        <p className="text-[10px] sm:text-xs text-foreground-tertiary mt-1">
          Across {metrics.totalWorkspaces} workspaces
        </p>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-foreground-secondary">Total Credits</span>
          <Wallet size={14} className="text-foreground-tertiary sm:hidden" />
          <Wallet size={16} className="text-foreground-tertiary hidden sm:block" />
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">
          {formatMoney(metrics.totalCredits, 'EUR')}
        </p>
        <p className="text-[10px] sm:text-xs text-foreground-tertiary mt-1">Available for overages</p>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-foreground-secondary">Active Workspaces</span>
          <Layers size={14} className="text-foreground-tertiary sm:hidden" />
          <Layers size={16} className="text-foreground-tertiary hidden sm:block" />
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">{metrics.activeWorkspaces}</p>
        <p className="text-[10px] sm:text-xs text-foreground-tertiary mt-1">
          of {metrics.totalWorkspaces} total
        </p>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-foreground-secondary">Usage Warnings</span>
          <AlertTriangle size={14} className="text-foreground-tertiary sm:hidden" />
          <AlertTriangle size={16} className="text-foreground-tertiary hidden sm:block" />
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">{metrics.usageWarningsCount}</p>
        <p className="text-[10px] sm:text-xs text-foreground-tertiary mt-1">Near limits</p>
      </Card>
    </div>
  );
}

export default BillingMetricsGrid;
