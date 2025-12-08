'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard, MobileBadge } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { ConversationsTabProps } from './types';

export function ConversationsTab({
  paginatedSessions,
  brandColor,
  getAssistantInfo,
  onOpenTranscript,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ConversationsTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Outcome</TableHead>
      <TableHead>Engagement</TableHead>
      <TableHead>Type</TableHead>
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
          const assistant = getAssistantInfo(session.mascot_id);
          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <AssistantCell assistant={assistant} brandColor={brandColor} />
              <TableCell>
                <p className="text-sm text-foreground">{session.analysis?.category || '-'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground capitalize">{session.analysis?.session_outcome || '-'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground capitalize">{session.analysis?.engagement_level || '-'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground capitalize">{session.analysis?.conversation_type || '-'}</p>
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
          const assistant = getAssistantInfo(session.mascot_id);
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
                  <p className="text-xs text-foreground-tertiary">Category</p>
                  <p className="text-sm font-medium text-foreground">{session.analysis?.category || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Type</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {session.analysis?.conversation_type || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <MobileBadge
                  variant={
                    session.analysis?.session_outcome === 'completed'
                      ? 'success'
                      : session.analysis?.session_outcome === 'abandoned'
                      ? 'warning'
                      : 'default'
                  }
                >
                  <span className="capitalize">{session.analysis?.session_outcome || '-'}</span>
                </MobileBadge>
                <MobileBadge
                  variant={
                    session.analysis?.engagement_level === 'high'
                      ? 'success'
                      : session.analysis?.engagement_level === 'low'
                      ? 'error'
                      : 'default'
                  }
                >
                  <span className="capitalize">{session.analysis?.engagement_level || '-'} engagement</span>
                </MobileBadge>
              </div>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default ConversationsTab;
