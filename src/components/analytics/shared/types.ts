import type { Assistant, ChatSessionWithAnalysis } from '@/types';
import type { AssistantWithMetrics } from '@/lib/analytics/assistantComparison';

/**
 * Minimal assistant details attached to normalized analytics data.
 */
export type NormalizedAssistant = {
  id: string;
  name: string;
  image?: string;
  workspaceSlug?: string;
  status?: Assistant['status'];
  clientId?: string;
};

/**
 * Chat session with optional assistant metadata for shared tabs.
 */
export type NormalizedConversationSession = ChatSessionWithAnalysis & {
  assistant?: NormalizedAssistant;
};

/**
 * Shared conversation stats used across analytics surfaces.
 */
export interface ConversationStats {
  total: number;
  resolved: number;
  resolutionRate: number;
  avgDurationSeconds: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

/**
 * Normalized conversation payload returned by adapters.
 */
export interface ConversationsAdapterResult {
  sessions: NormalizedConversationSession[];
  stats: ConversationStats;
}

/**
 * Inputs supported by the shared conversation adapters.
 */
export type ConversationAdapterSource =
  | {
      type: 'assistantMetrics';
      metrics: AssistantWithMetrics[];
      assistants?: Assistant[];
      mode?: 'client' | 'assistant';
    }
  | {
      type: 'assistantSessions';
      assistant?: Assistant;
      sessions: ChatSessionWithAnalysis[];
      mode?: 'assistant';
    }
  | {
      type: 'sessions';
      assistants?: Assistant[];
      sessions: ChatSessionWithAnalysis[];
      mode?: 'client' | 'assistant';
    };
