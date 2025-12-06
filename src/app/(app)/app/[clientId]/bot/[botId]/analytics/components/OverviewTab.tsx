'use client';

import {
  Users,
  RefreshCw,
  CheckCircle,
  Download,
  Globe,
  MessageSquare,
  Smartphone,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui';
import {
  TimeSeriesAreaChart,
  HorizontalBarChart,
  DonutChart,
} from '@/components/analytics/charts';
import { GREY } from '@/lib/chartColors';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import type { OverviewTabProps } from './types';

export function OverviewTab({
  brandColor,
  sessions,
  overview,
  sentiment,
  categories,
  timeSeries,
  countries,
  languages,
  devices,
  formatNumber,
  formatPercent,
}: OverviewTabProps) {
  // Calculate user metrics
  const newUsers = sessions.filter(
    (s) => s.glb_source === 'cdn_fetch' || (s.glb_transfer_size && s.glb_transfer_size > 0)
  ).length;
  const recurringUsers = sessions.filter(
    (s) => s.glb_source === 'memory_cache' || (s.glb_source !== 'cdn_fetch' && !s.glb_transfer_size)
  ).length;
  const totalUsers = sessions.length || 1;
  const returnRate = (recurringUsers / totalUsers) * 100;

  // Enhance timeSeries with new vs recurring data
  const enhancedTimeSeries = timeSeries.map((day) => {
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.session_started_at || s.created_at).toISOString().split('T')[0];
      return sessionDate === day.date;
    });
    const newCount = daySessions.filter(
      (s) => s.glb_source === 'cdn_fetch' || (s.glb_transfer_size && s.glb_transfer_size > 0)
    ).length;
    const returningCount = daySessions.length - newCount;
    return {
      ...day,
      new: newCount,
      returning: returningCount,
    };
  });

  // User breakdown data
  const userData = [
    { name: 'Returning', value: recurringUsers, color: GREY[500] },
    { name: 'New', value: newUsers, color: brandColor },
  ];

  // Calculate mobile percentage
  const mobilePercentage = devices.find((d) => d.deviceType?.toLowerCase() === 'mobile')?.percentage || 0;

  // Calculate positive sentiment percentage
  const positivePercentage = sentiment
    ? (sentiment.positive / (sentiment.positive + sentiment.neutral + sentiment.negative)) * 100
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key KPIs - 1 col mobile, 2 col tablet, 4 col desktop */}
      <KpiGrid>
        <KpiCard
          icon={Users}
          label="Total Sessions"
          value={formatNumber(overview?.totalSessions || 0)}
          subtitle={`${formatNumber(overview?.totalMessages || 0)} messages`}
        />
        <KpiCard
          icon={RefreshCw}
          label="Return Rate"
          value={formatPercent(returnRate)}
          valueColor={brandColor}
          subtitle={`${formatNumber(recurringUsers)} returning, ${formatNumber(newUsers)} new`}
        />
        <KpiCard
          icon={CheckCircle}
          label="Resolution Rate"
          value={formatPercent(overview?.resolutionRate || 0)}
          subtitle="issues resolved"
        />
        <KpiCard
          icon={Download}
          label="Bundle Loads"
          value={formatNumber(newUsers)}
          subtitle="GLB downloads from CDN"
        />
      </KpiGrid>

      {/* Main Charts - responsive heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sessions Over Time - Larger */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Sessions Over Time</h3>
          <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
            <TimeSeriesAreaChart
              data={enhancedTimeSeries}
              series={[
                { key: 'returning', name: 'Returning', color: GREY[500] },
                { key: 'new', name: 'New', color: brandColor },
              ]}
              height={300}
              brandColor={brandColor}
            />
          </div>
        </Card>

        {/* User Breakdown Donut */}
        <Card className="overflow-visible">
          <h3 className="font-semibold text-foreground mb-4">User Breakdown</h3>
          <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
            <DonutChart
              data={userData}
              height={300}
              brandColor={brandColor}
              innerRadius={55}
              outerRadius={85}
              showLabels={true}
            />
          </div>
        </Card>
      </div>

      {/* Bottom Row - Categories & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Categories - 2 cols */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
          <div className="h-[200px] sm:h-[220px] lg:h-[260px] overflow-visible">
            <HorizontalBarChart
              data={categories.slice(0, 6).map((c) => ({ name: c.category, value: c.count }))}
              dataKey="value"
              nameKey="name"
              height={260}
              brandColor={brandColor}
              yAxisWidth={120}
            />
          </div>
        </Card>

        {/* Quick Insights - Desktop */}
        <Card className="hidden lg:block">
          <h3 className="font-semibold text-foreground mb-4">Quick Insights</h3>
          <div className="space-y-4">
            <InsightRow label="Top Country" value={countries[0]?.country || 'N/A'} icon={Globe} />
            <InsightRow label="Top Language" value={languages[0]?.language || 'N/A'} icon={MessageSquare} />
            <InsightRow label="Mobile Users" value={formatPercent(mobilePercentage)} icon={Smartphone} />
            <InsightRow label="Positive Sentiment" value={sentiment ? formatPercent(positivePercentage) : 'N/A'} icon={ThumbsUp} />
          </div>
        </Card>
      </div>

      {/* Quick Insights - Mobile/Tablet only (as grid cards) */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        <InsightCard label="Top Country" value={countries[0]?.country || 'N/A'} icon={Globe} />
        <InsightCard label="Top Language" value={languages[0]?.language || 'N/A'} icon={MessageSquare} />
        <InsightCard label="Mobile Users" value={formatPercent(mobilePercentage)} icon={Smartphone} />
        <InsightCard label="Positive" value={sentiment ? formatPercent(positivePercentage) : 'N/A'} icon={ThumbsUp} />
      </div>
    </div>
  );
}

// Helper components
function InsightRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="p-3 bg-background-secondary rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-foreground-secondary">{label}</span>
        <Icon size={14} className="text-foreground-tertiary" />
      </div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground-secondary">{label}</span>
        <Icon size={12} className="text-foreground-tertiary" />
      </div>
      <p className="text-base font-semibold text-foreground truncate">{value}</p>
    </Card>
  );
}

export default OverviewTab;
