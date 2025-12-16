/**
 * @fileoverview Auth Login API Route
 *
 * Handles authentication via Supabase Auth (single instance).
 * Supports superadmin multi-client access.
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

    // If auth failed, return error
    if (!supabaseUserId) {
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Look up user in users table to check role and accessible clients
    const user = await db.users.getByEmail(email);

    // Check if user is superadmin
    if (user?.role === 'superadmin') {
      // SUPERADMIN: Skip email-to-client match, use accessible_client_slugs
      let accessibleClients: Client[];

      if (user.accessibleClientSlugs === null) {
        // NULL = access to ALL clients
        accessibleClients = await db.clients.getAll();
      } else if (user.accessibleClientSlugs.length === 0) {
        // Empty array = NO access (block login)
        return NextResponse.json(
          {
            code: 'NO_CLIENT_ACCESS',
            message: 'No clients accessible for this account',
          },
          { status: 403 }
        );
      } else {
        // Specific client slugs
        accessibleClients = await db.clients.getBySlugs(user.accessibleClientSlugs);
      }

      if (accessibleClients.length === 0) {
        return NextResponse.json(
          {
            code: 'NO_CLIENT_ACCESS',
            message: 'No clients accessible for this account',
          },
          { status: 403 }
        );
      }

      let session: AuthSession;
      let redirectUrl: string;

      if (accessibleClients.length === 1) {
        // Auto-select single client
        const client = accessibleClients[0];
        session = {
          clientId: client.id,
          clientSlug: client.slug,
          userId: supabaseUserId,
          platformUserId: user.id,
          role: 'superadmin',
          defaultWorkspaceId: client.defaultWorkspaceId,
          authSource: 'prod',
          isSuperadmin: true,
        };
        redirectUrl = `/app/${client.slug}/home`;
      } else {
        // Multiple clients - partial session, redirect to picker
        session = {
          clientId: '',
          clientSlug: '',
          userId: supabaseUserId,
          platformUserId: user.id,
          role: 'superadmin',
          authSource: 'prod',
          isSuperadmin: true,
        };
        redirectUrl = '/select-client';
      }

      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      // Return session with redirect info
      return NextResponse.json({
        data: {
          session,
          client: accessibleClients.length === 1 ? accessibleClients[0] : null,
          redirectUrl,
          requiresClientSelection: accessibleClients.length > 1,
        },
      });
    }

    // REGULAR USER: Match email to single client (original flow)
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

    // Create session for regular user
    // Map TeamRole to UserRole (fallback to 'owner' if not found)
    const roleMap: Record<string, AuthSession['role']> = {
      admin: 'admin',
      manager: 'admin',
      agent: 'member',
      viewer: 'viewer',
    };
    const session: AuthSession = {
      clientId: client.id,
      clientSlug: client.slug,
      userId: supabaseUserId,
      role: user?.role ? (roleMap[user.role] || 'owner') : 'owner',
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
        redirectUrl: `/app/${client.slug}/home`,
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
