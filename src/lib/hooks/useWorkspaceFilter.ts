import { useMemo, useCallback, useEffect } from 'react';
import type { Bot, Workspace } from '@/types';

interface UseWorkspaceFilterOptions {
  bots: Bot[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedBot: string;
  onBotChange: (botId: string) => void;
}

interface UseWorkspaceFilterReturn {
  /** Bots filtered by the selected workspace */
  filteredBots: Bot[];
  /** Options for bot select dropdown (includes 'All Bots' option) */
  botOptions: Array<{ value: string; label: string }>;
  /** Options for workspace select dropdown (includes 'All Workspaces' option) */
  workspaceOptions: Array<{ value: string; label: string }>;
}

/**
 * Hook for filtering bots based on selected workspace.
 *
 * Features:
 * - Filters bots list based on selected workspace
 * - Generates dropdown options for both bots and workspaces
 * - Automatically resets bot selection when workspace changes and selected bot is not in the new workspace
 *
 * Usage:
 * ```tsx
 * const { filteredBots, botOptions, workspaceOptions } = useWorkspaceFilter({
 *   bots,
 *   workspaces,
 *   selectedWorkspace,
 *   selectedBot,
 *   onBotChange: setSelectedBot,
 * });
 * ```
 */
export function useWorkspaceFilter({
  bots,
  workspaces,
  selectedWorkspace,
  selectedBot,
  onBotChange,
}: UseWorkspaceFilterOptions): UseWorkspaceFilterReturn {
  // Filter bots based on selected workspace
  const filteredBots = useMemo(() => {
    if (selectedWorkspace === 'all') {
      return bots;
    }
    return bots.filter((bot) => bot.workspaceId === selectedWorkspace);
  }, [bots, selectedWorkspace]);

  // Generate bot options for dropdown
  const botOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Bots' },
      ...filteredBots.map((bot) => ({ value: bot.id, label: bot.name })),
    ];
  }, [filteredBots]);

  // Generate workspace options for dropdown
  const workspaceOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Workspaces' },
      ...workspaces.map((w) => ({ value: w.id, label: w.name })),
    ];
  }, [workspaces]);

  // Reset bot selection when workspace changes and selected bot is not in the new workspace
  useEffect(() => {
    if (selectedBot !== 'all') {
      const botExistsInWorkspace = filteredBots.some((bot) => bot.id === selectedBot);
      if (!botExistsInWorkspace) {
        onBotChange('all');
      }
    }
  }, [selectedWorkspace, filteredBots, selectedBot, onBotChange]);

  return {
    filteredBots,
    botOptions,
    workspaceOptions,
  };
}

/**
 * Hook for multi-select bot filtering with workspace support.
 * Used when multiple bots can be selected at once.
 */
interface UseMultiBotWorkspaceFilterOptions {
  bots: Bot[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedBots: string[];
  onBotsChange: (botIds: string[]) => void;
}

interface UseMultiBotWorkspaceFilterReturn {
  /** Bots filtered by the selected workspace */
  filteredBots: Bot[];
  /** Options for workspace select dropdown */
  workspaceOptions: Array<{ value: string; label: string }>;
}

export function useMultiBotWorkspaceFilter({
  bots,
  workspaces,
  selectedWorkspace,
  selectedBots,
  onBotsChange,
}: UseMultiBotWorkspaceFilterOptions): UseMultiBotWorkspaceFilterReturn {
  // Filter bots based on selected workspace
  const filteredBots = useMemo(() => {
    if (selectedWorkspace === 'all') {
      return bots;
    }
    return bots.filter((bot) => bot.workspaceId === selectedWorkspace);
  }, [bots, selectedWorkspace]);

  // Generate workspace options for dropdown
  const workspaceOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Workspaces' },
      ...workspaces.map((w) => ({ value: w.id, label: w.name })),
    ];
  }, [workspaces]);

  // Reset bot selection when workspace changes
  useEffect(() => {
    if (!selectedBots.includes('all') && selectedBots.length > 0) {
      // Filter out bots that are not in the new workspace
      const validBots = selectedBots.filter((botId) =>
        filteredBots.some((bot) => bot.id === botId)
      );

      // If no valid bots remain, reset to 'all'
      if (validBots.length === 0) {
        onBotsChange(['all']);
      } else if (validBots.length !== selectedBots.length) {
        onBotsChange(validBots);
      }
    }
  }, [selectedWorkspace, filteredBots, selectedBots, onBotsChange]);

  return {
    filteredBots,
    workspaceOptions,
  };
}

export default useWorkspaceFilter;
