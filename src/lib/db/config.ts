/**
 * Data source configuration
 *
 * Central place to decide which data backend to use (mock vs Supabase)
 * and which clients are treated as demo-only.
 */

// Read demo client IDs from env, fallback to defaults
const envDemoIds = (process.env.DEMO_CLIENT_IDS || process.env.NEXT_PUBLIC_DEMO_CLIENT_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const defaultDemoIds = ['demo-jumbo', 'demo-hitapes'];

export const DEMO_CLIENT_IDS = envDemoIds.length > 0 ? envDemoIds : defaultDemoIds;
const demoClientSet = new Set(DEMO_CLIENT_IDS.map((id) => id.toLowerCase()));

export function isDemoClient(clientId: string): boolean {
  return demoClientSet.has((clientId || '').toLowerCase());
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Determines whether we should force mock data.
 * - USE_MOCK_DATA=true forces mock
 * - USE_MOCK_DATA=false forces Supabase (if configured)
 * - default: mock in dev when Supabase not configured, Supabase otherwise
 */
export function shouldUseMockData(): boolean {
  if (process.env.USE_MOCK_DATA === 'true') return true;
  if (process.env.USE_MOCK_DATA === 'false') return false;
  return process.env.NODE_ENV === 'development' && !isSupabaseConfigured();
}
