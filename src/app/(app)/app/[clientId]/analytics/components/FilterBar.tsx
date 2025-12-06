'use client';

import { Filter, Download } from 'lucide-react';
import { Select, Button } from '@/components/ui';
import { BotSelector } from './BotSelector';
import type { Bot, Workspace } from '@/types';

interface FilterBarProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  onWorkspaceChange: (value: string) => void;
  bots: Bot[];
  selectedBots: string[];
  onBotToggle: (botId: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  brandColor: string;
}

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
];

export function FilterBar({
  workspaces,
  selectedWorkspace,
  onWorkspaceChange,
  bots,
  selectedBots,
  onBotToggle,
  dateRange,
  onDateRangeChange,
  brandColor,
}: FilterBarProps) {
  const workspaceOptions = [
    { value: 'all', label: 'All Workspaces' },
    ...workspaces.map((ws) => ({ value: ws.id, label: ws.name })),
  ];

  return (
    <div className="mb-6">
      {/* Desktop: Horizontal layout */}
      <div className="hidden lg:flex gap-3 flex-wrap items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground-secondary">Workspace:</span>
          </div>
          <Select
            fullWidth={false}
            options={workspaceOptions}
            value={selectedWorkspace}
            onChange={(e) => onWorkspaceChange(e.target.value)}
            minWidth="180px"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground-secondary">Bot Selection:</span>
          </div>
          <BotSelector
            bots={bots}
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            selectedBots={selectedBots}
            onBotToggle={onBotToggle}
            brandColor={brandColor}
          />
        </div>

        <Select
          fullWidth={false}
          options={DATE_RANGE_OPTIONS}
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          minWidth="140px"
        />

        <Button variant="secondary" icon={<Filter size={18} />}>
          Filters
        </Button>

        <Button icon={<Download size={18} />}>Export Report</Button>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-secondary mb-1 block">Workspace</label>
            <Select
              fullWidth
              options={workspaceOptions}
              value={selectedWorkspace}
              onChange={(e) => onWorkspaceChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary mb-1 block">Date Range</label>
            <Select
              fullWidth
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-secondary mb-1 block">Bots</label>
          <BotSelector
            bots={bots}
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            selectedBots={selectedBots}
            onBotToggle={onBotToggle}
            brandColor={brandColor}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" icon={<Filter size={18} />} className="w-full">
            Filters
          </Button>
          <Button icon={<Download size={18} />} className="w-full">
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
