'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Minus,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { TableCell, TableHead, TableRow } from '@/components/ui';
import { MobileBadge, MobileCard } from '@/components/analytics/MobileTable';
import { Card } from '@/components/ui';
import { SentimentAreaChart, DonutChart, HourlyBarChart, VerticalBarChart } from '@/components/analytics/charts';
import type { NormalizedConversationSession } from './types';
import { MobileListWrapper, TableWrapper } from './conversations/TableWrapper';

type ResolutionVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface SharedConversationsTabProps {
  sessions: NormalizedConversationSession[];
  paginatedSessions?: NormalizedConversationSession[];
  brandColor: string;
  getBrandColorForAssistant?: (assistantId?: string) => string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  showAssistantColumn?: boolean;
  onOpenTranscript?: (session: NormalizedConversationSession) => void;
  // Assistant mode extras
  showAssistantInsights?: boolean;
  insights?: {
    sentimentTimeSeries?: Array<{ date: string; positive: number; neutral: number; negative: number }>;
    resolution?: Array<{ name: string; value: number; color?: string }>;
    peakHours?: Array<{ hour: number; count: number; percentage?: number }>;
    durationBuckets?: Array<{ name: string; value: number }>;
  };
}

const defaultFormatTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

/**
 * Shared conversations tab built on normalized session data.
 */
export function ConversationsTab({
  sessions,
  paginatedSessions,
  brandColor,
  getBrandColorForAssistant,
  pagination,
  showAssistantColumn = true,
  onOpenTranscript,
  showAssistantInsights = false,
  insights,
}: SharedConversationsTabProps) {
  const visibleSessions = paginatedSessions ?? sessions;
  const paginationState = useMemo(() => {
    if (pagination) return pagination;
    const totalItems = visibleSessions.length;
    return {
      currentPage: 1,
      totalPages: 1,
      totalItems,
      itemsPerPage: Math.max(totalItems, 1),
      onPageChange: () => {},
    };
  }, [pagination, visibleSessions.length]);

  const headers = (
    <>
      <TableHead>Session</TableHead>
      {showAssistantColumn && <TableHead>Assistant</TableHead>}
      <TableHead>Category</TableHead>
      <TableHead>Outcome</TableHead>
      <TableHead>Sentiment</TableHead>
      <TableHead>Device</TableHead>
      <TableHead>Transcript</TableHead>
    </>
  );

  return (
    <>
      {showAssistantInsights && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {insights.sentimentTimeSeries && insights.sentimentTimeSeries.length > 0 && (
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Sentiment Over Time</h3>
              <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
                <SentimentAreaChart data={insights.sentimentTimeSeries} brandColor={brandColor} />
              </div>
            </Card>
          )}

          {insights.resolution && insights.resolution.length > 0 && (
            <Card className="overflow-visible">
              <h3 className="font-semibold text-foreground mb-4">Resolution Status</h3>
              <div className="h-[220px] sm:h-[260px] lg:h-[300px] overflow-visible">
                <DonutChart data={insights.resolution} brandColor={brandColor} />
              </div>
            </Card>
          )}

          {insights.peakHours && insights.peakHours.length > 0 && (
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Peak Hours</h3>
              <div className="h-[180px] sm:h-[200px] lg:h-[220px] overflow-visible">
                <HourlyBarChart data={insights.peakHours} brandColor={brandColor} />
              </div>
            </Card>
          )}

          {insights.durationBuckets && insights.durationBuckets.length > 0 && (
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Session Duration</h3>
              <div className="h-[180px] sm:h-[200px] lg:h-[220px] overflow-visible">
                <VerticalBarChart data={insights.durationBuckets} dataKey="value" xAxisKey="name" brandColor={brandColor} />
              </div>
            </Card>
          )}
        </div>
      )}

      <TableWrapper
        headers={headers}
        brandColor={brandColor}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        totalItems={paginationState.totalItems}
        itemsPerPage={paginationState.itemsPerPage}
        onPageChange={paginationState.onPageChange}
      >
        {visibleSessions.map((session) => (
          <TableRow key={session.id}>
            <SessionCell session={session} />
            {showAssistantColumn && (
              <AssistantCell
                assistantName={session.assistant?.name}
                image={session.assistant?.image || '/images/client-mascots/m1-liza.png'}
                brandColor={
                  getBrandColorForAssistant
                    ? getBrandColorForAssistant(session.assistant?.id)
                    : brandColor
                }
              />
            )}
            <TableCell>
              <p className="text-sm text-foreground">{session.analysis?.category || '-'}</p>
            </TableCell>
            <TableCell>
              <ResolutionBadge session={session} />
            </TableCell>
            <TableCell>
              <SentimentBadge sentiment={session.analysis?.sentiment} />
            </TableCell>
            <TableCell>
              <DeviceBadge deviceType={session.device_type} />
            </TableCell>
            <ActionsCell
              onView={() => {
                if (onOpenTranscript) onOpenTranscript(session);
              }}
              disabled={!session.full_transcript || session.full_transcript.length === 0 || !onOpenTranscript}
            />
          </TableRow>
        ))}
      </TableWrapper>

      <MobileListWrapper
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        totalItems={paginationState.totalItems}
        itemsPerPage={paginationState.itemsPerPage}
        onPageChange={paginationState.onPageChange}
      >
        {visibleSessions.map((session) => (
          <MobileCard
            key={session.id}
            onClick={() => {
              if (session.full_transcript?.length && onOpenTranscript) onOpenTranscript(session);
            }}
          >
            <MobileCardHeader
              session={session}
              brandColor={
                getBrandColorForAssistant
                  ? getBrandColorForAssistant(session.assistant?.id)
                  : brandColor
              }
              showAssistant={showAssistantColumn}
              formatTimestamp={defaultFormatTimestamp}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-foreground-tertiary">Category</p>
                <p className="text-sm font-medium text-foreground">{session.analysis?.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary">Outcome</p>
                <ResolutionBadge session={session} compact />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SentimentBadge sentiment={session.analysis?.sentiment} />
              <MobileBadge className="capitalize">
                {session.analysis?.conversation_type || 'Unknown type'}
              </MobileBadge>
              <MobileBadge>
                <DeviceBadge deviceType={session.device_type} />
              </MobileBadge>
            </div>
          </MobileCard>
        ))}
      </MobileListWrapper>
    </>
  );
}

function SessionCell({ session }: { session: NormalizedConversationSession }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    if (!session.id) return;
    navigator.clipboard.writeText(session.id);
    setCopied(true);
  };

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <p className="font-medium text-sm text-foreground">
            {session.visitor_country || 'Unknown'}
          </p>
          <p className="text-xs text-foreground-tertiary">{defaultFormatTimestamp(session.session_started_at)}</p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono text-foreground-tertiary hover:bg-background-tertiary hover:text-foreground transition-colors"
          title={session.id}
        >
          {session.id.slice(0, 3)}...
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </TableCell>
  );
}

function AssistantCell({
  assistantName,
  image,
  brandColor,
}: {
  assistantName?: string;
  image?: string;
  brandColor: string;
}) {
  const imageSrc = image?.trim();
  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {imageSrc ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor }}
          >
            <img
              src={imageSrc}
              alt={assistantName || 'Assistant avatar'}
              className="w-5 h-5 rounded-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ backgroundColor: brandColor }}
            aria-hidden
          >
            {assistantName?.charAt(0) || '?'}
          </div>
        )}
        <p className="text-sm text-foreground">{assistantName || 'Unknown'}</p>
      </div>
    </TableCell>
  );
}

function ActionsCell({
  onView,
  disabled,
}: {
  onView: () => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <TableCell>
        <span className="text-sm text-foreground-tertiary">-</span>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <button
        onClick={onView}
        className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400"
      >
        <Eye size={14} />
        View
      </button>
    </TableCell>
  );
}

function ResolutionBadge({
  session,
  compact = false,
}: {
  session: NormalizedConversationSession;
  compact?: boolean;
}) {
  const { label, variant } = useMemo<{ label: string; variant: ResolutionVariant }>(() => {
    if (session.analysis?.escalated) {
      return { label: 'Escalated', variant: 'warning' as const };
    }
    const status = session.analysis?.resolution_status;
    if (!status) return { label: 'Unknown', variant: 'default' as const };
    if (status === 'resolved') return { label: 'Resolved', variant: 'success' as const };
    if (status === 'partial') return { label: 'Partial', variant: 'info' as const };
    if (status === 'unresolved') return { label: 'Unresolved', variant: 'error' as const };
    return { label: status, variant: 'default' as const };
  }, [session.analysis?.escalated, session.analysis?.resolution_status]);

  if (compact) {
    return (
      <MobileBadge variant={variant}>
        {label}
      </MobileBadge>
    );
  }

  const classes: Record<ResolutionVariant, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
    info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400',
    default: 'bg-background-tertiary text-foreground-secondary',
  };

  const Icon =
    variant === 'success'
      ? CheckCircle2
      : variant === 'error'
      ? AlertCircle
      : variant === 'warning'
      ? AlertCircle
      : Minus;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${classes[variant]}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment?: string | null }) {
  const config = {
    positive: { label: 'Positive', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    negative: { label: 'Negative', className: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400' },
    neutral: { label: 'Neutral', className: 'bg-background-tertiary text-foreground-secondary' },
  } as const;

  const { label, className } = config[sentiment as keyof typeof config] || config.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function DeviceBadge({ deviceType }: { deviceType?: string | null }) {
  const normalized = deviceType?.toLowerCase();
  const Icon = normalized === 'mobile' ? Smartphone : normalized === 'tablet' ? Tablet : Monitor;
  const label = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Device';

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-background-tertiary text-foreground-secondary">
      <Icon size={12} />
      {label}
    </span>
  );
}

function MobileCardHeader({
  session,
  brandColor,
  showAssistant,
  formatTimestamp = defaultFormatTimestamp,
}: {
  session: NormalizedConversationSession;
  brandColor: string;
  showAssistant: boolean;
  formatTimestamp?: (dateStr: string) => string;
}) {
  const imageSrc = session.assistant?.image?.trim();
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        {showAssistant && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={session.assistant?.name || 'Assistant avatar'}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-white">
                {session.assistant?.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
        )}
        <div>
          <p className="font-medium text-sm text-foreground">
            {showAssistant ? session.assistant?.name || 'Unknown' : session.visitor_country || 'Unknown'}
          </p>
          <p className="text-xs text-foreground-tertiary">
            {formatTimestamp(session.session_started_at)}
          </p>
        </div>
      </div>
      {session.full_transcript?.length ? (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-background-tertiary text-foreground-secondary">
          Transcript
        </span>
      ) : null}
    </div>
  );
}

export default ConversationsTab;
