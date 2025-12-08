'use client';

import { Globe, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/analytics';
import { AssistantComparisonTable, type ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';
import {
  formatNumber,
  formatPercent,
  getTopBrowser,
  type AssistantWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/assistantComparison';

interface AudienceTabProps {
  assistantMetrics: AssistantWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
}

export function AudienceTab({ assistantMetrics, totals, brandColor }: AudienceTabProps) {
  // Calculate unique counts
  const uniqueCountries = assistantMetrics.length > 0
    ? new Set(assistantMetrics.flatMap((a) => a.countries.map((c) => c.country))).size
    : 0;
  const uniqueLanguages = assistantMetrics.length > 0
    ? new Set(assistantMetrics.flatMap((a) => a.languages.map((l) => l.language))).size
    : 0;
  const uniqueDevices = assistantMetrics.length > 0
    ? new Set(assistantMetrics.flatMap((a) => a.devices.map((d) => d.deviceType))).size
    : 0;

  // Column definitions
  const columns: ColumnDefinition[] = [
    {
      key: 'topCountry',
      header: 'Top Country',
      render: (assistant) => assistant.countries[0]?.country || '-',
    },
    {
      key: 'topLanguage',
      header: 'Top Language',
      render: (assistant) => assistant.languages[0]?.language || '-',
    },
    {
      key: 'mobile',
      header: 'Mobile %',
      render: (assistant) => {
        const mobile = assistant.devices.find((d) => d.deviceType === 'mobile');
        return formatPercent(mobile?.percentage || 0);
      },
      sortValue: (assistant) => assistant.devices.find((d) => d.deviceType === 'mobile')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'desktop',
      header: 'Desktop %',
      render: (assistant) => {
        const desktop = assistant.devices.find((d) => d.deviceType === 'desktop');
        return formatPercent(desktop?.percentage || 0);
      },
      sortValue: (assistant) => assistant.devices.find((d) => d.deviceType === 'desktop')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'topBrowser',
      header: 'Top Browser',
      render: (assistant) => getTopBrowser(assistant),
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

      {/* AI Assistant Comparison Table */}
      <AssistantComparisonTable
        assistants={assistantMetrics}
        columns={columns}
        brandColor={brandColor}
        title="AI Assistant Comparison - Audience"
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

export default AudienceTab;
