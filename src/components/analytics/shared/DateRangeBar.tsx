'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, BarChart3 } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

type PresetValue = number;

export interface DateRangeBarProps {
  brandColor: string;
  dateRange: PresetValue;
  useCustomRange: boolean;
  customDateRange: { start: string; end: string };
  onPresetChange: (days: PresetValue) => void;
  onCustomApply: (range: { start: string; end: string }) => void;
  onCustomToggle: (enabled: boolean) => void;
  presets?: PresetValue[];
}

/**
 * Premium date range selector (desktop + mobile) with optional custom range picker.
 * Matches the pre-shared-filter visual treatment used on assistant analytics.
 */
export function DateRangeBar({
  brandColor,
  dateRange,
  useCustomRange,
  customDateRange,
  onPresetChange,
  onCustomApply,
  onCustomToggle,
  presets = [1, 7, 30, 90],
}: DateRangeBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localRange, setLocalRange] = useState(customDateRange);

  // Keep local state in sync with upstream changes
  useEffect(() => {
    setLocalRange(customDateRange);
  }, [customDateRange]);

  const displayLabel = useMemo(() => {
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      return `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`;
    }
    return dateRange === 1 ? 'Today' : `Showing last ${dateRange} days`;
  }, [customDateRange.end, customDateRange.start, dateRange, useCustomRange]);

  const mobileDisplay = useMemo(() => {
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      return `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`;
    }
    return dateRange === 1 ? 'Today' : `Last ${dateRange} days`;
  }, [customDateRange.end, customDateRange.start, dateRange, useCustomRange]);

  const ensureCustomRangePrefill = () => {
    if (localRange.start && localRange.end) return;
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 7);
    setLocalRange({
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Calendar size={16} className="text-foreground-tertiary" />
          <span className="text-sm font-medium text-foreground-secondary">Time Period:</span>

          <div className="flex gap-1 bg-background-tertiary p-1 rounded-lg">
            {presets.map((days) => (
              <button
                key={days}
                onClick={() => {
                  onCustomToggle(false);
                  onPresetChange(days);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !useCustomRange && dateRange === days
                    ? 'bg-surface-elevated text-foreground shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                }`}
                style={!useCustomRange && dateRange === days ? { color: brandColor } : {}}
              >
                {days === 1 ? 'Today' : `Last ${days} days`}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              ensureCustomRangePrefill();
              setShowDatePicker(!showDatePicker);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
              useCustomRange
                ? 'text-white shadow-sm'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:bg-background-hover'
            }`}
            style={useCustomRange ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
          >
            Custom Range
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg">
          <BarChart3 size={14} />
          {displayLabel}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground-secondary mb-1 block">Time Period</label>
            <Select
              fullWidth
              value={useCustomRange ? 'custom' : String(dateRange)}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') {
                  ensureCustomRangePrefill();
                  setShowDatePicker(true);
                } else {
                  onCustomToggle(false);
                  onPresetChange(Number(val));
                }
              }}
              options={[
                ...presets.map((p) => ({
                  value: String(p),
                  label: p === 1 ? 'Today' : `Last ${p} days`,
                })),
                { value: 'custom', label: 'Custom Range' },
              ]}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 text-xs text-foreground-tertiary bg-background-secondary px-3 py-2.5 rounded-lg w-full">
              <BarChart3 size={12} />
              <span className="truncate">{mobileDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showDatePicker && (
        <div className="bg-background-secondary rounded-lg p-4 border border-border mt-4">
          <h4 className="font-medium text-foreground mb-3">Select Custom Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={localRange.start}
              onChange={(e) => setLocalRange((prev) => ({ ...prev, start: e.target.value }))}
              max={localRange.end || new Date().toISOString().split('T')[0]}
            />
            <Input
              label="End Date"
              type="date"
              value={localRange.end}
              onChange={(e) => setLocalRange((prev) => ({ ...prev, end: e.target.value }))}
              min={localRange.start}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowDatePicker(false);
                onCustomToggle(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (localRange.start && localRange.end) {
                  onCustomApply(localRange);
                  onCustomToggle(true);
                  setShowDatePicker(false);
                }
              }}
              disabled={!localRange.start || !localRange.end}
            >
              Apply Range
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default DateRangeBar;
