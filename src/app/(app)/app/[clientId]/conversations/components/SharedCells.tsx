'use client';

import { Eye } from 'lucide-react';
import { TableCell } from '@/components/ui';
import type { ChatSessionWithAnalysis, Assistant } from '@/types';

interface SessionCellProps {
  session: ChatSessionWithAnalysis;
}

/**
 * Shared session cell showing country and ID
 */
export function SessionCell({ session }: SessionCellProps) {
  return (
    <TableCell>
      <div>
        <p className="font-medium text-sm text-foreground">
          {session.visitor_country || 'Unknown'}
        </p>
        <p className="text-xs text-foreground-tertiary">{session.id.slice(0, 8)}...</p>
      </div>
    </TableCell>
  );
}

interface AssistantCellProps {
  assistant: Assistant | undefined;
  brandColor: string;
}

/**
 * Shared assistant cell showing avatar and name
 */
export function AssistantCell({ assistant, brandColor }: AssistantCellProps) {
  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {assistant?.image ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor }}
          >
            <img
              src={assistant.image}
              alt={assistant.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          </div>
        ) : null}
        <p className="text-sm text-foreground">{assistant?.name || 'Unknown'}</p>
      </div>
    </TableCell>
  );
}

interface ActionsCellProps {
  onView: () => void;
}

/**
 * Shared actions cell with view button
 */
export function ActionsCell({ onView }: ActionsCellProps) {
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

interface MobileCardHeaderProps {
  session: ChatSessionWithAnalysis;
  assistant: Assistant | undefined;
  brandColor: string;
  onView: () => void;
}

/**
 * Shared mobile card header with assistant info and view button
 */
export function MobileCardHeader({ session, assistant, brandColor, onView }: MobileCardHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        {assistant?.image && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor }}
          >
            <img src={assistant.image} alt={assistant.name} className="w-7 h-7 rounded-full object-cover" />
          </div>
        )}
        <div>
          <p className="font-medium text-sm text-foreground">{assistant?.name || 'Unknown'}</p>
          <p className="text-xs text-foreground-tertiary">{session.visitor_country || 'Unknown'}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg hover:bg-background-tertiary"
        style={{ color: brandColor }}
      >
        <Eye size={14} />
        View
      </button>
    </div>
  );
}

export default SessionCell;
