'use client';

import { DollarSign, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import { MultiLineChart } from '@/components/Charts';
import {
  formatNumber,
  formatCost,
  calculateAssistantCosts,
  generateMultiAssistantTimeSeries,
  type AssistantWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/assistantComparison';

interface CostsTabProps {
  assistantMetrics: AssistantWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function CostsTab({ assistantMetrics, totals, brandColor }: CostsTabProps) {
  // Calculate totals
  const totalChatCost = assistantMetrics.reduce((sum, a) => sum + calculateAssistantCosts(a).chatCost, 0);
  const totalAnalysisCost = assistantMetrics.reduce((sum, a) => sum + calculateAssistantCosts(a).analysisCost, 0);
  const totalCost = totalChatCost + totalAnalysisCost;
  const avgCostPerSession = totals.totalSessions > 0 ? totalCost / totals.totalSessions : 0;

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (assistant) => formatNumber(assistant.overview.totalSessions),
      sortValue: (assistant) => assistant.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'tokens',
      header: 'Total Tokens',
      render: (assistant) => formatNumber(assistant.overview.totalTokens),
      sortValue: (assistant) => assistant.overview.totalTokens,
      align: 'right',
    },
    {
      key: 'chatCost',
      header: 'Chat Cost',
      render: (assistant) => {
        const { chatCost } = calculateAssistantCosts(assistant);
        return formatCost(chatCost);
      },
      sortValue: (assistant) => calculateAssistantCosts(assistant).chatCost,
      align: 'right',
    },
    {
      key: 'analysisCost',
      header: 'Analysis Cost',
      render: (assistant) => {
        const { analysisCost } = calculateAssistantCosts(assistant);
        return formatCost(analysisCost);
      },
      sortValue: (assistant) => calculateAssistantCosts(assistant).analysisCost,
      align: 'right',
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (assistant) => {
        const { totalCost } = calculateAssistantCosts(assistant);
        return <span className="font-semibold">{formatCost(totalCost)}</span>;
      },
      sortValue: (assistant) => calculateAssistantCosts(assistant).totalCost,
      align: 'right',
    },
    {
      key: 'costPerSession',
      header: 'Cost/Session',
      render: (assistant) => {
        const { costPerSession } = calculateAssistantCosts(assistant);
        return formatCost(costPerSession);
      },
      sortValue: (assistant) => calculateAssistantCosts(assistant).costPerSession,
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
      {assistantMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Cost Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiAssistantTimeSeries(assistantMetrics, 'cost')}
                series={assistantMetrics.map((a) => ({ name: a.assistantName, dataKey: a.assistantName }))}
                xAxisKey="date"
                yAxisLabel="Cost (€)"
              />
            </div>
          </div>
          <div className="card p-4 sm:p-6 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Token Usage Over Time</h3>
            <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
              <MultiLineChart
                data={generateMultiAssistantTimeSeries(assistantMetrics, 'tokens')}
                series={assistantMetrics.map((a) => ({ name: a.assistantName, dataKey: a.assistantName }))}
                xAxisKey="date"
                yAxisLabel="Tokens"
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
        title="AI Assistant Comparison - Costs"
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

export default CostsTab;
