'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard, MobileBadge } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { OverviewTabProps } from './types';

export function OverviewTab({
  paginatedSessions,
  brandColor,
  getAssistantInfo,
  onOpenTranscript,
  formatTimestamp,
  formatDuration,
  getStatusIcon,
  getStatusLabel,
  getSentimentIcon,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: OverviewTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Messages</TableHead>
      <TableHead>Duration</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Sentiment</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Transcript</TableHead>
    </>
  );

  return (
    <>
      {/* Desktop Table */}
      <TableWrapper
        headers={headers}
        brandColor={brandColor}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      >
        {paginatedSessions.map((session) => {
          const assistant = getAssistantInfo(session.mascot_slug);
          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <AssistantCell assistant={assistant} brandColor={brandColor} />
              <TableCell>
                <p className="text-sm text-foreground">{session.total_messages}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{formatDuration(session.session_duration_seconds)}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(session)}
                  <span className="text-sm text-foreground">{getStatusLabel(session)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getSentimentIcon(session.analysis?.sentiment)}
                  <span className="text-sm text-foreground capitalize">
                    {session.analysis?.sentiment || '-'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{formatTimestamp(session.session_started_at)}</p>
              </TableCell>
              <ActionsCell onView={() => onOpenTranscript(session)} />
            </TableRow>
          );
        })}
      </TableWrapper>

      {/* Mobile Cards */}
      <MobileListWrapper
        brandColor={brandColor}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      >
        {paginatedSessions.map((session) => {
          const assistant = getAssistantInfo(session.mascot_slug);
          return (
            <MobileCard key={session.id}>
              <MobileCardHeader
                session={session}
                assistant={assistant}
                brandColor={brandColor}
                onView={() => onOpenTranscript(session)}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-foreground-tertiary">Messages</p>
                  <p className="text-sm font-medium text-foreground">{session.total_messages}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Duration</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDuration(session.session_duration_seconds)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <MobileBadge
                  variant={
                    session.analysis?.resolution_status === 'resolved'
                      ? 'success'
                      : session.analysis?.resolution_status === 'partial'
                      ? 'warning'
                      : session.analysis?.escalated
                      ? 'error'
                      : 'default'
                  }
                >
                  {getStatusIcon(session)}
                  <span className="ml-1">{getStatusLabel(session)}</span>
                </MobileBadge>
                <MobileBadge
                  variant={
                    session.analysis?.sentiment === 'positive'
                      ? 'success'
                      : session.analysis?.sentiment === 'negative'
                      ? 'error'
                      : 'default'
                  }
                >
                  {getSentimentIcon(session.analysis?.sentiment)}
                  <span className="ml-1 capitalize">{session.analysis?.sentiment || 'Unknown'}</span>
                </MobileBadge>
                <span className="text-xs text-foreground-tertiary ml-auto">
                  {formatTimestamp(session.session_started_at)}
                </span>
              </div>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default OverviewTab;
