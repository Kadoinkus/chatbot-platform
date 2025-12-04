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
import { loadClients } from '@/lib/dataLoader.server';
import type { AuthSession } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// TODO: Replace with signed JWT before production
// TODO: Add rate limiting before production

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Load clients and find matching credentials
    const clients = await loadClients();
    const client = clients.find(
      c => c.login.email === email && c.login.password === password
    );

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
      userId: `user_${client.id}_owner`, // Mock user ID for now
      role: 'owner',
      defaultWorkspaceId: client.defaultWorkspaceId,
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
