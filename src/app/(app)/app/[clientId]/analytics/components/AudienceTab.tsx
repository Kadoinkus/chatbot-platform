'use client';

import { Globe, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { BotComparisonTable, type ColumnDefinition } from '@/components/analytics/BotComparisonTable';
import {
  formatNumber,
  formatPercent,
  getTopBrowser,
  type BotWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/botComparison';

interface AudienceTabProps {
  botMetrics: BotWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function AudienceTab({ botMetrics, totals, brandColor }: AudienceTabProps) {
  // Calculate unique counts
  const uniqueCountries = botMetrics.length > 0
    ? new Set(botMetrics.flatMap((b) => b.countries.map((c) => c.country))).size
    : 0;
  const uniqueLanguages = botMetrics.length > 0
    ? new Set(botMetrics.flatMap((b) => b.languages.map((l) => l.language))).size
    : 0;
  const uniqueDevices = botMetrics.length > 0
    ? new Set(botMetrics.flatMap((b) => b.devices.map((d) => d.deviceType))).size
    : 0;

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'topCountry',
      header: 'Top Country',
      render: (bot) => bot.countries[0]?.country || '-',
    },
    {
      key: 'topLanguage',
      header: 'Top Language',
      render: (bot) => bot.languages[0]?.language || '-',
    },
    {
      key: 'mobile',
      header: 'Mobile %',
      render: (bot) => {
        const mobile = bot.devices.find((d) => d.deviceType === 'mobile');
        return formatPercent(mobile?.percentage || 0);
      },
      sortValue: (bot) => bot.devices.find((d) => d.deviceType === 'mobile')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'desktop',
      header: 'Desktop %',
      render: (bot) => {
        const desktop = bot.devices.find((d) => d.deviceType === 'desktop');
        return formatPercent(desktop?.percentage || 0);
      },
      sortValue: (bot) => bot.devices.find((d) => d.deviceType === 'desktop')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'topBrowser',
      header: 'Top Browser',
      render: (bot) => getTopBrowser(bot),
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <KpiGrid className="mb-6">
        <KpiCard
          icon={Globe}
          label="Total Visitors"
          value={formatNumber(totals.totalSessions)}
        />
        <KpiCard
          icon={Users}
          label="Countries"
          value={uniqueCountries}
        />
        <KpiCard
          icon={MessageSquare}
          label="Languages"
          value={uniqueLanguages}
        />
        <KpiCard
          icon={BarChart3}
          label="Device Types"
          value={uniqueDevices}
        />
      </KpiGrid>

      {/* Bot Comparison Table */}
      <BotComparisonTable
        bots={botMetrics}
        columns={columns}
        brandColor={brandColor}
        title="Bot Comparison - Audience"
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

export default AudienceTab;
