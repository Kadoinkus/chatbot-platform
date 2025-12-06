'use client';

import { Sparkles, Star, Users, TrendingUp } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import {
  formatNumber,
  formatPercent,
  calculateReturnRate,
  type BotWithMetrics,
} from '@/lib/analytics/botComparison';

interface AnimationsTabProps {
  botMetrics: BotWithMetrics[];
  brandColor: string;
}

export function AnimationsTab({ botMetrics, brandColor }: AnimationsTabProps) {
  // Calculate totals
  const totalEasterEggs = botMetrics.reduce((sum, b) => sum + b.animations.easterEggsTriggered, 0);
  const totalSessionsWithEaster = botMetrics.reduce((sum, b) => sum + b.animations.sessionsWithEasterEggs, 0);
  const totalAnimationSessions = botMetrics.reduce((sum, b) => sum + b.animations.totalSessions, 0);
  const easterRate = totalAnimationSessions > 0 ? (totalSessionsWithEaster / totalAnimationSessions) * 100 : 0;
  const totalNewUsers = botMetrics.reduce((sum, b) => sum + calculateReturnRate(b).newUsers, 0);
  const totalReturning = botMetrics.reduce((sum, b) => sum + calculateReturnRate(b).returningUsers, 0);

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'easterEggs',
      header: 'Easter Eggs',
      render: (bot) => formatNumber(bot.animations.easterEggsTriggered),
      sortValue: (bot) => bot.animations.easterEggsTriggered,
      align: 'right',
    },
    {
      key: 'sessionsWithEaster',
      header: 'Sessions w/ Easter',
      render: (bot) => formatNumber(bot.animations.sessionsWithEasterEggs),
      sortValue: (bot) => bot.animations.sessionsWithEasterEggs,
      align: 'right',
    },
    {
      key: 'easterRate',
      header: 'Easter Rate',
      render: (bot) => {
        const rate =
          bot.animations.totalSessions > 0
            ? (bot.animations.sessionsWithEasterEggs / bot.animations.totalSessions) * 100
            : 0;
        return formatPercent(rate);
      },
      sortValue: (bot) =>
        bot.animations.totalSessions > 0
          ? (bot.animations.sessionsWithEasterEggs / bot.animations.totalSessions) * 100
          : 0,
      align: 'right',
    },
    {
      key: 'topEasterEgg',
      header: 'Top Easter Egg',
      render: (bot) => bot.animations.topEasterEggs[0]?.animation || '-',
    },
    {
      key: 'newUsers',
      header: 'New Users',
      render: (bot) => {
        const { newUsers } = calculateReturnRate(bot);
        return formatNumber(newUsers);
      },
      sortValue: (bot) => calculateReturnRate(bot).newUsers,
      align: 'right',
    },
    {
      key: 'returningUsers',
      header: 'Returning',
      render: (bot) => {
        const { returningUsers } = calculateReturnRate(bot);
        return formatNumber(returningUsers);
      },
      sortValue: (bot) => calculateReturnRate(bot).returningUsers,
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

      {/* Bot Comparison Table */}
      <BotComparisonTable
        bots={botMetrics}
        columns={columns}
        brandColor={brandColor}
        title="Bot Comparison - Animations"
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

export default AnimationsTab;
