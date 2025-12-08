'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { AudienceTabProps } from './types';

export function AudienceTab({
  paginatedSessions,
  brandColor,
  getAssistantInfo,
  onOpenTranscript,
  getDeviceIcon,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: AudienceTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Country</TableHead>
      <TableHead>Language</TableHead>
      <TableHead>Device</TableHead>
      <TableHead>Browser</TableHead>
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
                <p className="text-sm text-foreground">{session.visitor_country || '-'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{session.analysis?.language || '-'}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getDeviceIcon(session.device_type)}
                  <span className="text-sm text-foreground capitalize">{session.device_type || '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{session.browser_name || '-'}</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-foreground-tertiary">Country</p>
                  <p className="text-sm font-medium text-foreground">{session.visitor_country || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Language</p>
                  <p className="text-sm font-medium text-foreground">{session.analysis?.language || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Device</p>
                  <div className="flex items-center gap-1">
                    {getDeviceIcon(session.device_type)}
                    <span className="text-sm font-medium text-foreground capitalize">
                      {session.device_type || '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Browser</p>
                  <p className="text-sm font-medium text-foreground">{session.browser_name || '-'}</p>
                </div>
              </div>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default AudienceTab;
