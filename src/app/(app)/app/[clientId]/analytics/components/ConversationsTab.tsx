'use client';

import { CheckCircle, AlertTriangle, Star, TrendingUp } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateResolutionBreakdown,
  type BotWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/botComparison';

interface ConversationsTabProps {
  botMetrics: BotWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function ConversationsTab({ botMetrics, totals, brandColor }: ConversationsTabProps) {
  // Column definitions for conversations
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => formatNumber(bot.overview.totalSessions),
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'resolved',
      header: 'Resolved',
      render: (bot) => {
        const { resolved } = calculateResolutionBreakdown(bot);
        return <span className="text-success-600 dark:text-success-500">{resolved}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).resolved,
      align: 'right',
    },
    {
      key: 'partial',
      header: 'Partial',
      render: (bot) => {
        const { partial } = calculateResolutionBreakdown(bot);
        return <span className="text-warning-600 dark:text-warning-500">{partial}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).partial,
      align: 'right',
    },
    {
      key: 'unresolved',
      header: 'Unresolved',
      render: (bot) => {
        const { unresolved } = calculateResolutionBreakdown(bot);
        return <span className="text-error-600 dark:text-error-500">{unresolved}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).unresolved,
      align: 'right',
    },
    {
      key: 'escalated',
      header: 'Escalated',
      render: (bot) => {
        const { escalated } = calculateResolutionBreakdown(bot);
        return escalated;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).escalated,
      align: 'right',
    },
    {
      key: 'sentiment',
      header: 'Sentiment',
      render: (bot) => (
        <div className="flex gap-1 text-xs">
          <span className="text-success-600 dark:text-success-500">{bot.sentiment.positive}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-foreground-secondary">{bot.sentiment.neutral}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-error-600 dark:text-error-500">{bot.sentiment.negative}%</span>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={CheckCircle}
          label="Resolution Rate"
          value={formatPercent(totals.avgResolutionRate)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Escalation Rate"
          value={formatPercent(totals.avgEscalationRate)}
        />
        <KpiCard
          icon={Star}
          label="Positive Sentiment"
          value={`${totals.sentiment.positive}%`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Negative Sentiment"
          value={`${totals.sentiment.negative}%`}
        />
      </KpiGrid>

      {/* Bot Comparison Table */}
      <BotComparisonTable
        bots={botMetrics}
        columns={columns}
        brandColor={brandColor}
        title="Bot Comparison - Conversations"
        description={
          botMetrics.length === 0
            ? 'No bots selected'
            : `Comparing ${botMetrics.length} bot${botMetrics.length !== 1 ? 's' : ''}`
        }
        emptyMessage="Select bots to compare their metrics"
      />
    </>
  );
}

export default ConversationsTab;
