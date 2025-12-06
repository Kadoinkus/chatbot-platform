'use client';

import { Globe, MessageSquare, Smartphone, Monitor } from 'lucide-react';
import { Card } from '@/components/ui';
import { HorizontalBarChart } from '@/components/analytics/charts';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import type { AudienceTabProps } from './types';

export function AudienceTab({
  brandColor,
  sessions,
  countries,
  languages,
  devices,
  formatPercent,
}: AudienceTabProps) {
  const mobilePercent = devices.find((d) => d.deviceType?.toLowerCase() === 'mobile')?.percentage || 0;
  const desktopPercent = devices.find((d) => d.deviceType?.toLowerCase() === 'desktop')?.percentage || 0;
  const topCountryPercent = countries[0] ? (countries[0].count / sessions.length) * 100 : 0;

  // Calculate browser stats
  const browserCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const browser = s.browser_name || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });
  const total = sessions.length || 1;
  const browsers = Object.entries(browserCounts)
    .map(([name, count]) => ({ name, percentage: (count / total) * 100 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  // Calculate OS stats
  const osCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const os = s.os_name || 'Unknown';
    osCounts[os] = (osCounts[os] || 0) + 1;
  });
  const operatingSystems = Object.entries(osCounts)
    .map(([name, count]) => ({ name, percentage: (count / total) * 100 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Audience KPIs */}
      <KpiGrid>
        <KpiCard
          icon={Globe}
          label="Top Country"
          value={countries[0]?.country || 'N/A'}
          subtitle={countries[0] ? `${formatPercent(topCountryPercent)} of sessions` : ''}
        />
        <KpiCard
          icon={MessageSquare}
          label="Top Language"
          value={languages[0]?.language || 'N/A'}
          subtitle={languages[0] ? `${formatPercent(languages[0].percentage)} of sessions` : ''}
        />
        <KpiCard icon={Smartphone} label="Mobile" value={formatPercent(mobilePercent)} subtitle="of all users" />
        <KpiCard icon={Monitor} label="Desktop" value={formatPercent(desktopPercent)} subtitle="of all users" />
      </KpiGrid>

      {/* Geographic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Countries</h3>
          <div className="h-[180px] sm:h-[200px] lg:h-[240px]">
            <HorizontalBarChart
              data={countries.slice(0, 6).map((c) => ({ name: c.country, value: c.count }))}
              dataKey="value"
              nameKey="name"
              height={240}
              brandColor={brandColor}
              yAxisWidth={70}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-4">Languages</h3>
          <div className="h-[180px] sm:h-[200px] lg:h-[240px]">
            <HorizontalBarChart
              data={languages.slice(0, 6).map((l) => ({ name: l.language, value: l.percentage }))}
              dataKey="value"
              nameKey="name"
              height={240}
              brandColor={brandColor}
              yAxisWidth={70}
            />
          </div>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <TechSection title="Devices" data={devices.map((d) => ({ name: d.deviceType || 'Unknown', percentage: d.percentage }))} brandColor={brandColor} formatPercent={formatPercent} hasBorder />
          <TechSection title="Browsers" data={browsers} brandColor={brandColor} formatPercent={formatPercent} hasBorder />
          <TechSection title="Operating Systems" data={operatingSystems} brandColor={brandColor} formatPercent={formatPercent} isLast />
        </div>
      </Card>
    </div>
  );
}

function TechSection({
  title,
  data,
  brandColor,
  formatPercent,
  hasBorder,
  isLast,
}: {
  title: string;
  data: { name: string; percentage: number }[];
  brandColor: string;
  formatPercent: (v: number) => string;
  hasBorder?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`pb-4 md:pb-0 ${hasBorder && !isLast ? 'border-b md:border-b-0 md:border-r border-border md:pr-6' : ''}`}>
      <p className="text-sm font-medium text-foreground-secondary mb-3">{title}</p>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">{item.name}</span>
              <span className="text-foreground-secondary">{formatPercent(item.percentage)}</span>
            </div>
            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: brandColor }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AudienceTab;
