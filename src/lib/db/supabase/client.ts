/**
 * Supabase Client Configuration
 *
 * Server-side Supabase client for database operations.
 * Uses service role key for admin operations (RLS bypass when needed).
 *
 * IMPORTANT: This file should only be imported from server-side code.
 * The service role key must NEVER be exposed to the client.
 */

import { createClient } from '@supabase/supabase-js';

// These will be populated from environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('[Supabase] SUPABASE_URL not configured - using mock data');
}

/**
 * Admin client with service role key
 * Use this for server-side operations that need to bypass RLS
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Standard client with anon key
 * Use this for operations that should respect RLS
 */
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get a client for a specific user session
 * This respects RLS policies based on the user's JWT
 */
export function getSupabaseClientForUser(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
