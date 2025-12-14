'use client';

import { ReactNode, useMemo } from 'react';
import { Filter, Download } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { AssistantSelector } from '@/components/analytics';
import type { Assistant, Workspace } from '@/types';

type AssistantSelectionMode = 'single' | 'multi';

export interface FilterBarProps {
  // Workspaces
  workspaces?: Workspace[];
  selectedWorkspace?: string;
  onWorkspaceChange?: (value: string) => void;
  workspaceLabel?: string;

  // Assistants
  assistants?: Assistant[];
  assistantSelectionMode?: AssistantSelectionMode;
  selectedAssistants?: string[]; // use array even for single-selection
  onAssistantChange?: (ids: string[]) => void;
  assistantLabel?: string;
  brandColor?: string;

  // Date range
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  dateOptions?: { value: string; label: string }[];

  // Custom date range (optional)
  allowCustomRange?: boolean;
  customRangeEnabled?: boolean;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (value: string) => void;
  onCustomEndChange?: (value: string) => void;
  onApplyCustomRange?: () => void;
  onCustomRangeToggle?: (enabled: boolean) => void;
  customRangeLabel?: string;

  // Status (optional)
  statusOptions?: { value: string; label: string }[];
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;

  // Search (optional)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Actions
  showFilterButton?: boolean;
  showExportButton?: boolean;
  extraActions?: ReactNode;
}

const DEFAULT_DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
];

export function FilterBar({
  workspaces = [],
  selectedWorkspace = 'all',
  onWorkspaceChange,
  workspaceLabel = 'Workspace',
  assistants = [],
  assistantSelectionMode = 'multi',
  selectedAssistants = [],
  onAssistantChange,
  assistantLabel = 'AI Assistants',
  brandColor,
  dateRange = '30days',
  onDateRangeChange,
  dateOptions = DEFAULT_DATE_OPTIONS,
  allowCustomRange = false,
  customRangeEnabled = false,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustomRange,
  onCustomRangeToggle,
  customRangeLabel = 'Custom range',
  statusOptions,
  selectedStatus,
  onStatusChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  showFilterButton = false,
  showExportButton = false,
  extraActions,
}: FilterBarProps) {
  const workspaceOptions = useMemo(
    () => [
      { value: 'all', label: 'All Workspaces' },
      ...workspaces.map((ws) => ({
        value: ws.slug || ws.id,
        label: ws.name,
      })),
    ],
    [workspaces]
  );

  const assistantOptions = useMemo(
    () => {
      const filtered =
        selectedWorkspace === 'all'
          ? assistants
          : assistants.filter((a) => a.workspaceSlug === selectedWorkspace);
      return [{ value: 'all', label: 'All Assistants' }, ...filtered.map((a) => ({ value: a.id, label: a.name }))];
    },
    [assistants, selectedWorkspace]
  );

  const mergedDateOptions = useMemo(() => {
    if (!allowCustomRange) return dateOptions;
    const hasCustom = dateOptions.some((opt) => opt.value === 'custom');
    return hasCustom ? dateOptions : [...dateOptions, { value: 'custom', label: customRangeLabel }];
  }, [allowCustomRange, customRangeLabel, dateOptions]);

  const showCustomRangeInputs = allowCustomRange && (customRangeEnabled || dateRange === 'custom');

  const handleDateChange = (value: string) => {
    onDateRangeChange?.(value);
    if (allowCustomRange && onCustomRangeToggle) {
      onCustomRangeToggle(value === 'custom');
    }
  };

  const renderAssistantSelector = () => {
    if (!assistants.length || !onAssistantChange) return null;

    const filteredAssistants =
      selectedWorkspace === 'all'
        ? assistants
        : assistants.filter((a) => a.workspaceSlug === selectedWorkspace);

    return (
      <AssistantSelector
        assistants={filteredAssistants}
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        selectedAssistants={selectedAssistants}
        selectionMode={assistantSelectionMode}
        onAssistantToggle={(id) => {
          if (assistantSelectionMode === 'single') {
            onAssistantChange([id]);
            return;
          }
          const isSelected = selectedAssistants.includes(id);
          const next = isSelected ? selectedAssistants.filter((v) => v !== id) : [...selectedAssistants, id];
          onAssistantChange(next);
        }}
        brandColor={brandColor || '#6366F1'}
        fullWidth
      />
    );
  };

  return (
    <div className="mb-6">
      {/* Desktop */}
      <div className="hidden lg:flex gap-3 flex-wrap items-end">
        {onSearchChange && (
          <div className="min-w-[240px] flex-1">
            <Input
              icon={<Filter size={18} />}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {onWorkspaceChange && workspaceOptions.length > 0 && (
          <div>
            <label className="text-sm font-medium text-foreground-secondary mb-2 block">{workspaceLabel}</label>
            <Select
              fullWidth={false}
              options={workspaceOptions}
              value={selectedWorkspace}
              onChange={(e) => onWorkspaceChange(e.target.value)}
              minWidth="180px"
            />
          </div>
        )}

        {onAssistantChange && assistants.length > 0 && (
          <div className="min-w-[240px]">
            <label className="text-sm font-medium text-foreground-secondary mb-2 block">{assistantLabel}</label>
            {renderAssistantSelector()}
          </div>
        )}

        {onStatusChange && statusOptions && (
          <Select
            fullWidth={false}
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            minWidth="160px"
          />
        )}

        {onDateRangeChange && (
          <Select
            fullWidth={false}
            options={mergedDateOptions}
            value={dateRange}
            onChange={(e) => handleDateChange(e.target.value)}
            minWidth="140px"
          />
        )}

        {showCustomRangeInputs && (
          <div className="flex items-end gap-2">
            <div className="min-w-[160px]">
              <label className="text-sm font-medium text-foreground-secondary mb-1 block">Start</label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => onCustomStartChange?.(e.target.value)}
              />
            </div>
            <div className="min-w-[160px]">
              <label className="text-sm font-medium text-foreground-secondary mb-1 block">End</label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => onCustomEndChange?.(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              onClick={onApplyCustomRange}
              disabled={!customStart || !customEnd}
              variant={customRangeEnabled ? 'primary' : 'secondary'}
            >
              Apply
            </Button>
          </div>
        )}

        {showFilterButton && (
          <Button variant="secondary" icon={<Filter size={18} />}>
            Filters
          </Button>
        )}

        {showExportButton && (
          <Button icon={<Download size={18} />}>Export</Button>
        )}

        {extraActions}
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        {onSearchChange && (
          <Input
            icon={<Filter size={18} />}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          {onWorkspaceChange && workspaceOptions.length > 0 && (
            <Select
              fullWidth
              options={workspaceOptions}
              value={selectedWorkspace}
              onChange={(e) => onWorkspaceChange(e.target.value)}
            />
          )}

          {onDateRangeChange && (
            <Select
              fullWidth
              options={mergedDateOptions}
              value={dateRange}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          )}

          {showCustomRangeInputs && (
            <>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => onCustomStartChange?.(e.target.value)}
              />
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => onCustomEndChange?.(e.target.value)}
              />
              <Button
                variant={customRangeEnabled ? 'primary' : 'secondary'}
                disabled={!customStart || !customEnd}
                onClick={onApplyCustomRange}
                className="col-span-2"
              >
                Apply Range
              </Button>
            </>
          )}

          {onAssistantChange && assistants.length > 0 && (
            <div className="col-span-2">
              {renderAssistantSelector()}
            </div>
          )}

          {onStatusChange && statusOptions && (
            <Select
              fullWidth
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {showFilterButton && (
            <Button variant="secondary" icon={<Filter size={18} />} className="w-full">
              Filters
            </Button>
          )}
          {showExportButton && (
            <Button icon={<Download size={18} />} className="w-full">
              Export
            </Button>
          )}
        </div>

        {extraActions}
      </div>
    </div>
  );
}

export default FilterBar;
