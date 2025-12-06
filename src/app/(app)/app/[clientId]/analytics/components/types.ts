import type { Bot, Workspace } from '@/types';
import type { BotWithMetrics, AggregatedMetrics } from '@/lib/analytics/botComparison';
import type { ColumnDefinition } from '@/components/analytics/BotComparisonTable';

// Shared props for all analytics tab components
export interface BaseTabProps {
  botMetrics: BotWithMetrics[];
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

// Bot selector props
export interface BotSelectorProps {
  bots: Bot[];
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedBots: string[];
  onBotToggle: (botId: string) => void;
  brandColor: string;
  fullWidth?: boolean;
}

// Filter bar props
export interface FilterBarProps {
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
