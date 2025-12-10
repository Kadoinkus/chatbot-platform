/**
 * ⚠️  SECURITY WARNING - MOCK IMPLEMENTATION ONLY ⚠️
 * Session cookie is NOT signed/verified. See docs/SECURITY_NOTES.md
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDbForClient } from '@/lib/db';
import type { AuthSession } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';

// TODO: Verify signed JWT before production

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({
        data: {
          session: null,
          client: null,
        },
      });
    }

    let session: AuthSession;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      // Invalid session cookie
      return NextResponse.json({
        data: {
          session: null,
          client: null,
        },
      });
    }

    // Get client data - use client-aware db to route demo clients to mock data
    // Use clientSlug to determine which DB (demo clients are identified by slug pattern)
    const clientDb = getDbForClient(session.clientSlug || session.clientId);
    const client = await clientDb.clients.getById(session.clientId);

    if (!client) {
      // Client no longer exists, clear session
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json({
        data: {
          session: null,
          client: null,
        },
      });
    }

    // Return session and client (without password)
    const { login, ...clientData } = client;

    return NextResponse.json({
      data: {
        session,
        client: clientData,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching session',
      },
      { status: 500 }
    );
  }
}
