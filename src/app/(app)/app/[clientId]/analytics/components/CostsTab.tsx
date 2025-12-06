'use client';

import { DollarSign, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import { MultiLineChart } from '@/components/Charts';
import {
  formatNumber,
  formatCost,
  calculateBotCosts,
  generateMultiBotTimeSeries,
  type BotWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/botComparison';

interface CostsTabProps {
  botMetrics: BotWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function CostsTab({ botMetrics, totals, brandColor }: CostsTabProps) {
  // Calculate totals
  const totalChatCost = botMetrics.reduce((sum, b) => sum + calculateBotCosts(b).chatCost, 0);
  const totalAnalysisCost = botMetrics.reduce((sum, b) => sum + calculateBotCosts(b).analysisCost, 0);
  const totalCost = totalChatCost + totalAnalysisCost;
  const avgCostPerSession = totals.totalSessions > 0 ? totalCost / totals.totalSessions : 0;

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => formatNumber(bot.overview.totalSessions),
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'tokens',
      header: 'Total Tokens',
      render: (bot) => formatNumber(bot.overview.totalTokens),
      sortValue: (bot) => bot.overview.totalTokens,
      align: 'right',
    },
    {
      key: 'chatCost',
      header: 'Chat Cost',
      render: (bot) => {
        const { chatCost } = calculateBotCosts(bot);
        return formatCost(chatCost);
      },
      sortValue: (bot) => calculateBotCosts(bot).chatCost,
      align: 'right',
    },
    {
      key: 'analysisCost',
      header: 'Analysis Cost',
      render: (bot) => {
        const { analysisCost } = calculateBotCosts(bot);
        return formatCost(analysisCost);
      },
      sortValue: (bot) => calculateBotCosts(bot).analysisCost,
      align: 'right',
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (bot) => {
        const { totalCost } = calculateBotCosts(bot);
        return <span className="font-semibold">{formatCost(totalCost)}</span>;
      },
      sortValue: (bot) => calculateBotCosts(bot).totalCost,
      align: 'right',
    },
    {
      key: 'costPerSession',
      header: 'Cost/Session',
      render: (bot) => {
        const { costPerSession } = calculateBotCosts(bot);
        return formatCost(costPerSession);
      },
      sortValue: (bot) => calculateBotCosts(bot).costPerSession,
      align: 'right',
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={DollarSign}
          label="Chat Cost"
          value={formatCost(totalChatCost)}
        />
        <KpiCard
          icon={BarChart3}
          label="Analysis Cost"
          value={formatCost(totalAnalysisCost)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Total Cost"
          value={formatCost(totalCost)}
        />
        <KpiCard
          icon={Clock}
          label="Avg Cost/Session"
          value={formatCost(avgCostPerSession)}
        />
      </KpiGrid>

      {/* Charts */}
      {botMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Cost Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiBotTimeSeries(botMetrics, 'cost')}
                series={botMetrics.map((b) => ({ name: b.botName, dataKey: b.botName }))}
                xAxisKey="date"
                yAxisLabel="Cost (€)"
              />
            </div>
          </div>
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Token Usage Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiBotTimeSeries(botMetrics, 'tokens')}
                series={botMetrics.map((b) => ({ name: b.botName, dataKey: b.botName }))}
                xAxisKey="date"
                yAxisLabel="Tokens"
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
        title="Bot Comparison - Costs"
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

export default CostsTab;
