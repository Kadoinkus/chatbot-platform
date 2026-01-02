'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { CustomTabProps } from './types';

export function CustomTab({
  paginatedSessions,
  brandColor,
  getBrandColorForAssistant,
  getAssistantInfo,
  onOpenTranscript,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: CustomTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Custom Field 1</TableHead>
      <TableHead>Custom Field 2</TableHead>
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
          const assistantColor = getBrandColorForAssistant?.(assistant?.id) || brandColor;
          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <AssistantCell assistant={assistant} brandColor={assistantColor} getBrandColorForAssistant={getBrandColorForAssistant} />
              <TableCell>
                <p className="text-sm text-foreground-tertiary">-</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground-tertiary">-</p>
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
          const assistantColor = getBrandColorForAssistant?.(assistant?.id) || brandColor;
          return (
            <MobileCard key={session.id}>
              <MobileCardHeader
                session={session}
                assistant={assistant}
                brandColor={assistantColor}
                getBrandColorForAssistant={getBrandColorForAssistant}
                onView={() => onOpenTranscript(session)}
              />
              <p className="text-sm text-foreground-tertiary text-center py-4">
                No custom fields configured
              </p>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default CustomTab;
