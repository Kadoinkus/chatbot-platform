import { useMemo, useCallback, useEffect } from 'react';
import type { Assistant, Workspace } from '@/types';

interface UseWorkspaceFilterOptions {
  assistants: Assistant[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedBot: string;
  onBotChange: (botId: string) => void;
}

interface UseWorkspaceFilterReturn {
  /** Assistants filtered by the selected workspace */
  filteredAssistants: Assistant[];
  /** Options for assistant select dropdown (includes 'Your AI Assistants' option) */
  botOptions: Array<{ value: string; label: string }>;
  /** Options for workspace select dropdown (includes 'All Workspaces' option) */
  workspaceOptions: Array<{ value: string; label: string }>;
}

/**
 * Hook for filtering assistants based on selected workspace.
 *
 * Features:
 * - Filters assistants list based on selected workspace
 * - Generates dropdown options for both assistants and workspaces
 * - Automatically resets assistant selection when workspace changes and selected assistant is not in the new workspace
 *
 * Usage:
 * ```tsx
 * const { filteredAssistants, botOptions, workspaceOptions } = useWorkspaceFilter({
 *   assistants,
 *   workspaces,
 *   selectedWorkspace,
 *   selectedBot,
 *   onBotChange: setSelectedBot,
 * });
 * ```
 */
export function useWorkspaceFilter({
  assistants,
  workspaces,
  selectedWorkspace,
  selectedBot,
  onBotChange,
}: UseWorkspaceFilterOptions): UseWorkspaceFilterReturn {
  // Filter assistants based on selected workspace
  const filteredAssistants = useMemo(() => {
    if (selectedWorkspace === 'all') {
      return assistants;
    }
    return assistants.filter((assistant) => assistant.workspaceId === selectedWorkspace);
  }, [assistants, selectedWorkspace]);

  // Generate assistant options for dropdown
  const botOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Your AI Assistants' },
      ...filteredAssistants.map((assistant) => ({ value: assistant.id, label: assistant.name })),
    ];
  }, [filteredAssistants]);

  // Generate workspace options for dropdown
  const workspaceOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Workspaces' },
      ...workspaces.map((w) => ({ value: w.id, label: w.name })),
    ];
  }, [workspaces]);

  // Reset assistant selection when workspace changes and selected assistant is not in the new workspace
  useEffect(() => {
    if (selectedBot !== 'all') {
      const assistantExistsInWorkspace = filteredAssistants.some((assistant) => assistant.id === selectedBot);
      if (!assistantExistsInWorkspace) {
        onBotChange('all');
      }
    }
  }, [selectedWorkspace, filteredAssistants, selectedBot, onBotChange]);

  return {
    filteredAssistants,
    botOptions,
    workspaceOptions,
  };
}

/**
 * Hook for multi-select assistant filtering with workspace support.
 * Used when multiple assistants can be selected at once.
 */
interface UseMultiAssistantWorkspaceFilterOptions {
  assistants: Assistant[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedAssistants: string[];
  onAssistantsChange: (assistantIds: string[]) => void;
}

interface UseMultiAssistantWorkspaceFilterReturn {
  /** Assistants filtered by the selected workspace */
  filteredAssistants: Assistant[];
  /** Options for workspace select dropdown */
  workspaceOptions: Array<{ value: string; label: string }>;
}

export function useMultiAssistantWorkspaceFilter({
  assistants,
  workspaces,
  selectedWorkspace,
  selectedAssistants,
  onAssistantsChange,
}: UseMultiAssistantWorkspaceFilterOptions): UseMultiAssistantWorkspaceFilterReturn {
  // Filter assistants based on selected workspace
  const filteredAssistants = useMemo(() => {
    if (selectedWorkspace === 'all') {
      return assistants;
    }
    return assistants.filter((assistant) => assistant.workspaceId === selectedWorkspace);
  }, [assistants, selectedWorkspace]);

  // Generate workspace options for dropdown
  const workspaceOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Workspaces' },
      ...workspaces.map((w) => ({ value: w.id, label: w.name })),
    ];
  }, [workspaces]);

  // Reset assistant selection when workspace changes
  useEffect(() => {
    if (!selectedAssistants.includes('all') && selectedAssistants.length > 0) {
      // Filter out assistants that are not in the new workspace
      const validAssistants = selectedAssistants.filter((assistantId) =>
        filteredAssistants.some((assistant) => assistant.id === assistantId)
      );

      // If no valid assistants remain, reset to 'all'
      if (validAssistants.length === 0) {
        onAssistantsChange(['all']);
      } else if (validAssistants.length !== selectedAssistants.length) {
        onAssistantsChange(validAssistants);
      }
    }
  }, [selectedWorkspace, filteredAssistants, selectedAssistants, onAssistantsChange]);

  return {
    filteredAssistants,
    workspaceOptions,
  };
}

// Legacy aliases for backward compatibility
/** @deprecated Use useWorkspaceFilter instead */
export const useMultiBotWorkspaceFilter = useMultiAssistantWorkspaceFilter;

export default useWorkspaceFilter;
