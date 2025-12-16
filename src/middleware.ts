/**
 * @fileoverview Next.js Middleware for Route Protection
 *
 * ⚠️  SECURITY WARNING - MOCK IMPLEMENTATION ONLY ⚠️
 *
 * This middleware has known security issues that MUST be fixed before production:
 *
 * 1. UNSIGNED COOKIE: Session is parsed from plain JSON cookie with no verification.
 *    Users can forge cookies to access any tenant's data.
 *    FIX: Verify signed JWT or Supabase session token.
 *
 * 2. NO TENANT VALIDATION: Only checks if clientId in URL matches cookie.
 *    No server-side verification that user belongs to the tenant.
 *    FIX: Validate user-tenant relationship against database.
 *
 * See: docs/SECURITY_NOTES.md for full details.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AuthSession } from '@/types';

const SESSION_COOKIE_NAME = 'notsoai-session';

// Routes that require authentication
const PROTECTED_ROUTES = ['/app', '/profile'];

// Routes that should redirect to app if already authenticated
const AUTH_ROUTES = ['/login'];

// Superadmin-only routes
const SUPERADMIN_ROUTES = ['/select-client'];

/**
 * Parse session from request cookies (edge-compatible)
 */
function getSessionFromCookie(request: NextRequest): AuthSession | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as AuthSession;

    if (!session.userId) {
      return null;
    }
    if (!session.isSuperadmin && !session.clientId) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = getSessionFromCookie(request);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isSuperadminRoute = SUPERADMIN_ROUTES.some(route => pathname === route);

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with valid session, redirect to app
  if (isAuthRoute && session) {
    if (session.isSuperadmin && !session.clientSlug) {
      return NextResponse.redirect(new URL('/select-client', request.url));
    }
    return NextResponse.redirect(new URL(`/app/${session.clientSlug}/home`, request.url));
  }

  // Handle superadmin routes (like /select-client)
  if (isSuperadminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!session.isSuperadmin) {
      return NextResponse.redirect(new URL(`/app/${session.clientSlug}/home`, request.url));
    }
  }

  // Superadmin accessing /app without selected client -> redirect to select-client
  if (isProtectedRoute && session?.isSuperadmin && !session.clientSlug && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/select-client', request.url));
  }

  // Validate clientId in URL matches session
  if (isProtectedRoute && session && pathname.startsWith('/app/')) {
    const pathParts = pathname.split('/');
    const urlClientId = pathParts[2];

    const isWrongTenant =
      urlClientId &&
      urlClientId !== session.clientId &&
      urlClientId !== session.clientSlug;

    const isUuidWhenSlugAvailable =
      urlClientId &&
      session.clientSlug &&
      urlClientId === session.clientId &&
      session.clientSlug !== session.clientId;

    if (isWrongTenant || isUuidWhenSlugAvailable) {
      const correctUrl = new URL(
        pathname.replace(`/app/${urlClientId}`, `/app/${session.clientSlug}`),
        request.url
      );
      return NextResponse.redirect(correctUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/profile/:path*',
    '/login',
    '/select-client',
  ],
};
