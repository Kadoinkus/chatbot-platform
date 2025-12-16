/**
 * Data source configuration
 *
 * Single Supabase data source. Demo clients live in the same instance as real clients.
 */

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key, anon } = getSupabaseConfig() as { url?: string; key?: string; anon?: string };
  return Boolean(url && (key || anon));
}

export function isAnySupabaseConfigured(): boolean {
  return isSupabaseConfigured();
}

/**
 * Determines whether we should force mock data. Defaults to Supabase.
 */
export function shouldUseMockData(): boolean {
  return false; // mock disabled in simplified architecture
}
