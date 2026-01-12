/**
 * @fileoverview Client Selection API Route
 *
 * Allows superadmins to select which client to work with.
 * Updates the session cookie with the selected client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth.server';
import { encodeSessionCookie } from '@/lib/session-cookie';
import type { AuthSession } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isValid) {
      return NextResponse.json(
        {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Only superadmins can select clients
    if (!session.isSuperadmin) {
      return NextResponse.json(
        {
          code: 'FORBIDDEN',
          message: 'Only superadmins can switch clients',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { clientSlug } = body;

    if (!clientSlug || typeof clientSlug !== 'string') {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'clientSlug is required',
        },
        { status: 400 }
      );
    }

    // Validate that client exists
    const client = await db.clients.getBySlug(clientSlug);

    if (!client) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found',
        },
        { status: 404 }
      );
    }

    // Validate that superadmin has access to this client
    if (session.platformUserId) {
      const user = await db.users.getByIdWithAuth(session.platformUserId);

      if (!user) {
        return NextResponse.json(
          {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          { status: 404 }
        );
      }

      // Check accessible_client_slugs
      if (user.accessibleClientSlugs !== null) {
        // NULL = access to all, so only check if it's an array
        if (user.accessibleClientSlugs.length === 0) {
          // Empty array = no access
          return NextResponse.json(
            {
              code: 'NO_CLIENT_ACCESS',
              message: 'No clients accessible for this account',
            },
            { status: 403 }
          );
        }

        // Check if requested client is in the allowed list
        if (!user.accessibleClientSlugs.includes(clientSlug)) {
          return NextResponse.json(
            {
              code: 'CLIENT_ACCESS_DENIED',
              message: 'You do not have access to this client',
            },
            { status: 403 }
          );
        }
      }
      // If NULL, superadmin has access to all clients - allow
    }

    // Update session with selected client
    const updatedSession: AuthSession = {
      ...session,
      clientId: client.id,
      clientSlug: client.slug,
      defaultWorkspaceId: client.defaultWorkspaceId,
    };

    // Remove isValid from session before storing
    const { isValid, ...sessionToStore } = updatedSession as AuthSession & { isValid?: boolean };

    // Set updated session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, encodeSessionCookie(sessionToStore), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    // Return success with redirect URL
    return NextResponse.json({
      data: {
        success: true,
        redirectUrl: `/app/${client.slug}/home`,
        client: (() => {
          const { login, ...rest } = client;
          return rest;
        })(),
      },
    });
  } catch (error) {
    console.error('Select client error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred selecting client',
      },
      { status: 500 }
    );
  }
}
