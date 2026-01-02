/**
 * Accept Invite API
 *
 * Takes a Supabase access token (from the invite email), validates the user,
 * and issues the platform session cookie so the dashboard can open without
 * asking for credentials again.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { supabaseClientProd } from '@/lib/db/supabase/client';
import type { AuthSession, Client } from '@/types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken: string | undefined = body?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { code: 'MISSING_TOKEN', message: 'Invite token is required' },
        { status: 400 }
      );
    }

    if (!supabaseClientProd) {
      return NextResponse.json(
        { code: 'AUTH_NOT_CONFIGURED', message: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const { data: userData, error: supabaseError } = await supabaseClientProd.auth.getUser(accessToken);
    if (supabaseError || !userData?.user?.email) {
      return NextResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invite link is invalid or expired' },
        { status: 401 }
      );
    }

    const email = userData.user.email.toLowerCase();
    const supabaseUserId = userData.user.id;

    const user = await db.users.getByEmail(email);

    // SUPERADMIN FLOW (reuse login logic)
    if (user?.role === 'superadmin') {
      let accessibleClients: Client[];

      if (user.accessibleClientSlugs === null) {
        accessibleClients = await db.clients.getAll();
      } else if (user.accessibleClientSlugs.length === 0) {
        return NextResponse.json(
          { code: 'NO_CLIENT_ACCESS', message: 'No clients accessible for this account' },
          { status: 403 }
        );
      } else {
        accessibleClients = await db.clients.getBySlugs(user.accessibleClientSlugs);
      }

      if (accessibleClients.length === 0) {
        return NextResponse.json(
          { code: 'NO_CLIENT_ACCESS', message: 'No clients accessible for this account' },
          { status: 403 }
        );
      }

      let session: AuthSession;
      let redirectUrl: string;

      if (accessibleClients.length === 1) {
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

      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      return NextResponse.json({
        data: {
          session,
          client: accessibleClients.length === 1 ? accessibleClients[0] : null,
          redirectUrl,
          requiresClientSelection: accessibleClients.length > 1,
        },
      });
    }

    // REGULAR USER FLOW
    let client: Client | undefined;

    // Prefer explicit mapping from the users table
    if (user?.clientSlug) {
      client = await db.clients.getBySlug(user.clientSlug);
    }

    // Fallback: match by client email (legacy behavior)
    if (!client) {
      const allClients = await db.clients.getAll();
      client = allClients.find((c) => (c.email || '').toLowerCase() === email);
    }

    if (!client) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: 'Authenticated user is not linked to a client',
        },
        { status: 403 }
      );
    }

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

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({
      data: {
        session,
        client,
        redirectUrl: `/app/${client.slug}/home`,
      },
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An error occurred while accepting invite' },
      { status: 500 }
    );
  }
}
