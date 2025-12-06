'use client';

import { MessageSquare, CheckCircle, Clock, Users } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import { MultiLineChart } from '@/components/Charts';
import {
  formatNumber,
  formatPercent,
  formatDuration,
  calculateReturnRate,
  generateMultiBotTimeSeries,
  type BotWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/botComparison';
import { ProgressBar } from '@/components/analytics/BotComparisonTable';

interface OverviewTabProps {
  botMetrics: BotWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function OverviewTab({ botMetrics, totals, brandColor }: OverviewTabProps) {
  // Column definitions for overview
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => <span className="font-medium">{formatNumber(bot.overview.totalSessions)}</span>,
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (bot) => formatNumber(bot.overview.totalMessages),
      sortValue: (bot) => bot.overview.totalMessages,
      align: 'right',
    },
    {
      key: 'duration',
      header: 'Avg Duration',
      render: (bot) => formatDuration(bot.overview.averageSessionDurationSeconds),
      sortValue: (bot) => bot.overview.averageSessionDurationSeconds,
      align: 'right',
    },
    {
      key: 'resolution',
      header: 'Resolution Rate',
      render: (bot) => (
        <ProgressBar
          value={bot.overview.resolutionRate}
          color={bot.overview.resolutionRate >= 80 ? 'success' : bot.overview.resolutionRate >= 60 ? 'warning' : 'error'}
        />
      ),
      sortValue: (bot) => bot.overview.resolutionRate,
      width: '150px',
    },
    {
      key: 'returnRate',
      header: 'Return Rate',
      render: (bot) => {
        const { returnRate } = calculateReturnRate(bot);
        return formatPercent(returnRate);
      },
      sortValue: (bot) => calculateReturnRate(bot).returnRate,
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
      {botMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Sessions Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiBotTimeSeries(botMetrics, 'sessions')}
                series={botMetrics.map((b) => ({ name: b.botName, dataKey: b.botName }))}
                xAxisKey="date"
                yAxisLabel="Sessions"
              />
            </div>
          </div>
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Messages Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiBotTimeSeries(botMetrics, 'messages')}
                series={botMetrics.map((b) => ({ name: b.botName, dataKey: b.botName }))}
                xAxisKey="date"
                yAxisLabel="Messages"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bot Comparison Table */}
      <BotComparisonTable
        bots={botMetrics}
        columns={columns}
        brandColor={brandColor}
        title="Bot Comparison - Overview"
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

export default OverviewTab;
