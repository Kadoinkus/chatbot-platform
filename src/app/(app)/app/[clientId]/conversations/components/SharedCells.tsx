'use client';

import { useState, useEffect } from 'react';
import { Eye, Copy, Check } from 'lucide-react';
import { TableCell } from '@/components/ui';
import type { ChatSessionWithAnalysis, Assistant } from '@/types';

interface SessionCellProps {
  session: ChatSessionWithAnalysis;
}

/**
 * Shared session cell showing country and ID
 */
export function SessionCell({ session }: SessionCellProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(session.id);
    setCopied(true);
  };

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm text-foreground">
          {session.visitor_country || 'Unknown'}
        </p>
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

interface AssistantCellProps {
  assistant: Assistant | undefined;
  brandColor: string;
  getBrandColorForAssistant?: (assistantId?: string) => string;
}

/**
 * Shared assistant cell showing avatar and name
 */
export function AssistantCell({ assistant, brandColor, getBrandColorForAssistant }: AssistantCellProps) {
  const resolvedColor = getBrandColorForAssistant?.(assistant?.id) || brandColor;
  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {assistant?.image ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: resolvedColor }}
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
  getBrandColorForAssistant?: (assistantId?: string) => string;
}

/**
 * Shared mobile card header with assistant info and view button
 */
export function MobileCardHeader({ session, assistant, brandColor, onView, getBrandColorForAssistant }: MobileCardHeaderProps) {
  const resolvedColor = getBrandColorForAssistant?.(assistant?.id) || brandColor;
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        {assistant?.image && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: resolvedColor }}
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
