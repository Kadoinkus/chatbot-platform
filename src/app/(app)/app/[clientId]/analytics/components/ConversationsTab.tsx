'use client';

import { CheckCircle, AlertTriangle, Star, TrendingUp } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateResolutionBreakdown,
  type AssistantWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/assistantComparison';

interface ConversationsTabProps {
  assistantMetrics: AssistantWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
  getBrandColorForAssistant?: (assistantId: string, clientId?: string, colors?: any) => string;
}

export function ConversationsTab({ assistantMetrics, totals, brandColor, getBrandColorForAssistant }: ConversationsTabProps) {
  // Column definitions for conversations
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (assistant) => formatNumber(assistant.overview.totalSessions),
      sortValue: (assistant) => assistant.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'resolved',
      header: 'Resolved',
      render: (assistant) => {
        const { resolved } = calculateResolutionBreakdown(assistant);
        return <span className="text-success-600 dark:text-success-500">{resolved}</span>;
      },
      sortValue: (assistant) => calculateResolutionBreakdown(assistant).resolved,
      align: 'right',
    },
    {
      key: 'partial',
      header: 'Partial',
      render: (assistant) => {
        const { partial } = calculateResolutionBreakdown(assistant);
        return <span className="text-warning-600 dark:text-warning-500">{partial}</span>;
      },
      sortValue: (assistant) => calculateResolutionBreakdown(assistant).partial,
      align: 'right',
    },
    {
      key: 'unresolved',
      header: 'Unresolved',
      render: (assistant) => {
        const { unresolved } = calculateResolutionBreakdown(assistant);
        return <span className="text-error-600 dark:text-error-500">{unresolved}</span>;
      },
      sortValue: (assistant) => calculateResolutionBreakdown(assistant).unresolved,
      align: 'right',
    },
    {
      key: 'escalated',
      header: 'Escalated',
      render: (assistant) => {
        const { escalated } = calculateResolutionBreakdown(assistant);
        return escalated;
      },
      sortValue: (assistant) => calculateResolutionBreakdown(assistant).escalated,
      align: 'right',
    },
    {
      key: 'sentiment',
      header: 'Sentiment',
      render: (assistant) => (
        <div className="flex gap-1 text-xs">
          <span className="text-success-600 dark:text-success-500">{assistant.sentiment.positive}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-foreground-secondary">{assistant.sentiment.neutral}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-error-600 dark:text-error-500">{assistant.sentiment.negative}%</span>
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

      {/* AI Assistant Comparison Table */}
      <AssistantComparisonTable
        assistants={assistantMetrics}
        columns={columns}
        brandColor={brandColor}
        getBrandColorForAssistant={getBrandColorForAssistant}
        title="AI Assistant Comparison - Conversations"
        description={
          assistantMetrics.length === 0
            ? 'No AI assistants selected'
            : `Comparing ${assistantMetrics.length} AI assistant${assistantMetrics.length !== 1 ? 's' : ''}`
        }
        emptyMessage="Select AI assistants to compare their metrics"
      />
    </>
  );
}

export default ConversationsTab;
