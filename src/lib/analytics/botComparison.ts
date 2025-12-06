/**
 * Bot Comparison Utilities
 *
 * Provides functions for fetching and comparing analytics data across multiple bots.
 * Used by the main analytics dashboard for A/B testing and multi-bot comparison.
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
import type { ChatSessionWithAnalysis, Bot } from '@/types';

/**
 * Bot with all aggregated metrics for comparison
 */
export interface BotWithMetrics {
  botId: string;
  botName: string;
  botImage: string;
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
 * Fetch comprehensive comparison data for multiple bots
 */
export async function fetchBotComparisonData(
  clientId: string,
  bots: Bot[],
  dateRange?: DateRange
): Promise<BotWithMetrics[]> {
  const analytics = getAnalyticsForClient(clientId);

  const botMetrics = await Promise.all(
    bots.map(async (bot) => {
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
        analytics.aggregations.getOverviewByBotId(bot.id, dateRange),
        analytics.aggregations.getSentimentByBotId(bot.id, dateRange),
        analytics.aggregations.getCategoriesByBotId(bot.id, dateRange),
        analytics.aggregations.getQuestionsByBotId(bot.id, dateRange),
        analytics.aggregations.getUnansweredQuestionsByBotId(bot.id, dateRange),
        analytics.aggregations.getCountriesByBotId(bot.id, dateRange),
        analytics.aggregations.getLanguagesByBotId(bot.id, dateRange),
        analytics.aggregations.getDevicesByBotId(bot.id, dateRange),
        analytics.aggregations.getAnimationStatsByBotId(bot.id, dateRange),
        analytics.chatSessions.getWithAnalysisByBotId(bot.id, { dateRange }),
        analytics.aggregations.getTimeSeriesByBotId(bot.id, dateRange),
      ]);

      return {
        botId: bot.id,
        botName: bot.name,
        botImage: bot.image,
        clientId: bot.clientId,
        status: bot.status,
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

  return botMetrics;
}

/**
 * Calculate aggregated totals across all bots
 */
export function calculateTotals(bots: BotWithMetrics[]): AggregatedMetrics {
  if (bots.length === 0) {
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

  const totalSessions = bots.reduce((sum, b) => sum + b.overview.totalSessions, 0);
  const totalMessages = bots.reduce((sum, b) => sum + b.overview.totalMessages, 0);
  const totalTokens = bots.reduce((sum, b) => sum + b.overview.totalTokens, 0);
  const totalCostEur = bots.reduce((sum, b) => sum + b.overview.totalCostEur, 0);

  // Weighted averages based on session count
  const weightedResponseTime = bots.reduce(
    (sum, b) => sum + b.overview.averageResponseTimeMs * b.overview.totalSessions,
    0
  );
  const weightedDuration = bots.reduce(
    (sum, b) => sum + b.overview.averageSessionDurationSeconds * b.overview.totalSessions,
    0
  );
  const weightedResolution = bots.reduce(
    (sum, b) => sum + b.overview.resolutionRate * b.overview.totalSessions,
    0
  );
  const weightedEscalation = bots.reduce(
    (sum, b) => sum + b.overview.escalationRate * b.overview.totalSessions,
    0
  );

  // Aggregate sentiment
  const totalPositive = bots.reduce((sum, b) => sum + b.sentiment.positive, 0);
  const totalNeutral = bots.reduce((sum, b) => sum + b.sentiment.neutral, 0);
  const totalNegative = bots.reduce((sum, b) => sum + b.sentiment.negative, 0);
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
 * Calculate cost metrics per bot
 */
export function calculateBotCosts(bot: BotWithMetrics): {
  chatCost: number;
  analysisCost: number;
  totalCost: number;
  costPerSession: number;
} {
  const chatCost = bot.sessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
  const analysisCost = bot.sessions.reduce(
    (sum, s) => sum + (s.analysis?.analytics_total_cost_eur || 0),
    0
  );
  const totalCost = chatCost + analysisCost;
  const costPerSession = bot.overview.totalSessions > 0 ? totalCost / bot.overview.totalSessions : 0;

  return { chatCost, analysisCost, totalCost, costPerSession };
}

/**
 * Calculate return rate (new vs returning users) from sessions
 */
export function calculateReturnRate(bot: BotWithMetrics): {
  newUsers: number;
  returningUsers: number;
  returnRate: number;
} {
  const newUsers = bot.sessions.filter((s) => s.glb_source === 'cdn_fetch').length;
  const returningUsers = bot.sessions.filter((s) => s.glb_source === 'memory_cache').length;
  const total = newUsers + returningUsers;
  const returnRate = total > 0 ? (returningUsers / total) * 100 : 0;

  return { newUsers, returningUsers, returnRate };
}

/**
 * Calculate resolution breakdown from sessions
 */
export function calculateResolutionBreakdown(bot: BotWithMetrics): {
  resolved: number;
  partial: number;
  unresolved: number;
  escalated: number;
} {
  const resolved = bot.sessions.filter((s) => s.analysis?.resolution_status === 'resolved').length;
  const partial = bot.sessions.filter((s) => s.analysis?.resolution_status === 'partial').length;
  const unresolved = bot.sessions.filter((s) => s.analysis?.resolution_status === 'unresolved').length;
  const escalated = bot.sessions.filter((s) => s.analysis?.escalated === true).length;

  return { resolved, partial, unresolved, escalated };
}

/**
 * Calculate URL and email handoffs from sessions
 */
export function calculateHandoffs(bot: BotWithMetrics): {
  urlHandoffs: number;
  emailHandoffs: number;
} {
  const urlHandoffs = bot.sessions.filter((s) => s.analysis?.forwarded_url === true).length;
  const emailHandoffs = bot.sessions.filter((s) => s.analysis?.forwarded_email === true).length;

  return { urlHandoffs, emailHandoffs };
}

/**
 * Get top browser from sessions
 */
export function getTopBrowser(bot: BotWithMetrics): string {
  const browserCounts: Record<string, number> = {};
  bot.sessions.forEach((s) => {
    const browser = s.browser_name || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });

  const sorted = Object.entries(browserCounts).sort(([, a], [, b]) => b - a);
  return sorted.length > 0 ? sorted[0][0] : '-';
}

/**
 * Generate time series chart data for multiple bots
 * Returns data formatted for MultiLineChart with one line per bot
 */
export function generateMultiBotTimeSeries(
  bots: BotWithMetrics[],
  metric: 'sessions' | 'cost' | 'tokens' | 'messages'
): { date: string; [botName: string]: number | string }[] {
  // Collect all unique dates
  const allDates = new Set<string>();
  bots.forEach((bot) => {
    bot.timeSeries.forEach((point) => {
      allDates.add(point.date);
    });
  });

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Build chart data
  return sortedDates.map((date) => {
    const dataPoint: { date: string; [botName: string]: number | string } = { date };

    bots.forEach((bot) => {
      const point = bot.timeSeries.find((p) => p.date === date);
      dataPoint[bot.botName] = point ? point[metric] : 0;
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
