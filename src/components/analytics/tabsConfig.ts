import {
  BarChart3,
  MessageSquare,
  HelpCircle,
  Globe,
  Sparkles,
  Receipt,
  Filter,
  type LucideIcon,
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Shared tab configuration for all analytics pages.
 * Used by:
 * - /app/[clientId]/analytics (main analytics)
 * - /app/[clientId]/bot/[botId]/analytics (bot analytics)
 * - /app/[clientId]/conversations (conversations)
 */
export const ANALYTICS_TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'questions', label: 'Questions & Gaps', icon: HelpCircle },
  { id: 'audience', label: 'Audience', icon: Globe },
  { id: 'animations', label: 'Animations', icon: Sparkles },
  { id: 'costs', label: 'True Costs', icon: Receipt },
  { id: 'custom', label: 'Custom Metrics', icon: Filter },
];

// Tab IDs for type safety
export type AnalyticsTabId = (typeof ANALYTICS_TABS)[number]['id'];
