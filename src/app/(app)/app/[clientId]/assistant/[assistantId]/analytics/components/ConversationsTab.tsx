'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui';
import {
  SentimentAreaChart,
  DonutChart,
  HourlyBarChart,
  VerticalBarChart,
} from '@/components/analytics/charts';
import { GREY, GREYS, getChartColors } from '@/lib/chartColors';
import { KpiCard, KpiGrid } from '@/components/analytics/KpiCard';
import { MobileTable, MobileCard, MobileBadge } from '@/components/analytics/MobileTable';
import type { ConversationsTabProps } from './types';

export function ConversationsTab({
  brandColor,
  sessions,
  overview,
  sentiment,
  sentimentTimeSeries,
  hourlyBreakdown,
  formatNumber,
  formatPercent,
  formatDuration,
  onOpenTranscript,
}: ConversationsTabProps) {
  // Calculate average engagement time
  const avgEngagement = (() => {
    const engagementTimes = sessions
      .filter((s) => s.first_message_at && s.last_message_at)
      .map((s) => {
        const first = new Date(s.first_message_at!).getTime();
        const last = new Date(s.last_message_at!).getTime();
        return (last - first) / 1000;
      });
    return engagementTimes.length > 0
      ? engagementTimes.reduce((a, b) => a + b, 0) / engagementTimes.length
      : 0;
  })();

  // Calculate positive rate
  const positiveRate = sentiment
    ? (sentiment.positive / (sentiment.positive + sentiment.neutral + sentiment.negative)) * 100
    : 0;

  // Resolution data
  const resolutionColors = getChartColors(brandColor, 3);
  const resolved = sessions.filter((s) => s.analysis?.resolution_status === 'resolved').length;
  const partial = sessions.filter((s) => s.analysis?.resolution_status === 'partial').length;
  const unresolved = sessions.filter((s) => s.analysis?.resolution_status === 'unresolved').length;
  const resolutionData = [
    { name: 'Resolved', value: resolved, color: resolutionColors[0] },
    { name: 'Partial', value: partial, color: resolutionColors[2] },
    { name: 'Unresolved', value: unresolved, color: resolutionColors[1] },
  ];

  // Session duration buckets
  const durationBuckets = {
    '< 1 min': 0,
    '1-3 min': 0,
    '3-5 min': 0,
    '5-10 min': 0,
    '10+ min': 0,
  };
  sessions.forEach((s) => {
    const duration = s.session_duration_seconds || 0;
    if (duration < 60) durationBuckets['< 1 min']++;
    else if (duration < 180) durationBuckets['1-3 min']++;
    else if (duration < 300) durationBuckets['3-5 min']++;
    else if (duration < 600) durationBuckets['5-10 min']++;
    else durationBuckets['10+ min']++;
  });
  const durationData = Object.entries(durationBuckets).map(([range, count]) => ({
    name: range,
    value: count,
  }));

  const [copiedId, setCopiedId] = useState<string | null>(null);
  useEffect(() => {
    if (!copiedId) return;
    const t = setTimeout(() => setCopiedId(null), 1200);
    return () => clearTimeout(t);
  }, [copiedId]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
  };

  // Table columns for desktop
  const columns = [
    {
      key: 'sessionId',
      header: 'Session ID',
      render: (session: typeof sessions[0]) => (
        <button
          onClick={() => copyToClipboard(session.id)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs text-foreground-secondary hover:bg-background-tertiary hover:text-foreground transition-colors"
          title={`Copy full ID: ${session.id}`}
        >
          {session.id.slice(0, 3)}...
          {copiedId === session.id ? <Check size={12} /> : <Copy size={12} />}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (session: typeof sessions[0]) => new Date(session.session_started_at).toLocaleDateString(),
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (session: typeof sessions[0]) => session.total_messages,
    },
    {
      key: 'category',
      header: 'Category',
      render: (session: typeof sessions[0]) => session.analysis?.category || '-',
    },
    {
      key: 'sentiment',
      header: 'Sentiment',
      render: (session: typeof sessions[0]) => (
        <SentimentBadge sentiment={session.analysis?.sentiment} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (session: typeof sessions[0]) => (
        <StatusBadge status={session.analysis?.resolution_status} />
      ),
    },
    {
      key: 'view',
      header: 'View',
      align: 'center' as const,
      render: (session: typeof sessions[0]) =>
        session.full_transcript && session.full_transcript.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenTranscript(session);
            }}
            className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            style={{ color: brandColor }}
            title="View conversation"
          >
            <Eye size={16} />
          </button>
        ) : (
          <span className="text-foreground-tertiary">-</span>
        ),
    },
  ];

  // Mobile card render
  const renderMobileCard = (session: typeof sessions[0]) => (
    <MobileCard onClick={() => session.full_transcript?.length && onOpenTranscript(session)}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {new Date(session.session_started_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-foreground-secondary">{session.total_messages} messages</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(session.id);
          }}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono text-foreground-tertiary hover:bg-background-tertiary hover:text-foreground"
          title={`Copy full ID: ${session.id}`}
        >
          {session.id.slice(0, 3)}...
          {copiedId === session.id ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <p className="text-sm text-foreground-secondary mb-3">{session.analysis?.category || 'Uncategorized'}</p>
      <div className="flex items-center gap-2">
        <SentimentBadge sentiment={session.analysis?.sentiment} />
        <StatusBadge status={session.analysis?.resolution_status} />
        {session.full_transcript?.length ? (
          <Eye size={14} className="ml-auto text-foreground-tertiary" />
        ) : null}
      </div>
    </MobileCard>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Conversation KPIs */}
      <KpiGrid>
        <KpiCard
          icon={Clock}
          label="Avg Session Time"
          value={formatDuration(overview?.averageSessionDurationSeconds || 0)}
          subtitle="widget open duration"
        />
        <KpiCard
          icon={MessageSquare}
          label="Avg Engagement"
          value={formatDuration(avgEngagement)}
          subtitle="first to last message"
        />
        <KpiCard
          icon={ThumbsUp}
          label="Positive Rate"
          value={formatPercent(positiveRate)}
          subtitle={`${sentiment?.positive || 0} positive sessions`}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Escalation Rate"
          value={formatPercent(overview?.escalationRate || 0)}
          subtitle="to human support"
        />
      </KpiGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Sentiment Over Time</h3>
          <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
            <SentimentAreaChart data={sentimentTimeSeries} brandColor={brandColor} />
          </div>
        </Card>

        <Card className="overflow-visible">
          <h3 className="font-semibold text-foreground mb-4">Resolution Status</h3>
          <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
            <DonutChart data={resolutionData} brandColor={brandColor} />
          </div>
        </Card>
      </div>

      {/* Peak Hours & Session Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Peak Hours</h3>
          <div className="h-[180px] sm:h-[200px] lg:h-[220px] overflow-visible">
            <HourlyBarChart data={hourlyBreakdown} brandColor={brandColor} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-4">Session Duration</h3>
          <div className="h-[180px] sm:h-[200px] lg:h-[220px] overflow-visible">
            <VerticalBarChart
              data={durationData}
              dataKey="value"
              xAxisKey="name"
              brandColor={brandColor}
            />
          </div>
        </Card>
      </div>

      {/* Session Breakdown */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Session Breakdown</h3>
        <SessionBreakdown sessions={sessions} brandColor={brandColor} formatPercent={formatPercent} />
      </Card>

      {/* Recent Sessions */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Recent Conversations</h3>
        <MobileTable
          data={sessions.slice(0, 10)}
          columns={columns}
          mobileCard={renderMobileCard}
          keyExtractor={(s) => s.id}
          emptyMessage="No conversations yet"
        />
      </Card>
    </div>
  );
}

// Helper components
function SentimentBadge({ sentiment }: { sentiment?: string | null }) {
  const config = {
    positive: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: ThumbsUp },
    negative: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: ThumbsDown },
    neutral: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-400', icon: Minus },
  };
  const { bg, text, icon: Icon } = config[sentiment as keyof typeof config] || config.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={12} />
      {sentiment || 'Unknown'}
    </span>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const config = {
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    unresolved: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };
  const className = config[status as keyof typeof config] || config.unresolved;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}

function SessionBreakdown({
  sessions,
  brandColor,
  formatPercent,
}: {
  sessions: typeof ConversationsTab extends (props: infer P) => unknown ? P extends { sessions: infer S } ? S : never : never;
  brandColor: string;
  formatPercent: (v: number) => string;
}) {
  const total = sessions.length || 1;

  // Outcomes
  const outcomes = [
    { name: 'Completed', count: sessions.filter((s) => s.analysis?.session_outcome === 'completed').length },
    { name: 'Abandoned', count: sessions.filter((s) => s.analysis?.session_outcome === 'abandoned').length },
    { name: 'Timeout', count: sessions.filter((s) => s.analysis?.session_outcome === 'timeout').length },
    { name: 'Error', count: sessions.filter((s) => s.analysis?.session_outcome === 'error').length },
  ].filter((o) => o.count > 0);

  // Engagement
  const engagement = [
    { name: 'High', count: sessions.filter((s) => s.analysis?.engagement_level === 'high').length },
    { name: 'Medium', count: sessions.filter((s) => s.analysis?.engagement_level === 'medium').length },
    { name: 'Low', count: sessions.filter((s) => s.analysis?.engagement_level === 'low').length },
  ];

  // Conversation types
  const typeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const type = s.analysis?.conversation_type;
    if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const conversationTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([type, count]) => ({ name: type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()), count }));

  const barColors = [brandColor, GREYS[4], GREYS[5], GREYS[6]];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <BreakdownSection title="Outcomes" items={outcomes} total={total} colors={barColors} formatPercent={formatPercent} hasBorder />
      <BreakdownSection title="Engagement" items={engagement} total={total} colors={barColors} formatPercent={formatPercent} hasBorder />
      <BreakdownSection title="Conversation Types" items={conversationTypes} total={total} colors={barColors} formatPercent={formatPercent} isLast />
    </div>
  );
}

function BreakdownSection({
  title,
  items,
  total,
  colors,
  formatPercent,
  hasBorder,
  isLast,
}: {
  title: string;
  items: { name: string; count: number }[];
  total: number;
  colors: string[];
  formatPercent: (v: number) => string;
  hasBorder?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`pb-4 md:pb-0 ${hasBorder && !isLast ? 'border-b md:border-b-0 md:border-r border-border md:pr-6' : ''}`}>
      <p className="text-sm font-medium text-foreground-secondary mb-3">{title}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">{item.name}</span>
              <span className="text-foreground-secondary">{formatPercent((item.count / total) * 100)}</span>
            </div>
            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(item.count / total) * 100}%`, backgroundColor: colors[i % colors.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversationsTab;
