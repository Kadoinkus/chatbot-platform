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
import type { AnalyticsOperations } from './types';

// Demo client IDs that should always use mock data
const DEMO_CLIENT_IDS = ['demo-jumbo', 'demo-hitapes'];

/**
 * Check if a client is a demo account
 */
export function isDemoClient(clientId: string): boolean {
  return DEMO_CLIENT_IDS.includes(clientId);
}

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

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
// Default to mock for safety - use getAnalyticsForClient() for proper routing
export const analytics: AnalyticsOperations = mockAnalytics;

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
