'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { AnimationsTabProps } from './types';

export function AnimationsTab({
  paginatedSessions,
  brandColor,
  getAssistantInfo,
  onOpenTranscript,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: AnimationsTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Easter Egg</TableHead>
      <TableHead>User Type</TableHead>
      <TableHead>GLB Load</TableHead>
      <TableHead>Transcript</TableHead>
    </>
  );

  // Helper to get easter egg info
  const getEasterEggInfo = (session: (typeof paginatedSessions)[0]) => {
    const easterEggNames =
      session.full_transcript
        ?.filter((msg) => msg.easter && msg.easter.trim() !== '')
        .map((msg) => msg.easter as string) || [];
    const uniqueEasterEggs = [...new Set(easterEggNames)];
    const easterEggCount = session.easter_eggs_triggered || 0;
    return { uniqueEasterEggs, easterEggCount };
  };

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
          const { uniqueEasterEggs, easterEggCount } = getEasterEggInfo(session);

          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <AssistantCell assistant={assistant} brandColor={brandColor} />
              <TableCell>
                {uniqueEasterEggs.length > 0 ? (
                  <p className="text-sm text-foreground">{uniqueEasterEggs.join(', ')}</p>
                ) : easterEggCount > 0 ? (
                  <p className="text-sm text-foreground">{easterEggCount} triggered</p>
                ) : (
                  <p className="text-sm text-foreground-tertiary">-</p>
                )}
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">
                  {session.glb_source === 'cdn_fetch'
                    ? 'New visitor'
                    : session.glb_source === 'memory_cache'
                    ? 'Returning'
                    : '-'}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">
                  {session.glb_source
                    ? session.glb_transfer_size
                      ? `${(session.glb_transfer_size / 1024).toFixed(1)} KB`
                      : session.glb_source
                    : '-'}
                </p>
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
          const { uniqueEasterEggs, easterEggCount } = getEasterEggInfo(session);

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
                  <p className="text-xs text-foreground-tertiary">Easter Eggs</p>
                  <p className="text-sm font-medium text-foreground">
                    {uniqueEasterEggs.length > 0
                      ? uniqueEasterEggs.join(', ')
                      : easterEggCount > 0
                      ? `${easterEggCount} triggered`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">User Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {session.glb_source === 'cdn_fetch'
                      ? 'New visitor'
                      : session.glb_source === 'memory_cache'
                      ? 'Returning'
                      : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-foreground-tertiary">GLB Load</p>
                  <p className="text-sm font-medium text-foreground">
                    {session.glb_source
                      ? session.glb_transfer_size
                        ? `${(session.glb_transfer_size / 1024).toFixed(1)} KB`
                        : session.glb_source
                      : '-'}
                  </p>
                </div>
              </div>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default AnimationsTab;
