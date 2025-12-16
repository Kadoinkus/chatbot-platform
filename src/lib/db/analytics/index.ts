/**
 * Analytics Data Layer
 *
 * Centralized analytics data access with a single Supabase data source.
 * Demo clients live in the same Supabase instance as real clients.
 *
 * Usage:
 *   import { analytics } from '@/lib/db/analytics';
 *   const metrics = await analytics.aggregations.getOverviewByBotId('jumboDemo-ma-001');
 *
 * Or use client-aware functions:
 *   import { getAnalyticsForClient } from '@/lib/db/analytics';
 *   const { chatSessions, analyses, aggregations } = getAnalyticsForClient('jumboDemo');
 */

import { createSupabaseAnalytics } from './supabase';
import { isSupabaseConfigured } from '../config';
import { supabaseAdminProd, supabaseClientProd } from '../supabase/client';
import type { AnalyticsOperations } from './types';

// Prefer admin (service role) but allow anon client if that's all we have (read-only)
const supabaseProdAnalytics = createSupabaseAnalytics(supabaseAdminProd ?? supabaseClientProd, 'PROD');

/**
 * Get the base analytics implementation based on environment config.
 */
function getBaseAnalytics(): AnalyticsOperations {
  return supabaseProdAnalytics;
}

/**
 * Get the appropriate analytics implementation for a client.
 * All clients (including demo) use the same data source based on environment config.
 */
export function getAnalyticsForClient(_clientId: string): AnalyticsOperations {
  return getBaseAnalytics();
}

/**
 * Get the appropriate analytics implementation for an assistant.
 * All assistants use the same data source based on environment config.
 */
export async function getAnalyticsForAssistant(
  _assistantId: string,
  _clientId?: string
): Promise<AnalyticsOperations> {
  return getBaseAnalytics();
}

// Export default analytics based on environment config
export const analytics: AnalyticsOperations = getBaseAnalytics();

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
export { supabaseProdAnalytics as supabaseAnalytics };
