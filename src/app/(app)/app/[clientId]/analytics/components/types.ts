import type { Assistant, Workspace } from '@/types';
import type { AssistantWithMetrics, AggregatedMetrics } from '@/lib/analytics/assistantComparison';
import type { ColumnDefinition } from '@/components/analytics/AssistantComparisonTable';

// Shared props for all analytics tab components
export interface BaseTabProps {
  assistantMetrics: AssistantWithMetrics[];
  totals: AggregatedMetrics;
  brandColor: string;
  columns: ColumnDefinition[];
}

// Props for tabs that need the questions modal
export interface WithQuestionsModalProps {
  onOpenQuestionsModal: (questions: string[], title: string) => void;
}

// Overview tab props
export interface OverviewTabProps extends BaseTabProps {}

// Conversations tab props
export interface ConversationsTabProps extends BaseTabProps {}

// Questions tab props
export interface QuestionsTabProps extends BaseTabProps, WithQuestionsModalProps {}

// Audience tab props
export interface AudienceTabProps extends BaseTabProps {}

// Animations tab props
export interface AnimationsTabProps extends BaseTabProps {}

// Costs tab props
export interface CostsTabProps extends BaseTabProps {}

// Custom tab props
export interface CustomTabProps extends BaseTabProps {}

// Assistant selector props
export interface AssistantSelectorProps {
  assistants: Assistant[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedAssistants: string[];
  onAssistantToggle: (assistantId: string) => void;
  brandColor: string;
  fullWidth?: boolean;
}

// Filter bar props
export interface FilterBarProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  onWorkspaceChange: (value: string) => void;
  assistants: Assistant[];
  selectedAssistants: string[];
  onAssistantToggle: (assistantId: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  brandColor: string;
}
