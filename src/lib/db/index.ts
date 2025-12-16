/**
 * Data Access Layer
 *
 * Centralized data access with a single Supabase data source.
 * Demo clients live in the same Supabase instance as real clients.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const client = await db.clients.getById('jumboDemo');
 *
 */

import { supabaseProdDb } from './supabase';
import { isSupabaseConfigured, shouldUseMockData } from './config';
import type { DbOperations } from './types';

export type { DbClient, DbOperations } from './types';

const useMockData = false; // mock disabled in simplified architecture
const prodSupabaseConfigured = isSupabaseConfigured();

function getBaseDb(): DbOperations {
  return prodSupabaseConfigured ? supabaseProdDb : supabaseProdDb;
}

/**
 * Get the appropriate DB implementation for a client.
 * All clients (including demo) use the same data source based on environment config.
 */
export function getDbForClient(_clientId: string): DbOperations {
  return getBaseDb();
}

// Export the default implementation
export const db = getBaseDb();

// Re-export for convenience
export const {
  clients,
  assistants,
  workspaces,
  users,
  conversations,
  messages,
  sessions,
  metrics,
} = db;

// Analytics data layer
export {
  analytics,
  getAnalyticsForClient,
  getAnalyticsForAssistant,
  supabaseAnalytics,
} from './analytics';

// Re-export analytics types
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
} from './analytics';

// Log which mode we're using (server-side only, won't show in browser)
if (typeof window === 'undefined') {
  const source = prodSupabaseConfigured ? 'SUPABASE' : 'SUPABASE (not configured?)';
  console.log(`[DB] Using ${source} data source`);
}
