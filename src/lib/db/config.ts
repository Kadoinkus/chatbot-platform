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

// Include both slugs and UUIDs for built-in demo clients so id-based lookups
// (e.g., session.clientId) are treated as demo as well.
const defaultDemoIds = [
  'demo-jumbo',
  'demo-hitapes',
  'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', // Jumbo demo id
  'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', // HiTapes demo id
];

// Always include the default demo ids; allow env to add more but not remove UUID variants
export const DEMO_CLIENT_IDS = Array.from(new Set([...defaultDemoIds, ...envDemoIds]));
const demoClientSet = new Set(DEMO_CLIENT_IDS.map((id) => id.toLowerCase()));

export function isDemoClient(clientId: string): boolean {
  return demoClientSet.has((clientId || '').toLowerCase());
}

function getSupabaseConfig(target: 'prod' | 'demo') {
  if (target === 'demo') {
    return {
      url: process.env.DEMO_SUPABASE_URL || process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL,
      key: process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isSupabaseConfigured(target: 'prod' | 'demo' = 'prod'): boolean {
  const { url, key } = getSupabaseConfig(target);
  return Boolean(url && key);
}

export function isAnySupabaseConfigured(): boolean {
  return isSupabaseConfigured('prod') || isSupabaseConfigured('demo');
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
  return process.env.NODE_ENV === 'development' && !isAnySupabaseConfigured();
}
