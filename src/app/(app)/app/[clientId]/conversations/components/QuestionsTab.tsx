'use client';

import { ExternalLink, Mail } from 'lucide-react';
import { TableHead, TableRow, TableCell } from '@/components/ui';
import { MobileCard } from '@/components/analytics/MobileTable';
import { TableWrapper, MobileListWrapper } from './TableWrapper';
import { SessionCell, BotCell, ActionsCell, MobileCardHeader } from './SharedCells';
import type { QuestionsTabProps } from './types';

export function QuestionsTab({
  paginatedSessions,
  brandColor,
  getBotInfo,
  onOpenTranscript,
  onOpenQuestions,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: QuestionsTabProps) {
  const headers = (
    <>
      <TableHead>Session</TableHead>
      <TableHead>Bot</TableHead>
      <TableHead>Questions</TableHead>
      <TableHead>Gaps</TableHead>
      <TableHead>URLs</TableHead>
      <TableHead>Emails</TableHead>
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
          const bot = getBotInfo(session.mascot_id);
          return (
            <TableRow key={session.id}>
              <SessionCell session={session} />
              <BotCell bot={bot} brandColor={brandColor} />
              <TableCell>
                {session.analysis?.questions && session.analysis.questions.length > 0 ? (
                  <button
                    onClick={() => onOpenQuestions(session, 'asked')}
                    className="text-sm text-info-600 dark:text-info-500 hover:underline text-left"
                  >
                    {session.analysis.questions.length} question
                    {session.analysis.questions.length !== 1 ? 's' : ''}
                  </button>
                ) : (
                  <p className="text-sm text-foreground-tertiary">-</p>
                )}
              </TableCell>
              <TableCell>
                {session.analysis?.unanswered_questions && session.analysis.unanswered_questions.length > 0 ? (
                  <button
                    onClick={() => onOpenQuestions(session, 'unanswered')}
                    className="text-sm text-warning-600 dark:text-warning-500 hover:underline text-left"
                  >
                    {session.analysis.unanswered_questions.length} gap
                    {session.analysis.unanswered_questions.length !== 1 ? 's' : ''}
                  </button>
                ) : (
                  <p className="text-sm text-foreground-tertiary">-</p>
                )}
              </TableCell>
              <TableCell>
                {session.analysis?.url_links && session.analysis.url_links.length > 0 ? (
                  <div className="space-y-1 max-w-[200px]">
                    {session.analysis.url_links.slice(0, 2).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:underline truncate"
                      >
                        <ExternalLink size={12} className="flex-shrink-0" />
                        <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ))}
                    {session.analysis.url_links.length > 2 && (
                      <p className="text-xs text-foreground-tertiary">
                        +{session.analysis.url_links.length - 2} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-tertiary">-</p>
                )}
              </TableCell>
              <TableCell>
                {session.analysis?.email_links && session.analysis.email_links.length > 0 ? (
                  <div className="space-y-1 max-w-[200px]">
                    {session.analysis.email_links.slice(0, 2).map((email, i) => (
                      <a
                        key={i}
                        href={`mailto:${email}`}
                        className="flex items-center gap-1 text-sm text-info-600 dark:text-info-500 hover:underline truncate"
                      >
                        <Mail size={12} className="flex-shrink-0" />
                        <span className="truncate">{email}</span>
                      </a>
                    ))}
                    {session.analysis.email_links.length > 2 && (
                      <p className="text-xs text-foreground-tertiary">
                        +{session.analysis.email_links.length - 2} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-tertiary">-</p>
                )}
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
          const bot = getBotInfo(session.mascot_id);
          return (
            <MobileCard key={session.id}>
              <MobileCardHeader
                session={session}
                bot={bot}
                brandColor={brandColor}
                onView={() => onOpenTranscript(session)}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-foreground-tertiary">Questions</p>
                  {session.analysis?.questions?.length ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuestions(session, 'asked');
                      }}
                      className="text-sm font-medium text-info-600 dark:text-info-500"
                    >
                      {session.analysis.questions.length} question
                      {session.analysis.questions.length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary">Gaps</p>
                  {session.analysis?.unanswered_questions?.length ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuestions(session, 'unanswered');
                      }}
                      className="text-sm font-medium text-warning-600 dark:text-warning-500"
                    >
                      {session.analysis.unanswered_questions.length} gap
                      {session.analysis.unanswered_questions.length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">-</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {session.analysis?.url_links?.length ? (
                  <span className="flex items-center gap-1 text-info-600 dark:text-info-500">
                    <ExternalLink size={12} /> {session.analysis.url_links.length} URL
                    {session.analysis.url_links.length !== 1 ? 's' : ''}
                  </span>
                ) : null}
                {session.analysis?.email_links?.length ? (
                  <span className="flex items-center gap-1 text-info-600 dark:text-info-500">
                    <Mail size={12} /> {session.analysis.email_links.length} Email
                    {session.analysis.email_links.length !== 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>
            </MobileCard>
          );
        })}
      </MobileListWrapper>
    </>
  );
}

export default QuestionsTab;
