/**
 * Data Access Layer
 *
 * Centralized data access with environment-based switching between
 * mock data (for development) and Supabase (for production).
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const client = await db.clients.getById('demo-jumbo');
 *
 * For analytics with hybrid routing (demo vs real clients):
 *   import { analytics, getAnalyticsForClient } from '@/lib/db';
 *   const clientAnalytics = getAnalyticsForClient('demo-jumbo'); // Uses mock
 *   const realAnalytics = getAnalyticsForClient('real-client');  // Uses Supabase
 *
 * Toggle via environment:
 *   USE_MOCK_DATA=true  -> Uses JSON files from public/data/
 *   USE_MOCK_DATA=false -> Uses Supabase (default in production)
 */

import * as mockDb from './mock';
import * as supabaseDb from './supabase';
import { isDemoClient, isSupabaseConfigured, shouldUseMockData } from './config';
import type { DbOperations } from './types';

export type { DbClient, DbOperations } from './types';

// Determine which implementation to use
const supabaseConfigured = isSupabaseConfigured();
const useMockData = shouldUseMockData();

function getBaseDb(): DbOperations {
  if (useMockData) return mockDb;
  if (supabaseConfigured) return supabaseDb;
  console.warn('[DB] Supabase not configured, falling back to mock data');
  return mockDb;
}

/**
 * Get the appropriate DB implementation for a client.
 * Demo clients always use mock data. Real clients use Supabase when available,
 * otherwise fall back to mock.
 */
export function getDbForClient(clientId: string): DbOperations {
  if (isDemoClient(clientId)) {
    return mockDb;
  }
  return getBaseDb();
}

// Export the default implementation (use client-aware helpers when possible)
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

// Analytics data layer with hybrid routing
export {
  analytics,
  getAnalyticsForClient,
  getAnalyticsForAssistant,
  isDemoClient,
  mockAnalytics,
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
  const source = useMockData
    ? 'MOCK (forced)'
    : supabaseConfigured
      ? 'SUPABASE'
      : 'MOCK (supabase not configured)';
  console.log(`[DB] Using ${source} data source`);
}
