/**
 * Supabase Client Configuration
 *
 * Server-side Supabase client for database operations.
 * Uses service role key for admin operations (RLS bypass when needed).
 *
 * IMPORTANT: This file should only be imported from server-side code.
 * The service role key must NEVER be exposed to the client.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ClientLabel = 'PROD' | 'DEMO';

function createAdminClient(url: string | undefined, serviceKey: string | undefined, label: ClientLabel) {
  if (!url || !serviceKey) {
    console.warn(`[Supabase:${label}] not configured - falling back to mock`);
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createAnonClient(url: string | undefined, anonKey: string | undefined, label: ClientLabel) {
  if (!url || !anonKey) {
    console.warn(`[Supabase:${label}] anon client not configured`);
    return null;
  }

  return createClient(url, anonKey);
}

// Production Supabase (real customers)
const supabaseProdUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseProdServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseProdAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseAdminProd = createAdminClient(supabaseProdUrl, supabaseProdServiceKey, 'PROD');
export const supabaseClientProd = createAnonClient(supabaseProdUrl, supabaseProdAnonKey, 'PROD');

// Demo Supabase (demo customers)
const supabaseDemoUrl = process.env.DEMO_SUPABASE_URL || process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL;
const supabaseDemoServiceKey = process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY;
const supabaseDemoAnonKey = process.env.DEMO_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY;

export const supabaseAdminDemo = createAdminClient(supabaseDemoUrl, supabaseDemoServiceKey, 'DEMO');
export const supabaseClientDemo = createAnonClient(supabaseDemoUrl, supabaseDemoAnonKey, 'DEMO');

/**
 * Get a client for a specific user session
 * This respects RLS policies based on the user's JWT
 */
export function getSupabaseClientForUser(
  accessToken: string,
  options: { label?: ClientLabel; url?: string; anonKey?: string } = {}
): SupabaseClient {
  const url = options.url || supabaseProdUrl;
  const anonKey = options.anonKey || supabaseProdAnonKey;
  const label = options.label || 'PROD';

  if (!url || !anonKey) {
    throw new Error(`[Supabase:${label}] not configured`);
  }

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
