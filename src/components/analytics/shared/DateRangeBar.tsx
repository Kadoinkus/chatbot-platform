'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, BarChart3 } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

export type PresetValue = number | 'billing';

export interface DateRangeBarProps {
  brandColor: string;
  dateRange: PresetValue;
  useCustomRange: boolean;
  customDateRange: { start: string; end: string };
  onPresetChange: (days: PresetValue) => void;
  onCustomApply: (range: { start: string; end: string }) => void;
  onCustomToggle: (enabled: boolean) => void;
  presets?: PresetValue[];
  billingRange?: { start: string; end: string };
  billingLabel?: string;
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
  presets = [1, 7, 30, 'billing'],
  billingRange,
  billingLabel = 'Billing cycle',
}: DateRangeBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localRange, setLocalRange] = useState(customDateRange);

  const toIso = (date: Date) => date.toISOString().split('T')[0];
  const computePresetRange = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return { start: toIso(start), end: toIso(end) };
  };

  const getRangeForPreset = (preset: PresetValue) => {
    if (preset === 'billing') {
      if (billingRange?.start && billingRange?.end) {
        return billingRange;
      }
      return null;
    }
    return computePresetRange(preset);
  };

  // Keep local state in sync with selected range (preset or custom)
  useEffect(() => {
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      setLocalRange({
        start: customDateRange.start,
        end: customDateRange.end,
      });
    } else {
      const presetRange = getRangeForPreset(dateRange);
      if (presetRange) {
        setLocalRange(presetRange);
      } else {
        const days = typeof dateRange === 'number' ? dateRange : 30;
        setLocalRange(computePresetRange(days));
      }
    }
  }, [useCustomRange, customDateRange.start, customDateRange.end, dateRange, billingRange]);

  const formatDate = (value: string | Date) =>
    new Date(value).toLocaleDateString('en-GB');

  const displayLabel = useMemo(() => {
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      return `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`;
    }
    if (dateRange === 'billing') {
      if (billingRange?.start && billingRange?.end) {
        return `${formatDate(billingRange.start)} - ${formatDate(billingRange.end)}`;
      }
      return billingLabel;
    }
    const days = typeof dateRange === 'number' ? dateRange : 30;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    if (days === 1) {
      return formatDate(end);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [customDateRange.end, customDateRange.start, dateRange, useCustomRange, billingRange?.end, billingRange?.start, billingLabel]);

  const mobileDisplay = useMemo(() => {
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      return `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`;
    }
    if (dateRange === 'billing') {
      if (billingRange?.start && billingRange?.end) {
        return `${formatDate(billingRange.start)} - ${formatDate(billingRange.end)}`;
      }
      return billingLabel;
    }
    const days = typeof dateRange === 'number' ? dateRange : 30;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    if (days === 1) {
      return formatDate(end);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [customDateRange.end, customDateRange.start, dateRange, useCustomRange, billingRange?.end, billingRange?.start, billingLabel]);

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Calendar size={16} className="text-foreground-tertiary" />
          <span className="text-sm font-medium text-foreground-secondary">Time Period:</span>

          <div className="flex gap-1 bg-background-tertiary p-1 rounded-lg">
            {presets.map((preset) => (
              <button
                key={String(preset)}
                onClick={() => {
                  onCustomToggle(false);
                  onPresetChange(preset);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !useCustomRange && dateRange === preset
                    ? 'bg-surface-elevated text-foreground shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                }`}
                style={!useCustomRange && dateRange === preset ? { color: brandColor } : {}}
              >
                {preset === 'billing'
                  ? billingLabel
                  : preset === 1
                    ? 'Today'
                    : `Last ${preset} days`}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
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
                  setShowDatePicker(true);
                } else {
                  onCustomToggle(false);
                  onPresetChange(val === 'billing' ? 'billing' : Number(val));
                }
              }}
              options={[
                ...presets.map((p) => ({
                  value: String(p),
                  label: p === 'billing' ? billingLabel : p === 1 ? 'Today' : `Last ${p} days`,
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
