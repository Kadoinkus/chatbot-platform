/**
 * AI Assistant Comparison Utilities
 *
 * Provides functions for fetching and comparing analytics data across multiple AI assistants.
 * Used by the main analytics dashboard for A/B testing and multi-assistant comparison.
 */

import { getAnalyticsForClient } from '@/lib/db/analytics';
import type {
  OverviewMetrics,
  SentimentBreakdown,
  CategoryBreakdown,
  LanguageBreakdown,
  DeviceBreakdown,
  CountryBreakdown,
  QuestionAnalytics,
  AnimationStats,
  DateRange,
  TimeSeriesDataPoint,
} from '@/lib/db/analytics/types';
import type { ChatSessionWithAnalysis, Assistant } from '@/types';

/**
 * AI Assistant with all aggregated metrics for comparison
 */
export interface AssistantWithMetrics {
  assistantId: string;
  assistantName: string;
  assistantImage: string;
  clientId: string;
  status: string;
  overview: OverviewMetrics;
  sentiment: SentimentBreakdown;
  categories: CategoryBreakdown[];
  questions: QuestionAnalytics[];
  unanswered: QuestionAnalytics[];
  countries: CountryBreakdown[];
  languages: LanguageBreakdown[];
  devices: DeviceBreakdown[];
  animations: AnimationStats;
  sessions: ChatSessionWithAnalysis[];
  timeSeries: TimeSeriesDataPoint[];
}

/**
 * Aggregated metrics across all selected bots
 */
export interface AggregatedMetrics {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalCostEur: number;
  avgResponseTimeMs: number;
  avgSessionDurationSeconds: number;
  avgResolutionRate: number;
  avgEscalationRate: number;
  sentiment: SentimentBreakdown;
}

/**
 * Fetch comprehensive comparison data for multiple AI assistants
 */
export async function fetchAssistantComparisonData(
  clientId: string,
  assistants: Assistant[],
  dateRange?: DateRange
): Promise<AssistantWithMetrics[]> {
  const analytics = getAnalyticsForClient(clientId);

  const assistantMetrics = await Promise.all(
    assistants.map(async (assistant) => {
      const [
        overview,
        sentiment,
        categories,
        questions,
        unanswered,
        countries,
        languages,
        devices,
        animations,
        sessions,
        timeSeries,
      ] = await Promise.all([
        analytics.aggregations.getOverviewByBotId(assistant.id, dateRange),
        analytics.aggregations.getSentimentByBotId(assistant.id, dateRange),
        analytics.aggregations.getCategoriesByBotId(assistant.id, dateRange),
        analytics.aggregations.getQuestionsByBotId(assistant.id, dateRange),
        analytics.aggregations.getUnansweredQuestionsByBotId(assistant.id, dateRange),
        analytics.aggregations.getCountriesByBotId(assistant.id, dateRange),
        analytics.aggregations.getLanguagesByBotId(assistant.id, dateRange),
        analytics.aggregations.getDevicesByBotId(assistant.id, dateRange),
        analytics.aggregations.getAnimationStatsByBotId(assistant.id, dateRange),
        analytics.chatSessions.getWithAnalysisByBotId(assistant.id, { dateRange }),
        analytics.aggregations.getTimeSeriesByBotId(assistant.id, dateRange),
      ]);

      return {
        assistantId: assistant.id,
        assistantName: assistant.name,
        assistantImage: assistant.image,
        clientId: assistant.clientId,
        status: assistant.status,
        overview,
        sentiment,
        categories,
        questions,
        unanswered,
        countries,
        languages,
        devices,
        animations,
        sessions,
        timeSeries,
      };
    })
  );

  return assistantMetrics;
}

/**
 * Calculate aggregated totals across all AI assistants
 */
export function calculateTotals(assistants: AssistantWithMetrics[]): AggregatedMetrics {
  if (assistants.length === 0) {
    return {
      totalSessions: 0,
      totalMessages: 0,
      totalTokens: 0,
      totalCostEur: 0,
      avgResponseTimeMs: 0,
      avgSessionDurationSeconds: 0,
      avgResolutionRate: 0,
      avgEscalationRate: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  const totalSessions = assistants.reduce((sum, a) => sum + a.overview.totalSessions, 0);
  const totalMessages = assistants.reduce((sum, a) => sum + a.overview.totalMessages, 0);
  const totalTokens = assistants.reduce((sum, a) => sum + a.overview.totalTokens, 0);
  const totalCostEur = assistants.reduce((sum, a) => sum + a.overview.totalCostEur, 0);

  // Weighted averages based on session count
  const weightedResponseTime = assistants.reduce(
    (sum, a) => sum + a.overview.averageResponseTimeMs * a.overview.totalSessions,
    0
  );
  const weightedDuration = assistants.reduce(
    (sum, a) => sum + a.overview.averageSessionDurationSeconds * a.overview.totalSessions,
    0
  );
  const weightedResolution = assistants.reduce(
    (sum, a) => sum + a.overview.resolutionRate * a.overview.totalSessions,
    0
  );
  const weightedEscalation = assistants.reduce(
    (sum, a) => sum + a.overview.escalationRate * a.overview.totalSessions,
    0
  );

  // Aggregate sentiment
  const totalPositive = assistants.reduce((sum, a) => sum + a.sentiment.positive, 0);
  const totalNeutral = assistants.reduce((sum, a) => sum + a.sentiment.neutral, 0);
  const totalNegative = assistants.reduce((sum, a) => sum + a.sentiment.negative, 0);
  const totalSentiment = totalPositive + totalNeutral + totalNegative;

  return {
    totalSessions,
    totalMessages,
    totalTokens,
    totalCostEur,
    avgResponseTimeMs: totalSessions > 0 ? weightedResponseTime / totalSessions : 0,
    avgSessionDurationSeconds: totalSessions > 0 ? weightedDuration / totalSessions : 0,
    avgResolutionRate: totalSessions > 0 ? weightedResolution / totalSessions : 0,
    avgEscalationRate: totalSessions > 0 ? weightedEscalation / totalSessions : 0,
    sentiment: {
      positive: totalSentiment > 0 ? Math.round((totalPositive / totalSentiment) * 100) : 0,
      neutral: totalSentiment > 0 ? Math.round((totalNeutral / totalSentiment) * 100) : 0,
      negative: totalSentiment > 0 ? Math.round((totalNegative / totalSentiment) * 100) : 0,
    },
  };
}

/**
 * Calculate cost metrics per AI assistant
 */
export function calculateAssistantCosts(assistant: AssistantWithMetrics): {
  chatCost: number;
  analysisCost: number;
  totalCost: number;
  costPerSession: number;
} {
  const chatCost = assistant.sessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
  const analysisCost = assistant.sessions.reduce(
    (sum, s) => sum + (s.analysis?.analytics_total_cost_eur || 0),
    0
  );
  const totalCost = chatCost + analysisCost;
  const costPerSession = assistant.overview.totalSessions > 0 ? totalCost / assistant.overview.totalSessions : 0;

  return { chatCost, analysisCost, totalCost, costPerSession };
}

/**
 * Calculate return rate (new vs returning users) from sessions
 */
export function calculateReturnRate(assistant: AssistantWithMetrics): {
  newUsers: number;
  returningUsers: number;
  returnRate: number;
} {
  const newUsers = assistant.sessions.filter((s) => s.glb_source === 'cdn_fetch').length;
  const returningUsers = assistant.sessions.filter((s) => s.glb_source === 'memory_cache').length;
  const total = newUsers + returningUsers;
  const returnRate = total > 0 ? (returningUsers / total) * 100 : 0;

  return { newUsers, returningUsers, returnRate };
}

/**
 * Calculate resolution breakdown from sessions
 */
export function calculateResolutionBreakdown(assistant: AssistantWithMetrics): {
  resolved: number;
  partial: number;
  unresolved: number;
  escalated: number;
} {
  const resolved = assistant.sessions.filter((s) => s.analysis?.resolution_status === 'resolved').length;
  const partial = assistant.sessions.filter((s) => s.analysis?.resolution_status === 'partial').length;
  const unresolved = assistant.sessions.filter((s) => s.analysis?.resolution_status === 'unresolved').length;
  const escalated = assistant.sessions.filter((s) => s.analysis?.escalated === true).length;

  return { resolved, partial, unresolved, escalated };
}

/**
 * Calculate URL and email handoffs from sessions
 */
export function calculateHandoffs(assistant: AssistantWithMetrics): {
  urlHandoffs: number;
  emailHandoffs: number;
} {
  const urlHandoffs = assistant.sessions.filter((s) => s.analysis?.forwarded_url === true).length;
  const emailHandoffs = assistant.sessions.filter((s) => s.analysis?.forwarded_email === true).length;

  return { urlHandoffs, emailHandoffs };
}

/**
 * Get top browser from sessions
 */
export function getTopBrowser(assistant: AssistantWithMetrics): string {
  const browserCounts: Record<string, number> = {};
  assistant.sessions.forEach((s) => {
    const browser = s.browser_name || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });

  const sorted = Object.entries(browserCounts).sort(([, a], [, b]) => b - a);
  return sorted.length > 0 ? sorted[0][0] : '-';
}

/**
 * Generate time series chart data for multiple AI assistants
 * Returns data formatted for MultiLineChart with one line per assistant
 */
export function generateMultiAssistantTimeSeries(
  assistants: AssistantWithMetrics[],
  metric: 'sessions' | 'cost' | 'tokens' | 'messages'
): { date: string; [assistantName: string]: number | string }[] {
  // Collect all unique dates
  const allDates = new Set<string>();
  assistants.forEach((assistant) => {
    assistant.timeSeries.forEach((point) => {
      allDates.add(point.date);
    });
  });

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Build chart data
  return sortedDates.map((date) => {
    const dataPoint: { date: string; [assistantName: string]: number | string } = { date };

    assistants.forEach((assistant) => {
      const point = assistant.timeSeries.find((p) => p.date === date);
      dataPoint[assistant.assistantName] = point ? point[metric] : 0;
    });

    return dataPoint;
  });
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

/**
 * Format cost to EUR currency string
 */
export function formatCost(cost: number): string {
  return `€${cost.toFixed(2)}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}
