/**
 * ⚠️  SECURITY WARNING - MOCK IMPLEMENTATION ONLY ⚠️
 * Session cookie is NOT signed/verified. See docs/SECURITY_NOTES.md
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, getDbForClient } from '@/lib/db';
import type { Client } from '@/types';
import { decodeSessionCookie } from '@/lib/session-cookie';

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

    const session = decodeSessionCookie(sessionCookie.value);
    if (!session) {
      return NextResponse.json({
        data: {
          session: null,
          client: null,
        },
      });
    }

    // For superadmins without selected client, return session with accessible clients
    if (session.isSuperadmin && !session.clientSlug) {
      // Look up the user by platformUserId to get their accessible_client_slugs
      let accessibleClients: Client[] = [];

      if (session.platformUserId) {
        const user = await db.users.getByIdWithAuth(session.platformUserId);

        if (user) {
          if (user.accessibleClientSlugs === null) {
            // NULL = access to all clients
            accessibleClients = await db.clients.getAll();
          } else if (user.accessibleClientSlugs.length === 0) {
            // Empty array = no access (should not happen, blocked at login)
            return NextResponse.json(
              {
                code: 'NO_CLIENT_ACCESS',
                message: 'No clients accessible for this account',
              },
              { status: 403 }
            );
          } else {
            // Specific client slugs only
            accessibleClients = await db.clients.getBySlugs(user.accessibleClientSlugs);
          }
        }
      }

      return NextResponse.json({
        data: {
          session,
          client: null,
          accessibleClients: accessibleClients.map(({ login, ...c }) => c),
          requiresClientSelection: true,
        },
      });
    }

    // Get client data - use client-aware db to route demo clients to mock data
    // Use clientSlug to determine which DB (demo clients are identified by slug pattern)
    const clientDb = getDbForClient(session.clientSlug || session.clientId);
    const client = session.clientId ? await clientDb.clients.getById(session.clientId) : null;

    if (!client && session.clientId) {
      // Client no longer exists, clear session
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json({
        data: {
          session: null,
          client: null,
        },
      });
    }

    // For superadmins with selected client, also return accessible clients for the switcher
    let accessibleClients: Client[] | undefined;
    if (session.isSuperadmin && session.platformUserId) {
      const user = await db.users.getByIdWithAuth(session.platformUserId);

      if (user) {
        if (user.accessibleClientSlugs === null) {
          // NULL = access to all clients
          const allClients = await db.clients.getAll();
          accessibleClients = allClients.map(({ login, ...c }) => c) as Client[];
        } else if (user.accessibleClientSlugs.length > 0) {
          // Specific client slugs only
          const filteredClients = await db.clients.getBySlugs(user.accessibleClientSlugs);
          accessibleClients = filteredClients.map(({ login, ...c }) => c) as Client[];
        }
        // Empty array = no clients to show in switcher
      }
    }

    // Return session and client (without password)
    const clientData = client ? (() => {
      const { login, ...rest } = client;
      return rest;
    })() : null;

    return NextResponse.json({
      data: {
        session,
        client: clientData,
        ...(accessibleClients && { accessibleClients }),
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
