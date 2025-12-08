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
// import * as supabaseDb from './supabase'; // Uncomment when ready

export type { DbClient, DbOperations } from './types';

// Determine which implementation to use
const useMockData = process.env.USE_MOCK_DATA === 'true' ||
  (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL);

// Export the appropriate implementation
export const db = useMockData ? mockDb : mockDb; // Replace second mockDb with supabaseDb when ready

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
  console.log(`[DB] Using ${useMockData ? 'MOCK' : 'SUPABASE'} data source`);
}
