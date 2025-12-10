/**
 * @fileoverview Auth Login API Route
 *
 * ⚠️  SECURITY WARNING - MOCK IMPLEMENTATION ONLY ⚠️
 *
 * This implementation has known security issues that MUST be fixed before production:
 *
 * 1. UNSIGNED COOKIE: Session is stored as plain JSON with no signature/encryption.
 *    Users can forge cookies to impersonate any client/role.
 *    FIX: Use signed JWT or Supabase Auth tokens.
 *
 * 2. PLAINTEXT PASSWORDS: Credentials are read from JSON files with no hashing.
 *    FIX: Migrate to Supabase Auth which handles password hashing.
 *
 * 3. NO RATE LIMITING: No protection against brute force attacks.
 *    FIX: Add rate limiting (e.g., @upstash/ratelimit).
 *
 * See: docs/SECURITY_NOTES.md for full details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';
import { supabaseClient } from '@/lib/db/supabase/client';
import { LoginRequestSchema, formatZodErrors } from '@/lib/schemas';
import type { AuthSession } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Get demo credentials at runtime (not at module load time)
function getDemoCredentials(): Record<string, { email: string; password: string; clientSlug: string }> {
  const credentials: Record<string, { email: string; password: string; clientSlug: string }> = {};

  const jumboEmail = process.env.DEMO_JUMBO_EMAIL;
  const jumboPassword = process.env.DEMO_JUMBO_PASSWORD;
  if (jumboEmail && jumboPassword) {
    credentials[jumboEmail] = {
      email: jumboEmail,
      password: jumboPassword,
      clientSlug: 'demo-jumbo',
    };
  }

  const hitapesEmail = process.env.DEMO_HITAPES_EMAIL;
  const hitapesPassword = process.env.DEMO_HITAPES_PASSWORD;
  if (hitapesEmail && hitapesPassword) {
    credentials[hitapesEmail] = {
      email: hitapesEmail,
      password: hitapesPassword,
      clientSlug: 'demo-hitapes',
    };
  }

  return credentials;
}

// TODO: Replace with signed JWT before production
// TODO: Add rate limiting before production

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = LoginRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          errors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Resolve client and authenticate:
    // - Demo clients: check credentials from environment variables
    // - Real clients: use Supabase auth when configured
    const db = getDbForClient(''); // default DB selection
    const [clientsBase, clientsMock] = await Promise.all([
      db.clients.getAll(),
      mockDb.clients.getAll(),
    ]);
    const allClients = [...clientsBase, ...clientsMock];

    // Demo path: check credentials from environment variables (not from JSON)
    const demoCredentials = getDemoCredentials();
    const demoCred = demoCredentials[email];

    // Debug logging (only in development)
    if (process.env.ENABLE_DEBUG_LOGGING === 'true') {
      console.log('[Login] Attempting login for:', email);
      console.log('[Login] Demo credentials configured:', Object.keys(demoCredentials));
      console.log('[Login] Demo match found:', !!demoCred);
    }

    const demoMatch = demoCred && demoCred.password === password
      ? allClients.find(c => c.slug === demoCred.clientSlug)
      : null;

    let client = demoMatch || null;
    let supabaseUserId: string | null = null;

    if (!demoMatch) {
      // Attempt Supabase auth for real clients
      if (!supabaseClient) {
        return NextResponse.json(
          {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return NextResponse.json(
          {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }

      supabaseUserId = data.session.user.id;

      // Find client by email (or domain) in client list
      const emailLower = email.toLowerCase();
      client =
        allClients.find(c => (c.email || '').toLowerCase() === emailLower) ||
        allClients.find(c => (c.login?.email || '').toLowerCase() === emailLower) ||
        null;

      if (!client) {
        return NextResponse.json(
          {
            code: 'CLIENT_NOT_FOUND',
            message: 'Authenticated user is not linked to a client',
          },
          { status: 403 }
        );
      }
    }

    if (!client) {
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Create session
    const session: AuthSession = {
      clientId: client.id,
      clientSlug: client.slug,
      userId: supabaseUserId || `user_${client.id}_owner`, // Supabase user id when available
      role: 'owner', // Future: derive from Supabase role/claims
      defaultWorkspaceId: client.defaultWorkspaceId,
      // Future: include source flag to distinguish supabase vs mock
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    // Return session and client data (without password)
    const { login, ...clientData } = client;

    return NextResponse.json({
      data: {
        session,
        client: clientData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
