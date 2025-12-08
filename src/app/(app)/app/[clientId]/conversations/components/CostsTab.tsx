'use client';

import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, AssistantCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { CostsTabProps } from './types';

export function CostsTab({
  paginatedSessions,
  brandColor,
  getAssistantInfo,
  onOpenTranscript,
  formatCost,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: CostsTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Chat Tokens</TableHead>
      <TableHead>Chat Cost</TableHead>
      <TableHead>Analysis Cost</TableHead>
      <TableHead>Total Cost</TableHead>
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
          const analysisCost = session.analysis?.analytics_total_cost_eur || 0;
          const chatCost = session.total_cost_eur || 0;
          const totalCost = chatCost + analysisCost;

          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <AssistantCell assistant={assistant} brandColor={brandColor} />
              <TableCell>
                <p className="text-sm text-foreground">{session.total_tokens?.toLocaleString() || '-'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{formatCost(chatCost)}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">{formatCost(analysisCost)}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-foreground">{formatCost(totalCost)}</p>
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
          const analysisCost = session.analysis?.analytics_total_cost_eur || 0;
          const chatCost = session.total_cost_eur || 0;
          const totalCost = chatCost + analysisCost;

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
                  <p className="text-xs text-foreground-tertiary">Chat Tokens</p>
                  <p className="text-sm font-medium text-foreground">
                    {session.total_tokens?.toLocaleString() || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Chat Cost</p>
                  <p className="text-sm font-medium text-foreground">{formatCost(chatCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Analysis Cost</p>
                  <p className="text-sm font-medium text-foreground">{formatCost(analysisCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Total Cost</p>
                  <p className="text-sm font-bold" style={{ color: brandColor }}>
                    {formatCost(totalCost)}
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

export default CostsTab;
