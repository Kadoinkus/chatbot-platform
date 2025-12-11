'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Assistant, Workspace } from '@/types';

interface AssistantSelectorProps {
  assistants: Assistant[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedAssistants: string[];
  onAssistantToggle: (assistantId: string) => void;
  brandColor: string;
  fullWidth?: boolean;
  selectionMode?: 'single' | 'multi';
}

/**
 * AssistantSelector - A multi-select dropdown for selecting AI assistants with workspace filtering.
 *
 * Features:
 * - Filters assistants based on selected workspace
 * - Groups assistants by workspace when "All Workspaces" is selected
 * - Shows flat list when a specific workspace is selected
 * - Supports multi-select with "Your AI Assistants" option
 */
export function AssistantSelector({
  assistants,
  workspaces,
  selectedWorkspace,
  selectedAssistants,
  onAssistantToggle,
  brandColor,
  fullWidth = false,
  selectionMode = 'multi',
}: AssistantSelectorProps) {
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

  // Filter assistants based on workspace
  const workspaceFilteredAssistants = assistants.filter(
    (assistant) => selectedWorkspace === 'all' || assistant.workspaceSlug === selectedWorkspace
  );

  const getSelectionLabel = () => {
    if (selectedAssistants.includes('all') || selectedAssistants.length === 0) {
      return 'Your AI Assistants';
    }
    if (selectedAssistants.length === 1) {
      const assistant = workspaceFilteredAssistants.find((a) => a.id === selectedAssistants[0]);
      return assistant?.name || 'Select AI Assistants';
    }
    return `${selectedAssistants.length} AI Assistants Selected`;
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} overflow-visible`} ref={dropdownRef}>
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
        <div className="absolute top-full left-0 mt-1 w-72 bg-surface-elevated border border-border rounded-lg shadow-lg z-[60]">
          <div className="max-h-56 overflow-y-auto p-2">
            {/* Grouped by workspace or flat list */}
            {selectedWorkspace === 'all' ? (
              // Group by workspace
              workspaces.map((workspace) => {
                const workspaceAssistants = assistants.filter((assistant) => assistant.workspaceSlug === workspace.slug);
                if (workspaceAssistants.length === 0) return null;

                return (
                  <div key={workspace.id}>
                    <div className="px-3 py-2 text-xs font-medium text-foreground-tertiary bg-background-secondary border-t border-border">
                      {workspace.name}
                    </div>
                    {workspaceAssistants.map((assistant) => (
                      <AssistantOption
                        key={assistant.id}
                        assistant={assistant}
                        selected={
                          selectionMode === 'single'
                            ? selectedAssistants[0] === assistant.id
                            : selectedAssistants.includes(assistant.id)
                        }
                        onToggle={() => onAssistantToggle(assistant.id)}
                        brandColor={brandColor}
                        selectionMode={selectionMode}
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              // Flat list for selected workspace
              workspaceFilteredAssistants.map((assistant) => (
                <AssistantOption
                  key={assistant.id}
                  assistant={assistant}
                  selected={
                    selectionMode === 'single'
                      ? selectedAssistants[0] === assistant.id
                      : selectedAssistants.includes(assistant.id)
                  }
                  onToggle={() => onAssistantToggle(assistant.id)}
                  brandColor={brandColor}
                  selectionMode={selectionMode}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual assistant option in dropdown
function AssistantOption({
  assistant,
  selected,
  onToggle,
  brandColor,
  selectionMode = 'multi',
}: {
  assistant: Assistant;
  selected: boolean;
  onToggle: () => void;
  brandColor: string;
  selectionMode?: 'single' | 'multi';
}) {
  return (
    <label className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
      <input
        type={selectionMode === 'single' ? 'radio' : 'checkbox'}
        checked={selected}
        onChange={onToggle}
        className="rounded border-border text-interactive focus:ring-interactive"
      />
      {assistant.image && (
        <img
          src={assistant.image}
          alt={assistant.name}
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: brandColor }}
        />
      )}
      <span className="text-sm font-medium text-foreground">{assistant.name}</span>
    </label>
  );
}

export default AssistantSelector;
