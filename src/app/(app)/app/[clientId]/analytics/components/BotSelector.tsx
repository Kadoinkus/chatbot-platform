'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Bot, Workspace } from '@/types';

interface BotSelectorProps {
  bots: Bot[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedBots: string[];
  onBotToggle: (botId: string) => void;
  brandColor: string;
  fullWidth?: boolean;
}

export function BotSelector({
  bots,
  workspaces,
  selectedWorkspace,
  selectedBots,
  onBotToggle,
  brandColor,
  fullWidth = false,
}: BotSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter bots based on workspace
  const workspaceFilteredBots = bots.filter(
    (bot) => selectedWorkspace === 'all' || bot.workspaceId === selectedWorkspace
  );

  const getSelectionLabel = () => {
    if (selectedBots.includes('all') || selectedBots.length === 0) {
      return 'All Bots';
    }
    if (selectedBots.length === 1) {
      const bot = workspaceFilteredBots.find((b) => b.id === selectedBots[0]);
      return bot?.name || 'Select Bots';
    }
    return `${selectedBots.length} Bots Selected`;
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center gap-2 h-11 px-4 bg-info-100 dark:bg-info-700/30 border-2 border-info-500/30 rounded-xl hover:bg-info-100/80 dark:hover:bg-info-700/40 focus:outline-none focus:ring-2 focus:ring-info-500 ${
          fullWidth ? 'w-full' : 'min-w-[200px]'
        } justify-between`}
      >
        <span className="truncate font-medium text-info-700 dark:text-info-500">{getSelectionLabel()}</span>
        <ChevronDown
          size={16}
          className={`transition-transform text-info-600 dark:text-info-500 flex-shrink-0 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-surface-elevated border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <h4 className="font-medium text-sm text-foreground-secondary">Select Bots to Compare</h4>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {/* All Bots option */}
            <label className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBots.includes('all') || selectedBots.length === 0}
                onChange={() => onBotToggle('all')}
                className="rounded border-border text-interactive focus:ring-interactive"
              />
              <span className="text-sm font-medium text-foreground">All Bots</span>
            </label>
            <hr className="mx-3 border-border" />

            {/* Grouped by workspace or flat list */}
            {selectedWorkspace === 'all' ? (
              // Group by workspace
              workspaces.map((workspace) => {
                const workspaceBots = bots.filter((bot) => bot.workspaceId === workspace.id);
                if (workspaceBots.length === 0) return null;

                return (
                  <div key={workspace.id}>
                    <div className="px-3 py-2 text-xs font-medium text-foreground-tertiary bg-background-secondary border-t border-border">
                      {workspace.name}
                    </div>
                    {workspaceBots.map((bot) => (
                      <BotOption
                        key={bot.id}
                        bot={bot}
                        selected={selectedBots.includes(bot.id)}
                        onToggle={() => onBotToggle(bot.id)}
                        brandColor={brandColor}
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              // Flat list for selected workspace
              workspaceFilteredBots.map((bot) => (
                <BotOption
                  key={bot.id}
                  bot={bot}
                  selected={selectedBots.includes(bot.id)}
                  onToggle={() => onBotToggle(bot.id)}
                  brandColor={brandColor}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual bot option in dropdown
function BotOption({
  bot,
  selected,
  onToggle,
  brandColor,
}: {
  bot: Bot;
  selected: boolean;
  onToggle: () => void;
  brandColor: string;
}) {
  return (
    <label className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="rounded border-border text-interactive focus:ring-interactive"
      />
      {bot.image && (
        <img
          src={bot.image}
          alt={bot.name}
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: brandColor }}
        />
      )}
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{bot.name}</span>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          bot.status === 'Live'
            ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500'
            : bot.status === 'Paused'
            ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500'
            : 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
        }`}
      >
        {bot.status}
      </span>
    </label>
  );
}

export default BotSelector;
