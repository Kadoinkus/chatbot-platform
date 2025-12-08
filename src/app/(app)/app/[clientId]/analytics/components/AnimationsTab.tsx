'use client';

import { Sparkles, Star, Users, TrendingUp } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateReturnRate,
  type AssistantWithMetrics,
} from '@/lib/analytics/assistantComparison';

interface AnimationsTabProps {
  assistantMetrics: AssistantWithMetrics[];
  brandColor: string;
}

export function AnimationsTab({ assistantMetrics, brandColor }: AnimationsTabProps) {
  // Calculate totals
  const totalEasterEggs = assistantMetrics.reduce((sum, a) => sum + a.animations.easterEggsTriggered, 0);
  const totalSessionsWithEaster = assistantMetrics.reduce((sum, a) => sum + a.animations.sessionsWithEasterEggs, 0);
  const totalAnimationSessions = assistantMetrics.reduce((sum, a) => sum + a.animations.totalSessions, 0);
  const easterRate = totalAnimationSessions > 0 ? (totalSessionsWithEaster / totalAnimationSessions) * 100 : 0;
  const totalNewUsers = assistantMetrics.reduce((sum, a) => sum + calculateReturnRate(a).newUsers, 0);
  const totalReturning = assistantMetrics.reduce((sum, a) => sum + calculateReturnRate(a).returningUsers, 0);

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'easterEggs',
      header: 'Easter Eggs',
      render: (assistant) => formatNumber(assistant.animations.easterEggsTriggered),
      sortValue: (assistant) => assistant.animations.easterEggsTriggered,
      align: 'right',
    },
    {
      key: 'sessionsWithEaster',
      header: 'Sessions w/ Easter',
      render: (assistant) => formatNumber(assistant.animations.sessionsWithEasterEggs),
      sortValue: (assistant) => assistant.animations.sessionsWithEasterEggs,
      align: 'right',
    },
    {
      key: 'easterRate',
      header: 'Easter Rate',
      render: (assistant) => {
        const rate =
          assistant.animations.totalSessions > 0
            ? (assistant.animations.sessionsWithEasterEggs / assistant.animations.totalSessions) * 100
            : 0;
        return formatPercent(rate);
      },
      sortValue: (assistant) =>
        assistant.animations.totalSessions > 0
          ? (assistant.animations.sessionsWithEasterEggs / assistant.animations.totalSessions) * 100
          : 0,
      align: 'right',
    },
    {
      key: 'topEasterEgg',
      header: 'Top Easter Egg',
      render: (assistant) => assistant.animations.topEasterEggs[0]?.animation || '-',
    },
    {
      key: 'newUsers',
      header: 'New Users',
      render: (assistant) => {
        const { newUsers } = calculateReturnRate(assistant);
        return formatNumber(newUsers);
      },
      sortValue: (assistant) => calculateReturnRate(assistant).newUsers,
      align: 'right',
    },
    {
      key: 'returningUsers',
      header: 'Returning',
      render: (assistant) => {
        const { returningUsers } = calculateReturnRate(assistant);
        return formatNumber(returningUsers);
      },
      sortValue: (assistant) => calculateReturnRate(assistant).returningUsers,
      align: 'right',
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={Sparkles}
          label="Easter Eggs Triggered"
          value={formatNumber(totalEasterEggs)}
        />
        <KpiCard
          icon={Star}
          label="Easter Egg Rate"
          value={formatPercent(easterRate)}
        />
        <KpiCard
          icon={Users}
          label="New Users"
          value={formatNumber(totalNewUsers)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Returning Users"
          value={formatNumber(totalReturning)}
        />
      </KpiGrid>

      {/* AI Assistant Comparison Table */}
      <AssistantComparisonTable
        assistants={assistantMetrics}
        columns={columns}
        brandColor={brandColor}
        title="AI Assistant Comparison - Animations"
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

export default AnimationsTab;
