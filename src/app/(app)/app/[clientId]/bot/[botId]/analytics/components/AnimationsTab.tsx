'use client';

import { Sparkles, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { HorizontalBarChart, VerticalBarChart, DonutChart } from '@/components/analytics/charts';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import type { AnimationsTabProps } from './types';

// Safe string conversion helper
function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export function AnimationsTab({
  brandColor,
  animationStats,
  formatNumber,
  formatPercent,
}: AnimationsTabProps) {
  // Calculate easter egg percentage
  const easterEggPercent = animationStats?.totalSessions
    ? (animationStats.sessionsWithEasterEggs / animationStats.totalSessions) * 100
    : 0;

  // Easter egg donut data
  const easterEggData = [
    { name: 'With Easter Eggs', value: animationStats?.sessionsWithEasterEggs || 0, color: brandColor },
    {
      name: 'Without Easter Eggs',
      value: (animationStats?.totalSessions || 0) - (animationStats?.sessionsWithEasterEggs || 0),
      color: '#71717A',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Animation KPIs */}
      <KpiGrid>
        <KpiCard
          icon={Sparkles}
          label="Total Triggers"
          value={formatNumber(animationStats?.totalTriggers || 0)}
        />
        <KpiCard
          icon={Users}
          label="Unique Animations"
          value={animationStats?.topAnimations?.length || 0}
        />
        <KpiCard
          icon={TrendingUp}
          label="Easter Egg % per Session"
          value={formatPercent(easterEggPercent)}
        />
        <KpiCard
          icon={CheckCircle}
          label="Easter Eggs Found"
          value={formatNumber(animationStats?.easterEggsTriggered || 0)}
        />
      </KpiGrid>

      {/* Top Animations Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Top Response Animations</h3>
          {animationStats?.topAnimations && animationStats.topAnimations.length > 0 ? (
            <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
              <HorizontalBarChart
                data={animationStats.topAnimations.map((a) => ({ name: a.animation, value: a.count }))}
                dataKey="value"
                nameKey="name"
                nameFormatter={(v) => safeString(v).replace(/_/g, ' ').replace('2type T', '')}
                height={280}
                brandColor={brandColor}
                yAxisWidth={140}
              />
            </div>
          ) : (
            <div className="h-[200px] sm:h-[240px] lg:h-[280px] flex items-center justify-center">
              <p className="text-foreground-secondary">No animation data available</p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-4">Easter Egg Triggers</h3>
          {animationStats?.topEasterEggs && animationStats.topEasterEggs.length > 0 ? (
            <div className="h-[200px] sm:h-[240px] lg:h-[280px]">
              <HorizontalBarChart
                data={animationStats.topEasterEggs.map((e) => ({ name: e.animation, value: e.count }))}
                dataKey="value"
                nameKey="name"
                nameFormatter={(v) => safeString(v).replace('easter_', '').replace(/_/g, ' ')}
                height={280}
                brandColor={brandColor}
                yAxisWidth={140}
              />
            </div>
          ) : (
            <div className="h-[200px] sm:h-[240px] lg:h-[280px] flex items-center justify-center">
              <p className="text-foreground-secondary">No easter eggs triggered yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Wait Sequence & Easter Eggs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-2">Wait Sequence Distribution</h3>
          <p className="text-sm text-foreground-secondary mb-4">Idle animation playlists triggered</p>
          {animationStats?.waitSequences && animationStats.waitSequences.length > 0 ? (
            <div className="h-[160px] sm:h-[200px] lg:h-[220px]">
              <VerticalBarChart
                data={animationStats.waitSequences.map((w) => ({ name: w.sequence, value: w.count }))}
                dataKey="value"
                xAxisKey="name"
                xAxisFormatter={(v) => `Playlist ${safeString(v).toUpperCase()}`}
                height={220}
                brandColor={brandColor}
              />
            </div>
          ) : (
            <div className="h-[160px] sm:h-[200px] lg:h-[220px] flex items-center justify-center">
              <p className="text-foreground-secondary">No wait sequence data available</p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-2">Easter Eggs in Conversations</h3>
          <p className="text-sm text-foreground-secondary mb-4">
            {animationStats?.sessionsWithEasterEggs || 0} of {animationStats?.totalSessions || 0} sessions (
            {easterEggPercent.toFixed(1)}%)
          </p>
          <div className="h-[160px] sm:h-[200px] lg:h-[220px]">
            <DonutChart
              data={easterEggData}
              height={220}
              brandColor={brandColor}
              innerRadius={50}
              outerRadius={80}
              showLabels={true}
            />
          </div>
        </Card>
      </div>

      {/* Animation Performance Summary */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Animation Performance Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <SummaryCard
            value={formatNumber(animationStats?.totalTriggers || 0)}
            label="Total Animation Plays"
          />
          <SummaryCard
            value={animationStats?.topAnimations?.length || 0}
            label="Different Animations Used"
          />
          <SummaryCard
            value={animationStats?.topEasterEggs?.length || 0}
            label="Easter Egg Types Found"
          />
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center p-4 bg-background-secondary rounded-lg">
      <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}

export default AnimationsTab;
