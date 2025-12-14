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
import { createSupabaseAnalytics } from './supabase';
import { isDemoClient, isSupabaseConfigured } from '../config';
import { supabaseAdminProd, supabaseAdminDemo } from '../supabase/client';
import type { AnalyticsOperations } from './types';

const supabaseProdAnalytics = createSupabaseAnalytics(supabaseAdminProd, 'PROD');
const supabaseDemoAnalytics = createSupabaseAnalytics(supabaseAdminDemo, 'DEMO');

/**
 * Get the appropriate analytics implementation for a client
 * - Demo clients always get mock data
 * - Real clients get Supabase (if configured) or fall back to mock
 */
export function getAnalyticsForClient(clientId: string): AnalyticsOperations {
  const isDemo = isDemoClient(clientId);
  const prodConfigured = isSupabaseConfigured('prod');
  const demoConfigured = isSupabaseConfigured('demo');

  console.log('[Analytics] getAnalyticsForClient:', {
    clientId,
    isDemo,
    prodConfigured,
    demoConfigured,
  });

  if (isDemo) {
    if (demoConfigured) {
      console.log('[Analytics] Using DEMO Supabase for demo client:', clientId);
      return supabaseDemoAnalytics;
    }
    console.warn('[Analytics] Demo client but DEMO Supabase not configured, falling back to mock');
    return mockAnalytics;
  }

  // For real clients, prefer prod Supabase
  if (prodConfigured) {
    console.log('[Analytics] Using PROD Supabase for client:', clientId);
    return supabaseProdAnalytics;
  }

  // Fall back to demo Supabase if prod not configured (matches core DB behavior)
  if (demoConfigured) {
    console.log('[Analytics] PROD not configured, using DEMO Supabase for client:', clientId);
    return supabaseDemoAnalytics;
  }

  // Fall back to mock if no Supabase configured
  console.warn('[Analytics] No Supabase configured, falling back to mock data');
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
  if (isSupabaseConfigured('prod')) {
    return supabaseProdAnalytics;
  }

  return mockAnalytics;
}

// Export default analytics (for when you know the client context)
// Default picks Supabase when configured, otherwise falls back to mock
export const analytics: AnalyticsOperations = isSupabaseConfigured('prod')
  ? supabaseProdAnalytics
  : isSupabaseConfigured('demo')
    ? supabaseDemoAnalytics
    : mockAnalytics;

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
export {
  mockAnalytics,
  supabaseProdAnalytics as supabaseAnalytics,
  supabaseDemoAnalytics,
};
// Re-export demo helper so consumers don't need to import config directly
export { isDemoClient } from '../config';
