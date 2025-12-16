/**
 * @fileoverview Auth Login API Route
 *
 * Handles authentication via Supabase Auth (single instance).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { supabaseClientProd } from '@/lib/db/supabase/client';
import { LoginRequestSchema, formatZodErrors } from '@/lib/schemas';
import type { AuthSession, Client } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

    let supabaseUserId: string | null = null;
    // Single Supabase auth
    if (supabaseClientProd) {
      const { data, error } = await supabaseClientProd.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        supabaseUserId = data.session.user.id;
      }
    }

    // If neither auth succeeded, return error
    if (!supabaseUserId) {
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Find client by email in database
    const allClients = await db.clients.getAll();
    const emailLower = email.toLowerCase();
    const client: Client | undefined = allClients.find(
      (c) => (c.email || '').toLowerCase() === emailLower
    );

    if (!client) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: 'Authenticated user is not linked to a client',
        },
        { status: 403 }
      );
    }

    // Create session
    const session: AuthSession = {
      clientId: client.id,
      clientSlug: client.slug,
      userId: supabaseUserId,
      role: 'owner', // Future: derive from Supabase role/claims
      defaultWorkspaceId: client.defaultWorkspaceId,
      authSource: 'prod',
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

    // Return session and client data
    return NextResponse.json({
      data: {
        session,
        client,
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
