/**
 * Analytics Data Layer Types
 *
 * Defines interfaces for analytics operations on Supabase-structured data.
 * Both mock and Supabase implementations follow these interfaces.
 */

import type {
  ChatSession,
  ChatSessionAnalysis,
  ChatSessionWithAnalysis
} from '@/types';

// Date range filter
export interface DateRange {
  start: Date;
  end: Date;
}

// Filter options for chat sessions
export interface ChatSessionFilters {
  dateRange?: DateRange;
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string;
  resolution?: 'resolved' | 'partial' | 'unresolved';
  escalated?: boolean;
  language?: string;
  deviceType?: string;
  country?: string;
}

// Aggregated analytics result types
export interface OverviewMetrics {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalCostEur: number;
  averageResponseTimeMs: number;
  averageSessionDurationSeconds: number;
  resolutionRate: number;
  escalationRate: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface LanguageBreakdown {
  language: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface CountryBreakdown {
  country: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  sessions: number;
  messages: number;
  tokens: number;
  cost: number;
}

export interface SentimentTimeSeriesDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface HourlyBreakdown {
  hour: number;
  count: number;
  percentage: number;
}

export interface EngagementBreakdown {
  level: 'low' | 'medium' | 'high';
  count: number;
  percentage: number;
}

export interface ConversationTypeBreakdown {
  type: 'casual' | 'goal_driven';
  count: number;
  percentage: number;
}

export interface AnimationStats {
  totalTriggers: number;
  easterEggsTriggered: number;
  sessionsWithEasterEggs: number;
  totalSessions: number;
  topAnimations: { animation: string; count: number }[];
  topEasterEggs: { animation: string; count: number }[];
  waitSequences: { sequence: string; count: number }[];
}

export interface QuestionAnalytics {
  question: string;
  frequency: number;
  answered: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  mascot_id: string;
  message: string;
  author: 'user' | 'bot';
  timestamp: string;
  response_time_ms: number | null;
  response_animation: string | null;
  easter_egg_animation: string | null;
  wait_sequence: string | null;
  has_easter_egg: boolean;
}

// Chat session operations
export interface ChatSessionOperations {
  /**
   * Get all chat sessions for a bot
   */
  getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSession[]>;

  /**
   * Get all chat sessions for a client
   */
  getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSession[]>;

  /**
   * Get a single chat session by ID
   */
  getById(sessionId: string): Promise<ChatSession | null>;

  /**
   * Get chat sessions with their analyses joined
   */
  getWithAnalysisByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionWithAnalysis[]>;

  /**
   * Get chat sessions with their analyses for a client
   */
  getWithAnalysisByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionWithAnalysis[]>;
}

// Chat session analysis operations
export interface ChatSessionAnalysisOperations {
  /**
   * Get analysis for a specific session
   */
  getBySessionId(sessionId: string): Promise<ChatSessionAnalysis | null>;

  /**
   * Get all analyses for a bot
   */
  getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]>;

  /**
   * Get all analyses for a client
   */
  getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]>;
}

// Aggregated analytics operations
export interface AnalyticsAggregations {
  /**
   * Get overview metrics for a bot
   */
  getOverviewByBotId(botId: string, dateRange?: DateRange): Promise<OverviewMetrics>;

  /**
   * Get overview metrics for a client
   */
  getOverviewByClientId(clientId: string, dateRange?: DateRange): Promise<OverviewMetrics>;

  /**
   * Get sentiment breakdown for a bot
   */
  getSentimentByBotId(botId: string, dateRange?: DateRange): Promise<SentimentBreakdown>;

  /**
   * Get category breakdown for a bot
   */
  getCategoriesByBotId(botId: string, dateRange?: DateRange): Promise<CategoryBreakdown[]>;

  /**
   * Get language breakdown for a bot
   */
  getLanguagesByBotId(botId: string, dateRange?: DateRange): Promise<LanguageBreakdown[]>;

  /**
   * Get device breakdown for a bot
   */
  getDevicesByBotId(botId: string, dateRange?: DateRange): Promise<DeviceBreakdown[]>;

  /**
   * Get country breakdown for a bot
   */
  getCountriesByBotId(botId: string, dateRange?: DateRange): Promise<CountryBreakdown[]>;

  /**
   * Get time series data for a bot
   */
  getTimeSeriesByBotId(botId: string, dateRange?: DateRange): Promise<TimeSeriesDataPoint[]>;

  /**
   * Get frequently asked questions for a bot
   */
  getQuestionsByBotId(botId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]>;

  /**
   * Get unanswered questions for a bot
   */
  getUnansweredQuestionsByBotId(botId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]>;

  /**
   * Get sentiment over time for a bot
   */
  getSentimentTimeSeriesByBotId(botId: string, dateRange?: DateRange): Promise<SentimentTimeSeriesDataPoint[]>;

  /**
   * Get hourly session breakdown for a bot (peak hours)
   */
  getHourlyBreakdownByBotId(botId: string, dateRange?: DateRange): Promise<HourlyBreakdown[]>;

  /**
   * Get engagement level breakdown for a bot
   */
  getEngagementByBotId(botId: string, dateRange?: DateRange): Promise<EngagementBreakdown[]>;

  /**
   * Get conversation type breakdown for a bot
   */
  getConversationTypesByBotId(botId: string, dateRange?: DateRange): Promise<ConversationTypeBreakdown[]>;

  /**
   * Get animation statistics for a bot
   */
  getAnimationStatsByBotId(botId: string, dateRange?: DateRange): Promise<AnimationStats>;
}

// Complete analytics operations interface
export interface AnalyticsOperations {
  chatSessions: ChatSessionOperations;
  analyses: ChatSessionAnalysisOperations;
  aggregations: AnalyticsAggregations;
}
