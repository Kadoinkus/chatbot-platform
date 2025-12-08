'use client';

import { MessageSquare, CheckCircle, Clock, Users } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import { MultiLineChart } from '@/components/Charts';
import {
  formatNumber,
  formatPercent,
  formatDuration,
  calculateReturnRate,
  generateMultiAssistantTimeSeries,
  type AssistantWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/assistantComparison';
import { ProgressBar } from '@/components/analytics/AssistantComparisonTable';

interface OverviewTabProps {
  assistantMetrics: AssistantWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function OverviewTab({ assistantMetrics, totals, brandColor }: OverviewTabProps) {
  // Column definitions for overview
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (assistant) => <span className="font-medium">{formatNumber(assistant.overview.totalSessions)}</span>,
      sortValue: (assistant) => assistant.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (assistant) => formatNumber(assistant.overview.totalMessages),
      sortValue: (assistant) => assistant.overview.totalMessages,
      align: 'right',
    },
    {
      key: 'duration',
      header: 'Avg Duration',
      render: (assistant) => formatDuration(assistant.overview.averageSessionDurationSeconds),
      sortValue: (assistant) => assistant.overview.averageSessionDurationSeconds,
      align: 'right',
    },
    {
      key: 'resolution',
      header: 'Resolution Rate',
      render: (assistant) => (
        <ProgressBar
          value={assistant.overview.resolutionRate}
          color={assistant.overview.resolutionRate >= 80 ? 'success' : assistant.overview.resolutionRate >= 60 ? 'warning' : 'error'}
        />
      ),
      sortValue: (assistant) => assistant.overview.resolutionRate,
      width: '150px',
    },
    {
      key: 'returnRate',
      header: 'Return Rate',
      render: (assistant) => {
        const { returnRate } = calculateReturnRate(assistant);
        return formatPercent(returnRate);
      },
      sortValue: (assistant) => calculateReturnRate(assistant).returnRate,
      align: 'right',
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={MessageSquare}
          label="Total Sessions"
          value={formatNumber(totals.totalSessions)}
        />
        <KpiCard
          icon={CheckCircle}
          label="Avg Resolution Rate"
          value={formatPercent(totals.avgResolutionRate)}
        />
        <KpiCard
          icon={Clock}
          label="Avg Duration"
          value={formatDuration(totals.avgSessionDurationSeconds)}
        />
        <KpiCard
          icon={Users}
          label="Total Messages"
          value={formatNumber(totals.totalMessages)}
        />
      </KpiGrid>

      {/* Charts */}
      {assistantMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Sessions Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiAssistantTimeSeries(assistantMetrics, 'sessions')}
                series={assistantMetrics.map((a) => ({ name: a.assistantName, dataKey: a.assistantName }))}
                xAxisKey="date"
                yAxisLabel="Sessions"
              />
            </div>
          </div>
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Messages Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiAssistantTimeSeries(assistantMetrics, 'messages')}
                series={assistantMetrics.map((a) => ({ name: a.assistantName, dataKey: a.assistantName }))}
                xAxisKey="date"
                yAxisLabel="Messages"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Comparison Table */}
      <AssistantComparisonTable
        assistants={assistantMetrics}
        columns={columns}
        brandColor={brandColor}
        title="AI Assistant Comparison - Overview"
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

export default OverviewTab;
