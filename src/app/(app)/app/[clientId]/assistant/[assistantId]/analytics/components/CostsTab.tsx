'use client';

import { DollarSign, Receipt, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui';
import { StackedBarChart, DonutChart } from '@/components/analytics/charts';
import { GREY } from '@/lib/chartColors';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import { MobileTable, MobileCard, MobileBadge } from '@/components/analytics/MobileTable';
import type { CostsTabProps } from './types';

// Format axis currency helper
function formatAxisCurrency(value: number, decimals = 2): string {
  return `€${value.toFixed(decimals)}`;
}

export function CostsTab({
  brandColor,
  sessions,
  overview,
  formatNumber,
  formatCurrency,
}: CostsTabProps) {
  // Calculate cost metrics
  const costPerSession = (overview?.totalCostEur || 0) / Math.max(overview?.totalSessions || 1, 1);
  const costPerMessage = (overview?.totalCostEur || 0) / Math.max(overview?.totalMessages || 1, 1);

  // Input vs Output tokens
  const inputTokens = sessions.reduce((sum, s) => sum + (s.input_tokens || 0), 0);
  const outputTokens = sessions.reduce((sum, s) => sum + (s.output_tokens || 0), 0);
  const tokenData = [
    { name: 'Input (Prompts)', value: inputTokens, color: brandColor },
    { name: 'Output (Responses)', value: outputTokens, color: GREY[500] },
  ];

  // LLM Model usage
  const modelCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const model = s.analysis?.analytics_model_used || 'Unknown';
    modelCounts[model] = (modelCounts[model] || 0) + 1;
  });
  const modelData = Object.entries(modelCounts)
    .map(([model, count]) => ({ name: model, value: count }))
    .sort((a, b) => b.value - a.value);

  // Cost by resolution status
  const resolved = sessions.filter((s) => s.analysis?.resolution_status === 'resolved');
  const partial = sessions.filter((s) => s.analysis?.resolution_status === 'partial');
  const unresolved = sessions.filter((s) => s.analysis?.resolution_status === 'unresolved');

  const resolvedCost = resolved.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
  const partialCost = partial.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
  const unresolvedCost = unresolved.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

  const avgResolvedCost = resolved.length > 0 ? resolvedCost / resolved.length : 0;
  const avgPartialCost = partial.length > 0 ? partialCost / partial.length : 0;
  const avgUnresolvedCost = unresolved.length > 0 ? unresolvedCost / unresolved.length : 0;

  // Most expensive sessions
  const expensiveSessions = sessions
    .map((s, i) => ({
      ...s,
      index: i + 1,
      totalCost: (s.total_cost_eur || 0) + (s.analysis?.analytics_total_cost_eur || 0),
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  // Table columns for desktop
  const columns = [
    {
      key: 'session',
      header: 'Session',
      render: (session: (typeof expensiveSessions)[0]) => (
        <span className="text-sm font-medium text-foreground">#{session.index}</span>
      ),
    },
    {
      key: 'cost',
      header: 'Total Cost',
      align: 'right' as const,
      render: (session: (typeof expensiveSessions)[0]) => (
        <span className="text-sm font-semibold" style={{ color: brandColor }}>
          {formatCurrency(session.totalCost)}
        </span>
      ),
    },
    {
      key: 'tokens',
      header: 'Tokens',
      align: 'right' as const,
      render: (session: (typeof expensiveSessions)[0]) => (
        <span className="text-sm text-foreground">{formatNumber(session.total_tokens || 0)}</span>
      ),
    },
    {
      key: 'messages',
      header: 'Messages',
      align: 'right' as const,
      render: (session: (typeof expensiveSessions)[0]) => (
        <span className="text-sm text-foreground">{session.total_messages || 0}</span>
      ),
    },
    {
      key: 'resolution',
      header: 'Resolution',
      render: (session: (typeof expensiveSessions)[0]) => <ResolutionBadge status={session.analysis?.resolution_status} />,
    },
  ];

  // Mobile card render
  const renderMobileCard = (session: (typeof expensiveSessions)[0]) => (
    <MobileCard>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-foreground">Session #{session.index}</span>
        <span className="text-lg font-bold" style={{ color: brandColor }}>
          {formatCurrency(session.totalCost)}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-foreground-secondary mb-3">
        <span>{formatNumber(session.total_tokens || 0)} tokens</span>
        <span>{session.total_messages || 0} messages</span>
      </div>
      <ResolutionBadge status={session.analysis?.resolution_status} />
    </MobileCard>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cost KPIs */}
      <KpiGrid>
        <KpiCard icon={DollarSign} label="Total Cost" value={formatCurrency(overview?.totalCostEur || 0)} />
        <KpiCard icon={Receipt} label="Cost per Session" value={formatCurrency(costPerSession)} />
        <KpiCard icon={TrendingUp} label="Total Tokens" value={formatNumber(overview?.totalTokens || 0)} />
        <KpiCard icon={Sparkles} label="Cost per Message" value={formatCurrency(costPerMessage)} />
      </KpiGrid>

      {/* Cost Breakdown per Session */}
      <Card className="overflow-visible">
        <h3 className="font-semibold text-foreground mb-4">Cost Breakdown per Session</h3>
        <p className="text-sm text-foreground-secondary mb-4">
          Conversation costs vs. analysis costs per session (stacked)
        </p>
        <div className="h-[240px] sm:h-[300px] lg:h-[340px] overflow-visible">
          <StackedBarChart
            data={sessions.map((s, i) => ({
              session: `#${i + 1}`,
              conversation: s.total_cost_eur || 0,
              analysis: s.analysis?.analytics_total_cost_eur || 0,
              conversationTokens: s.total_tokens || 0,
              analysisTokens: s.analysis?.analytics_total_tokens || 0,
            }))}
            series={[
              { key: 'conversation', name: 'Conversation Cost', color: brandColor },
              { key: 'analysis', name: 'Analysis Cost', color: GREY[500] },
            ]}
            xAxisKey="session"
            yAxisFormatter={(v) => formatAxisCurrency(v as number, 3)}
            brandColor={brandColor}
            customTooltip={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0]?.payload as Record<string, number>;
              return (
                <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold text-foreground mb-2">Session {label}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground">
                      <span style={{ color: brandColor }}>●</span> Conversation: €{data?.conversation?.toFixed(4)} (
                      {formatNumber(data?.conversationTokens || 0)} tokens)
                    </p>
                    <p className="text-foreground">
                      <span style={{ color: GREY[500] }}>●</span> Analysis: €{data?.analysis?.toFixed(4)} (
                      {formatNumber(data?.analysisTokens || 0)} tokens)
                    </p>
                    <p className="text-foreground-secondary pt-1 border-t border-border mt-1">
                      Total: €{((data?.conversation || 0) + (data?.analysis || 0)).toFixed(4)} (
                      {formatNumber((data?.conversationTokens || 0) + (data?.analysisTokens || 0))} tokens)
                    </p>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </Card>

      {/* Input vs Output Tokens & LLM Model Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="overflow-visible">
          <h3 className="font-semibold text-foreground mb-4">Input vs Output Tokens</h3>
          <p className="text-sm text-foreground-secondary mb-4">Output tokens typically cost 3-4x more than input</p>
          <div className="h-[200px] sm:h-[240px] lg:h-[280px] overflow-visible">
            <DonutChart
              data={tokenData}
              brandColor={brandColor}
              showLabels={true}
            />
          </div>
        </Card>

        <Card className="overflow-visible">
          <h3 className="font-semibold text-foreground mb-4">LLM Model Usage</h3>
          <p className="text-sm text-foreground-secondary mb-4">Models used for session analysis</p>
          <div className="h-[200px] sm:h-[240px] lg:h-[280px] overflow-visible">
            <DonutChart data={modelData} brandColor={brandColor} showLabels={true} />
          </div>
        </Card>
      </div>

      {/* Cost by Resolution Status */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Cost by Resolution Status</h3>
        <p className="text-sm text-foreground-secondary mb-4">
          Compare costs between resolved, partial, and unresolved conversations
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CostStatusCard
            label="Resolved"
            color={brandColor}
            avgCost={avgResolvedCost}
            totalCost={resolvedCost}
            count={resolved.length}
            formatCurrency={formatCurrency}
          />
          <CostStatusCard
            label="Partial"
            color={GREY[400]}
            avgCost={avgPartialCost}
            totalCost={partialCost}
            count={partial.length}
            formatCurrency={formatCurrency}
          />
          <CostStatusCard
            label="Unresolved"
            color={GREY[600]}
            avgCost={avgUnresolvedCost}
            totalCost={unresolvedCost}
            count={unresolved.length}
            formatCurrency={formatCurrency}
          />
        </div>
      </Card>

      {/* Most Expensive Sessions */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Most Expensive Sessions</h3>
        <p className="text-sm text-foreground-secondary mb-4">
          Top sessions by total cost - identify outliers and optimization opportunities
        </p>
        <MobileTable
          data={expensiveSessions}
          columns={columns}
          mobileCard={renderMobileCard}
          keyExtractor={(s) => s.id}
          emptyMessage="No session data available"
        />
      </Card>
    </div>
  );
}

// Helper components
function ResolutionBadge({ status }: { status?: string | null }) {
  const config = {
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    unresolved: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  const className = config[status as keyof typeof config] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

  return <span className={`text-xs px-2 py-1 rounded-full ${className}`}>{status || 'unknown'}</span>;
}

function CostStatusCard({
  label,
  color,
  avgCost,
  totalCost,
  count,
  formatCurrency,
}: {
  label: string;
  color: string;
  avgCost: number;
  totalCost: number;
  count: number;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="p-4 bg-background-secondary rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(avgCost)}</p>
      <p className="text-sm text-foreground-secondary">avg per session ({count} sessions)</p>
      <p className="text-xs text-foreground-tertiary mt-1">Total: {formatCurrency(totalCost)}</p>
    </div>
  );
}

export default CostsTab;
