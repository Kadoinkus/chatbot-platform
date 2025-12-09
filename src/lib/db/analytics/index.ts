/**
 * Analytics Data Layer
 *
 * Hybrid data layer that routes between mock and Supabase based on client ID.
 * - Demo clients (demo-jumbo, demo-hitapes) always use mock data
 * - Real clients use Supabase
 *
 * Usage:
 *   import { analytics } from '@/lib/db/analytics';
 *   const metrics = await analytics.aggregations.getOverviewByBotId('m1');
 *
 * Or use client-aware functions:
 *   import { getAnalyticsForClient } from '@/lib/db/analytics';
 *   const { chatSessions, analyses, aggregations } = getAnalyticsForClient('demo-jumbo');
 */

import * as mockAnalytics from './mock';
import * as supabaseAnalytics from './supabase';
import { isDemoClient, isSupabaseConfigured } from '../config';
import type { AnalyticsOperations } from './types';

/**
 * Get the appropriate analytics implementation for a client
 * - Demo clients always get mock data
 * - Real clients get Supabase (if configured) or fall back to mock
 */
export function getAnalyticsForClient(clientId: string): AnalyticsOperations {
  if (isDemoClient(clientId)) {
    return mockAnalytics;
  }

  // For real clients, use Supabase if configured
  if (isSupabaseConfigured()) {
    return supabaseAnalytics;
  }

  // Fall back to mock if Supabase not configured (development)
  console.warn('[Analytics] Supabase not configured, falling back to mock data');
  return mockAnalytics;
}

/**
 * Get the appropriate analytics implementation for an assistant
 * Requires looking up the client ID first, or you can pass it directly
 */
export async function getAnalyticsForAssistant(
  assistantId: string,
  clientId?: string
): Promise<AnalyticsOperations> {
  if (clientId) {
    return getAnalyticsForClient(clientId);
  }

  // If no clientId provided, check mock data to determine if it's a demo assistant
  // This is a fallback - ideally clientId should always be provided
  const sessions = await mockAnalytics.chatSessions.getByBotId(assistantId);
  if (sessions.length > 0) {
    const firstClientId = sessions[0].client_slug;
    if (isDemoClient(firstClientId)) {
      return mockAnalytics;
    }
  }

  // Default to Supabase if configured
  if (isSupabaseConfigured()) {
    return supabaseAnalytics;
  }

  return mockAnalytics;
}

// Export default analytics (for when you know the client context)
// Default picks Supabase when configured, otherwise falls back to mock
export const analytics: AnalyticsOperations = isSupabaseConfigured() ? supabaseAnalytics : mockAnalytics;

// Re-export types
export type {
  AnalyticsOperations,
  ChatSessionOperations,
  ChatSessionAnalysisOperations,
  AnalyticsAggregations,
  ChatSessionFilters,
  DateRange,
  OverviewMetrics,
  SentimentBreakdown,
  CategoryBreakdown,
  LanguageBreakdown,
  DeviceBreakdown,
  CountryBreakdown,
  TimeSeriesDataPoint,
  QuestionAnalytics,
  SentimentTimeSeriesDataPoint,
  HourlyBreakdown,
  EngagementBreakdown,
  ConversationTypeBreakdown,
  AnimationStats,
  ChatMessage,
} from './types';

// Export both implementations for direct access if needed
export { mockAnalytics, supabaseAnalytics };
// Re-export demo helper so consumers don't need to import config directly
export { isDemoClient } from '../config';
